@echo off
echo ================================================
echo   Artisanat Aschi - Demarrage Backend API
echo ================================================
echo.

REM 1. Verification de Docker
echo [1/3] Verification de Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Docker Desktop n'est pas demarre.
    echo Veuillez lancer Docker Desktop puis relancer ce script.
    echo.
    pause
    exit /b 1
)

REM 2. Demarrer PostgreSQL via Docker Compose
echo [2/3] Demarrage de PostgreSQL via Docker Compose...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERREUR: Impossible de demarrer le conteneur PostgreSQL.
    echo Veuillez verifier les logs Docker.
    echo.
    pause
    exit /b 1
)

echo Attente de 5 secondes pour l'initialisation de PostgreSQL...
timeout /t 5 /nobreak >nul

echo [3/3] Demarrage du Backend Spring Boot (PostgreSQL) sur http://localhost:8081/api
echo.
mvn spring-boot:run

pause
