# ==========================================
# 1. Étape de Build (Maven + OpenJDK 21)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Mettre en cache les dépendances Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le code source et compiler le JAR
COPY src ./src
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# ==========================================
# 2. Étape d'Exécution (JRE 21 Alpine légère)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Répertoire pour les uploads locaux de secours
RUN mkdir -p /app/uploads

# Copie de l'artefact compilé
COPY --from=builder /app/target/*.jar app.jar

# Port dynamique (compatible Render, Railway ou local 8081)
ENV PORT=8081
EXPOSE ${PORT}

# Optimisation JVM pour conteneurs avec mémoire limitée (ex: 512 Mo gratuit sur Render)
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Xms128m", "-XX:+UseSerialGC", "-jar", "app.jar"]
