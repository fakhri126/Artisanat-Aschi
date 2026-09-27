package com.artisanataschi.backend;

import com.artisanataschi.backend.domain.Category;
import com.artisanataschi.backend.domain.Product;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RedisSerializationTest {

    private GenericJackson2JsonRedisSerializer serializer;

    @BeforeEach
    void setUp() {
        serializer = new GenericJackson2JsonRedisSerializer();
        serializer.configure(mapper -> {
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        });
    }

    @Test
    @DisplayName("Devrait sérialiser et désérialiser un Product avec LocalDateTime sans erreur")
    void testProductWithLocalDateTimeSerialization() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Buffet Sculpté");
        product.setDescription("Magnifique buffet en noyer");
        product.setPrice(new BigDecimal("1850.00"));
        product.setType("CATALOGUE");
        product.setColor("Noyer");
        product.setDimensions("120x80x45");
        product.setCreatedAt(LocalDateTime.of(2026, 9, 25, 10, 30, 0));

        Category cat = new Category();
        cat.setId(10L);
        cat.setName("Buffets");
        cat.setType("MEUBLE");
        product.setCategory(cat);

        // Serialization
        byte[] bytes = serializer.serialize(product);
        assertNotNull(bytes, "Les octets sérialisés ne doivent pas être nuls");

        // Deserialization
        Object deserialized = serializer.deserialize(bytes);
        assertNotNull(deserialized, "L'objet désérialisé ne doit pas être nul");
        assertTrue(deserialized instanceof Product, "L'objet désérialisé doit être une instance de Product");

        Product result = (Product) deserialized;
        assertEquals(1L, result.getId());
        assertEquals("Buffet Sculpté", result.getName());
        assertEquals(LocalDateTime.of(2026, 9, 25, 10, 30, 0), result.getCreatedAt());
        assertEquals("Buffets", result.getCategory().getName());
    }

    @Test
    @DisplayName("Devrait sérialiser et désérialiser une List de Products avec dates")
    void testProductListSerialization() {
        Product p1 = new Product();
        p1.setId(2L);
        p1.setName("Miroir Doré");
        p1.setCreatedAt(LocalDateTime.of(2026, 9, 25, 11, 0, 0));

        Product p2 = new Product();
        p2.setId(3L);
        p2.setName("Table Basse");
        p2.setCreatedAt(LocalDateTime.of(2026, 9, 25, 11, 30, 0));

        List<Product> list = new ArrayList<>();
        list.add(p1);
        list.add(p2);

        byte[] bytes = serializer.serialize(list);
        assertNotNull(bytes);

        Object deserialized = serializer.deserialize(bytes);
        assertNotNull(deserialized);
        assertTrue(deserialized instanceof List);
        List<?> resultList = (List<?>) deserialized;
        assertEquals(2, resultList.size());
        assertTrue(resultList.get(0) instanceof Product);
        Product desP = (Product) resultList.get(0);
        assertEquals("Miroir Doré", desP.getName());
        assertEquals(LocalDateTime.of(2026, 9, 25, 11, 0, 0), desP.getCreatedAt());
    }
}
