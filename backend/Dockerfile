# ==========================================
# 1. Build Stage (Maven + OpenJDK 21)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# 2. Runtime Stage (Lightweight JRE 21 Alpine)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Local uploads directory
RUN mkdir -p /app/uploads

# Add curl for health check probing
RUN apk add --no-cache curl

# Copy built artifact from build stage
COPY --from=builder /app/target/*.jar app.jar

# Render assigns dynamic port via $PORT (default fallback to 8081)
ENV PORT=8081
EXPOSE 8081 10000

# JVM memory limits tuned for Render Free Tier (512 MB max RAM)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Xms128m -XX:+UseSerialGC -jar app.jar"]
