package com.artisanataschi.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_LOGIN_PER_MINUTE = 5;
    private static final int MAX_QUOTES_PER_HOUR = 10;

    private static class RateTracker {
        long windowStartTime;
        AtomicInteger count;

        RateTracker(long windowStartTime) {
            this.windowStartTime = windowStartTime;
            this.count = new AtomicInteger(1);
        }
    }

    private final ConcurrentHashMap<String, RateTracker> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, RateTracker> quoteAttempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);
        long now = System.currentTimeMillis();

        if ("POST".equalsIgnoreCase(method) && uri.endsWith("/auth/login")) {
            if (isRateLimited(loginAttempts, clientIp, MAX_LOGIN_PER_MINUTE, 60_000L, now)) {
                respondWithRateLimit(response, "Trop de tentatives de connexion. Veuillez patienter 1 minute avant de réessayer.");
                return;
            }
        } else if ("POST".equalsIgnoreCase(method) && uri.endsWith("/public/quotes")) {
            if (isRateLimited(quoteAttempts, clientIp, MAX_QUOTES_PER_HOUR, 3600_000L, now)) {
                respondWithRateLimit(response, "Trop de demandes de devis enregistrées depuis votre adresse. Veuillez patienter.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(ConcurrentHashMap<String, RateTracker> map, String key, int maxAllowed, long windowDurationMs, long now) {
        RateTracker tracker = map.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStartTime) > windowDurationMs) {
                return new RateTracker(now);
            } else {
                existing.count.incrementAndGet();
                return existing;
            }
        });
        return tracker.count.get() > maxAllowed;
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
