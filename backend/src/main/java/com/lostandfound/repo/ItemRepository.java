package com.lostandfound.repo;

import com.lostandfound.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByIsactiveTrueOrderByCreatedOnDesc();
    
    // Updated to filter out soft-deleted items from the user's report list
    List<Item> findByUserIdAndIsactiveTrueOrderByCreatedOnDesc(Long userId);
    
    Optional<Item> findBySearchkeyAndIsactiveTrue(String searchkey);
}