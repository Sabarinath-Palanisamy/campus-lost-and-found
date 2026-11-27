package com.lostandfound.controller;

import com.lostandfound.model.ChatMessage;
import com.lostandfound.model.Item;
import com.lostandfound.model.User;
import com.lostandfound.repo.ChatMessageRepository;
import com.lostandfound.repo.ItemRepository;
import com.lostandfound.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;
    private final ItemRepository itemRepo;

    public ChatController(ChatMessageRepository chatRepo, UserRepository userRepo, ItemRepository itemRepo) {
        this.chatRepo = chatRepo;
        this.userRepo = userRepo;
        this.itemRepo = itemRepo;
    }

    private Long getUserId(String token) {
        if (token == null) return null;
        return userRepo.findBySessionToken(token).map(User::getId).orElse(null);
    }

    /**
     * FIXED AUTHORIZATION GUARD:
     * A valid chat about an item must involve two distinct users, 
     * where at least one participant is the owner of the item.
     */
    private boolean isAuthorizedParticipant(Long currentUserId, Item item, Long otherUserId) {
        if (currentUserId == null || otherUserId == null || currentUserId.equals(otherUserId)) {
            return false;
        }
        Long ownerId = item.getUser().getId();
        return currentUserId.equals(ownerId) || otherUserId.equals(ownerId);
    }

    @GetMapping("/{itemId}/{otherUserId}")
    public ResponseEntity<?> getConversation(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @PathVariable Long itemId, 
            @PathVariable Long otherUserId) {
        
        Long currentUserId = getUserId(sessionToken);
        if (currentUserId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Item item = itemRepo.findById(itemId).orElseThrow();
        if (!isAuthorizedParticipant(currentUserId, item, otherUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied"));
        }

        List<ChatMessage> messages = chatRepo.findConversation(itemId, currentUserId, otherUserId);
        
        boolean updated = false;
        for (ChatMessage msg : messages) {
            if (msg.getReceiver().getId().equals(currentUserId) && !msg.getIsRead()) {
                msg.setIsRead(true);
                updated = true;
            }
        }
        if (updated) {
            chatRepo.saveAll(messages);
        }

        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @RequestBody Map<String, Object> payload) {
        
        Long senderId = getUserId(sessionToken);
        if (senderId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long itemId = Long.valueOf(payload.get("itemId").toString());
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        Item item = itemRepo.findById(itemId).orElseThrow();

        if (!isAuthorizedParticipant(senderId, item, receiverId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied"));
        }

        if ("RE".equals(item.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Chat is closed. Item is returned."));
        }

        ChatMessage msg = new ChatMessage();
        msg.setSender(userRepo.findById(senderId).orElseThrow());
        msg.setReceiver(userRepo.findById(receiverId).orElseThrow());
        msg.setItem(item);
        msg.setContent(payload.get("content").toString());
        
        if (payload.containsKey("messageType")) {
            msg.setMessageType(payload.get("messageType").toString());
        }

        return ResponseEntity.ok(chatRepo.save(msg));
    }

    @PostMapping("/{itemId}/handshake")
    public ResponseEntity<?> processReturnHandshake(
            @CookieValue(name = "SESSION_ID", required = false) String sessionToken,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> payload) {
        
        Long userId = getUserId(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Item item = itemRepo.findById(itemId).orElseThrow();
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String action = payload.get("action").toString();

        if (!isAuthorizedParticipant(userId, item, receiverId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ChatMessage systemMsg = new ChatMessage();
        systemMsg.setSender(userRepo.findById(userId).orElseThrow());
        systemMsg.setReceiver(userRepo.findById(receiverId).orElseThrow());
        systemMsg.setItem(item);
        systemMsg.setMessageType("SYSTEM");

        if ("INITIATE".equals(action)) {
            item.setStatus("PR");
            item.setReturnInitiatorId(userId);
            systemMsg.setContent("User initiated the Product Return process. Waiting for acknowledgment.");
        } else if ("ACKNOWLEDGE".equals(action)) {
            item.setStatus("RE");
            systemMsg.setContent("Product Return acknowledged. This chat is now closed.");
        }

        itemRepo.save(item);
        chatRepo.save(systemMsg);
        
        return ResponseEntity.ok(Map.of("status", item.getStatus()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getMyConversations(@CookieValue(name = "SESSION_ID", required = false) String sessionToken) {
        Long userId = getUserId(sessionToken);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<ChatMessage> messages = chatRepo.findBySenderIdOrReceiverIdOrderByCreatedOnDesc(userId, userId);
        Map<String, Map<String, Object>> threads = new LinkedHashMap<>();

        for (ChatMessage msg : messages) {
            // Determine who the *other* person is in this specific message
            User otherUser = msg.getSender().getId().equals(userId) ? msg.getReceiver() : msg.getSender();
            String threadKey = msg.getItem().getId() + "-" + otherUser.getId();

            if (!threads.containsKey(threadKey)) {
                Map<String, Object> threadInfo = new HashMap<>();
                
                // Secure mapping (prevents exposing passwords/tokens)
                threadInfo.put("otherUser", Map.of(
                    "id", otherUser.getId(),
                    "fullName", otherUser.getFullName()
                ));
                
                threadInfo.put("item", Map.of(
                    "id", msg.getItem().getId(),
                    "title", msg.getItem().getTitle(),
                    "itemType", msg.getItem().getItemType(),
                    "status", msg.getItem().getStatus(),
                    "images", msg.getItem().getImages(),
                    "ownerId", msg.getItem().getUser().getId()
                ));
                
                threadInfo.put("lastMessage", msg.getMessageType().equals("TEXT") ? msg.getContent() : "[" + msg.getMessageType() + "]");
                threadInfo.put("lastMessageTime", msg.getCreatedOn());
                
                threads.put(threadKey, threadInfo);
            }
        }
        return ResponseEntity.ok(new ArrayList<>(threads.values()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@CookieValue(name = "SESSION_ID", required = false) String sessionToken) {
        Long currentUserId = getUserId(sessionToken);
        if (currentUserId == null) return ResponseEntity.ok(Map.of("count", 0));
        
        long count = chatRepo.countUnreadMessages(currentUserId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}