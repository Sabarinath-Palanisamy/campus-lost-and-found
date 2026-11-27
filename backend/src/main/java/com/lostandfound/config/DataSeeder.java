package com.lostandfound.config;

import com.lostandfound.model.Category;
import com.lostandfound.model.User;
import com.lostandfound.repo.CategoryRepository;
import com.lostandfound.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(CategoryRepository categoryRepository, UserRepository userRepository) {
        return args -> {
            
            // 1. Seed Default User to satisfy Foreign Key constraints
            // 1. Seed Default User to satisfy Foreign Key constraints
            if (userRepository.count() == 0) {
                User defaultUser = new User();
                defaultUser.setFullName("System Admin"); // Changed from setUsername
                defaultUser.setEmail("admin@campus.edu");
                userRepository.save(defaultUser);
                System.out.println("Database Seeder: Default User created.");
            }

            // 2. Seed Master Categories
            if (categoryRepository.count() == 0) {
                Category electronics = new Category(); electronics.setName("Electronics");
                Category wallet = new Category(); wallet.setName("Wallet");
                Category keys = new Category(); keys.setName("Keys");
                Category documents = new Category(); documents.setName("Documents");
                Category other = new Category(); other.setName("Other");

                categoryRepository.saveAll(List.of(electronics, wallet, keys, documents, other));
                System.out.println("Database Seeder: Master categories initialized.");
            }
        };
    }
}