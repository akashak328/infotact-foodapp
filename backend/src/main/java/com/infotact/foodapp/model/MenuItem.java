package com.infotact.foodapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String restaurantId;
    private String name;
    private String description;
    private double price;
    private String category;     // Starter, Main Course, Dessert, Beverage
    private String imageUrl;
    private boolean isVeg = false;
    private boolean isAvailable = true;
    private int preparationTime = 15; // minutes

    // Nutritional info (optional)
    private int calories;
    private List<String> allergens;
    private List<String> tags; // spicy, bestseller, new
}
