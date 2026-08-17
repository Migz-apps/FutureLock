# ============================================================
# FutureLock Backend - Production Docker Image
# Java 21 + Spring Boot
# ============================================================


# ------------------------------------------------------------
# STAGE 1: Build application
# ------------------------------------------------------------

    FROM maven:3.9-eclipse-temurin-21 AS build

    WORKDIR /app
    
    # Copy Maven project configuration first.
    # This allows Docker to cache dependency downloads.
    COPY pom.xml .
    
    RUN mvn dependency:go-offline -B
    
    # Copy application source
    COPY src ./src
    
    # Build production JAR
    RUN mvn clean package -DskipTests -B
    
    
    # ------------------------------------------------------------
    # STAGE 2: Production runtime
    # ------------------------------------------------------------
    
    FROM eclipse-temurin:21-jre
    
    WORKDIR /app
    
    # Run the application as an unprivileged user
    RUN groupadd --system futurelock \
        && useradd --system \
           --gid futurelock \
           --no-create-home \
           futurelock
    
    # Copy the Spring Boot JAR produced in the build stage.
    # Rename it so the runtime command does not depend on the
    # Maven project version.
    COPY --from=build /app/target/*.jar app.jar
    
    USER futurelock
    
    # Render supplies PORT automatically.
    # 8081 remains the local/default application port.
    EXPOSE 8081
    
    ENTRYPOINT ["java", "-jar", "/app/app.jar"]