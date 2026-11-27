package com.lostandfound.controller;

import com.lostandfound.repo.CategoryRepository;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/master-data")
public class MasterDataController {

    private final CategoryRepository categoryRepository;

    public MasterDataController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public Map<String, Object> getMasterData() {
        Map<String, Object> masterData = new HashMap<>();
        
        // 1. Dynamic Data from DB
        masterData.put("categories", categoryRepository.findAll());
        
        // 2. Static Status Mappings
        Map<String, String> statuses = new HashMap<>();
        statuses.put("RE", "Reported");
        statuses.put("UC", "Under Claim");
        statuses.put("RD", "Returned");
        statuses.put("CD", "Closed");
        statuses.put("RJ", "Rejected");
        masterData.put("statuses", statuses);
        
        // 3. Static Type Mappings
        Map<String, String> types = new HashMap<>();
        types.put("L", "Lost");
        types.put("F", "Found");
        masterData.put("itemTypes", types);
        
        return masterData;
    }
}