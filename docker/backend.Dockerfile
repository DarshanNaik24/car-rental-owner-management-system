# Multi-stage Dockerfile for Spring Boot Backend
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root user
RUN groupadd -r carrental && useradd -r -g carrental carrental && \
    mkdir -p /app/uploads && chown -R carrental:carrental /app

# Copy executable jar from build stage
COPY --from=build /app/target/car-rental-backend-*.jar app.jar

USER carrental
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=postgres \
    UPLOAD_DIR=/app/uploads

ENTRYPOINT ["java", "-jar", "app.jar"]
