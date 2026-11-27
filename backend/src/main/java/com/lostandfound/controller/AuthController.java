package com.lostandfound.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.lostandfound.model.User;
import com.lostandfound.repo.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private void issueSessionCookie(User user, HttpServletResponse response) {
        String token = UUID.randomUUID().toString();
        user.setSessionToken(token);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        Cookie sessionCookie = new Cookie("SESSION_ID", token);
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        response.addCookie(sessionCookie);
    }

    private String verifyFirebasePhoneToken(String idToken) throws Exception {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Missing verification token");
        }
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        Object phoneClaim = decodedToken.getClaims().get("phone_number");
        if (phoneClaim == null) {
            throw new IllegalArgumentException("Token does not contain a verified phone number");
        }
        return phoneClaim.toString(); // Returns E.164 format, e.g., "+919876543210"
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@CookieValue(name = "SESSION_ID", required = false) String sessionToken) {
        if (sessionToken == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return userRepository.findBySessionToken(sessionToken)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String phone = payload.get("phone");
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        String idToken = payload.get("idToken");

        // 1. Verify Firebase Phone Token on the server before creating account
        String verifiedPhone;
        try {
            verifiedPhone = verifyFirebasePhoneToken(idToken);
            if (!verifiedPhone.equals(phone)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Phone number mismatch"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Phone verification failed: " + e.getMessage()));
        }

        if (userRepository.findByPhoneNumber(verifiedPhone).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Phone number already registered"));
        }

        User user = new User();
        user.setFullName(name);
        user.setPhoneNumber(verifiedPhone);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail((email != null && !email.isBlank()) ? email : verifiedPhone + "@temp.com");

        userRepository.save(user);
        issueSessionCookie(user, response);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login-password")
    public ResponseEntity<?> loginWithPassword(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String phone = payload.get("phone");
        String password = payload.get("password");

        Optional<User> userOpt = userRepository.findByPhoneNumber(phone);

        if (userOpt.isEmpty() || userOpt.get().getPassword() == null ||
            !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }

        issueSessionCookie(userOpt.get(), response);
        return ResponseEntity.ok(userOpt.get());
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String phone = payload.get("phone");
        String idToken = payload.get("idToken");

        String verifiedPhone;
        try {
            verifiedPhone = verifyFirebasePhoneToken(idToken);
            if (!verifiedPhone.equals(phone)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Phone number mismatch"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired OTP session"));
        }

        Optional<User> userOpt = userRepository.findByPhoneNumber(verifiedPhone);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Phone number not registered. Please sign up."));
        }

        User user = userOpt.get();
        issueSessionCookie(user, response);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "SESSION_ID", required = false) String sessionToken, HttpServletResponse response) {
        if (sessionToken != null) {
            userRepository.findBySessionToken(sessionToken).ifPresent(user -> {
                user.setSessionToken(null);
                userRepository.save(user);
            });
        }

        Cookie cookie = new Cookie("SESSION_ID", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}