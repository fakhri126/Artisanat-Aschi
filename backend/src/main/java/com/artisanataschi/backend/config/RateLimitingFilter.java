package com.artisanataschi.backend.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_LOGIN_PER_MINUTE = 5;
    private static final int MAX_QUOTES_PER_HOUR = 10;
    private static final int MAX_PUBLIC_API_PER_MINUTE = 180;

    // Bounded in-memory caches with automatic sliding-window eviction (prevents memory leak)
    private final Cache<String, AtomicInteger> loginAttempts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(5000)
            .build();

    private final Cache<String, AtomicInteger> quoteAttempts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .maximumSize(5000)
            .build();

    private final Cache<String, AtomicInteger> publicApiAttempts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(5000)
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);

        if ("POST".equalsIgnoreCase(method) && uri.endsWith("/auth/login")) {
            if (isRateLimited(loginAttempts, clientIp, MAX_LOGIN_PER_MINUTE)) {
                respondWithRateLimit(response, "Trop de tentatives de connexion. Veuillez patienter 1 minute avant de réessayer.");
                return;
            }
        } else if ("POST".equalsIgnoreCase(method) && uri.endsWith("/public/quotes")) {
            if (isRateLimited(quoteAttempts, clientIp, MAX_QUOTES_PER_HOUR)) {
                respondWithRateLimit(response, "Trop de demandes de devis enregistrées depuis votre adresse. Veuillez patienter.");
                return;
            }
        } else if (uri.contains("/public/")) {
            if (isRateLimited(publicApiAttempts, clientIp, MAX_PUBLIC_API_PER_MINUTE)) {
                respondWithRateLimit(response, "Limite de requêtes atteinte. Veuillez espacer vos requêtes.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Cache<String, AtomicInteger> cache, String key, int maxAllowed) {
        AtomicInteger counter = cache.get(key, k -> new AtomicInteger(0));
        return counter != null && counter.incrementAndGet() > maxAllowed;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void respondWithRateLimit(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"" + message + "\", \"status\": 429}");
    }
}
