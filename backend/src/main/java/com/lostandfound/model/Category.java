package com.lostandfound.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    public Category() {}
    public Category(Long id) { this.setId(id); }

    @Override
    protected String getEntityPrefix() { return "CATEGORY"; }

    // Explicit Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}