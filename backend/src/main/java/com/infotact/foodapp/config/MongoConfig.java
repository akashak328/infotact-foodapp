package com.infotact.foodapp.config;

import com.mongodb.client.MongoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.index.Index;
import com.infotact.foodapp.model.Restaurant;

@Configuration
public class MongoConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Bean
    public CommandLineRunner createIndexes() {
        return args -> {
            // 2dsphere index for geospatial restaurant queries
            mongoTemplate.indexOps(Restaurant.class)
                .ensureIndex(new GeospatialIndex("location").typed(
                    org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE));

            // Index on restaurantId for fast menu lookups
            mongoTemplate.indexOps("menu_items")
                .ensureIndex(new Index().on("restaurantId", Sort.Direction.ASC));

            // Index on customerId + status for order queries
            mongoTemplate.indexOps("orders")
                .ensureIndex(new Index().on("customerId", Sort.Direction.ASC));
            mongoTemplate.indexOps("orders")
                .ensureIndex(new Index().on("restaurantId", Sort.Direction.ASC));

            System.out.println("✅ MongoDB indexes created successfully");
        };
    }
}
