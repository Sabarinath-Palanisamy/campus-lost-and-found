package com.lostandfound.controller;

import com.lostandfound.dto.ItemRequestDTO;
import com.lostandfound.model.Item;
import com.lostandfound.model.User;
import com.lostandfound.service.ItemService;
import com.lostandfound.repo.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final UserRepository userRepository; // Added to verify tokens

    public ItemController(ItemService itemService, UserRepository userRepository) {
        this.itemService = itemService;
        this.userRepository = userRepository;
    }

    // Helper method to convert the secure string token back into a database User ID
    private Long getUserIdFromToken(String sessionToken) {
        if (sessionToken == null) return null;
        Optional<User> userOpt = userRepository.findBySessionToken(sessionToken);
        return userOpt.map(User::getId).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllActiveItems());
    }

    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyReports(@CookieValue(name = "SESSION_ID", required = false) String sessionToken) {
        Long userId = getUserIdFromToken(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        
        List<Item> myItems = itemService.getMyReports(userId);
        return ResponseEntity.ok(myItems);
    }

    @PostMapping
    public ResponseEntity<?> createItem(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @Valid @RequestBody ItemRequestDTO dto) {
        Long userId = getUserIdFromToken(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        
        Item createdItem = itemService.createItem(dto, userId);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @PathVariable Long id, 
            @Valid @RequestBody ItemRequestDTO dto) {
        Long userId = getUserIdFromToken(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        
        try {
            return itemService.updateItem(id, dto, userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @PathVariable Long id) {
        Long userId = getUserIdFromToken(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        
        try {
            if (itemService.softDeleteItem(id, userId)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}