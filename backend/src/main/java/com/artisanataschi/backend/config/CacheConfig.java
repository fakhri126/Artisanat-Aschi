package com.artisanataschi.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    @Value("${spring.cache.type:caffeine}")
    private String cacheType;

    /**
     * Cache Manager Redis pour environnement de production haute performance.
     * Activé uniquement lorsque spring.cache.type=redis.
     * Support complet de Java 8 Time (LocalDateTime) et sérialisation polymorphe.
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        log.info("🚀 Initialisation du Cache Distribué Redis pour Artisanat Aschi");

        // Configuration Jackson adaptée avec support des dates Java 8 (LocalDateTime)
        ObjectMapper redisObjectMapper = new ObjectMapper();
        redisObjectMapper.registerModule(new JavaTimeModule());
        redisObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        redisObjectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        // TTL par entité adapté à la fréquence de mise à jour (aligné avec la stratégie de cache)
        cacheConfigs.put("categories", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("featuredProducts", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigs.put("latestProducts", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigs.put("products", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigs.put("projects", defaultConfig.entryTtl(Duration.ofHours(2)));
        cacheConfigs.put("news", defaultConfig.entryTtl(Duration.ofHours(1)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }

    /**
     * Cache Manager Caffeine en mémoire locale.
     * Utilisé par défaut en local ou en fallback de démarrage si spring.cache.type=caffeine.
     * TTLs granulaires par entité identiques à Redis.
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "caffeine", matchIfMissing = true)
    public CacheManager caffeineCacheManager() {
        log.info("⚡ Initialisation du Cache en mémoire Caffeine (mode local rapide)");

        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .recordStats());

        // Configuration granulaire des TTLs par cache (alignée sur Redis)
        cacheManager.registerCustomCache("categories", Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(24, TimeUnit.HOURS)
                .recordStats()
                .build());
        cacheManager.registerCustomCache("featuredProducts", Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats()
                .build());
        cacheManager.registerCustomCache("latestProducts", Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .recordStats()
                .build());
        cacheManager.registerCustomCache("products", Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .recordStats()
                .build());
        cacheManager.registerCustomCache("projects", Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(2, TimeUnit.HOURS)
                .recordStats()
                .build());
        cacheManager.registerCustomCache("news", Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats()
                .build());

        return cacheManager;
    }
}
