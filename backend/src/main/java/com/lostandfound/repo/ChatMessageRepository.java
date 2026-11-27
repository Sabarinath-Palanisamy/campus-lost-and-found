package com.lostandfound.repo;

import com.lostandfound.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT m FROM ChatMessage m WHERE m.item.id = :itemId AND m.isactive = true AND " +
           "((m.sender.id = :userA AND m.receiver.id = :userB) OR " +
           "(m.sender.id = :userB AND m.receiver.id = :userA)) " +
           "ORDER BY m.createdOn ASC")
    List<ChatMessage> findConversation(@Param("itemId") Long itemId, @Param("userA") Long userA, @Param("userB") Long userB);

    List<ChatMessage> findBySenderIdOrReceiverIdOrderByCreatedOnDesc(Long senderId, Long receiverId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver.id = :userId AND m.isRead = false AND m.isactive = true")
    long countUnreadMessages(@Param("userId") Long userId);
}