package com.lostandfound.service;

import com.lostandfound.dto.ItemRequestDTO;
import com.lostandfound.model.Category;
import com.lostandfound.model.Item;
import com.lostandfound.model.ItemImage;
import com.lostandfound.model.User;
import com.lostandfound.repo.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> getAllActiveItems() {
        return itemRepository.findByIsactiveTrueOrderByCreatedOnDesc();
    }

    public List<Item> getMyReports(Long userId) {
        // Updated to only fetch active items so deleted ones disappear from the UI
        return itemRepository.findByUserIdAndIsactiveTrueOrderByCreatedOnDesc(userId);
    }

    public Item createItem(ItemRequestDTO dto, Long secureUserId) {
        Item item = new Item();
        
        // SECURE: Binds the item strictly to the authenticated session user
        item.setUser(new User(secureUserId)); 
        item.setCategory(new Category(dto.getCategoryId()));
        item.setTitle(dto.getTitle());
        item.setDescription(dto.getDescription());
        item.setItemType(dto.getItemType());
        item.setLocationName(dto.getLocationName());
        item.setEventDate(dto.getEventDate() != null ? dto.getEventDate() : LocalDateTime.now());
        
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            for (String url : dto.getImageUrls()) {
                ItemImage image = new ItemImage();
                image.setImageUrl(url);
                image.setItem(item); 
                item.getImages().add(image);
            }
        }
        
        return itemRepository.save(item);
    }

    public Optional<Item> updateItem(Long id, ItemRequestDTO dto, Long secureUserId) {
        return itemRepository.findById(id).map(existing -> {
            
            // SECURITY CHECK: Verify Ownership
            if (!existing.getUser().getId().equals(secureUserId)) {
                throw new SecurityException("You do not have permission to modify this item.");
            }

            existing.setCategory(new Category(dto.getCategoryId()));
            existing.setTitle(dto.getTitle());
            existing.setDescription(dto.getDescription());
            existing.setItemType(dto.getItemType());
            existing.setLocationName(dto.getLocationName());
            if (dto.getEventDate() != null) {
                existing.setEventDate(dto.getEventDate());
            }

            existing.getImages().clear();
            
            if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
                for (String url : dto.getImageUrls()) {
                    ItemImage image = new ItemImage();
                    image.setImageUrl(url);
                    image.setItem(existing);
                    existing.getImages().add(image);
                }
            }
            
            return itemRepository.save(existing);
        });
    }

    public boolean softDeleteItem(Long id, Long secureUserId) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            
            // SECURITY CHECK: Verify Ownership
            if (!item.getUser().getId().equals(secureUserId)) {
                throw new SecurityException("You do not have permission to delete this item.");
            }
            
            item.setIsactive(false);
            itemRepository.save(item);
            return true;
        }
        return false;
    }
}