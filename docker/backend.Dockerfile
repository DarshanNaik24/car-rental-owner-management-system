# Multi-stage Dockerfile for Spring Boot Backend
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper & pom.xml
COPY pom.xml .
COPY src ./src

# Install maven and package
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root user
RUN groupadd -r carrental && useradd -r -g carrental carrental && \
    mkdir -p /app/uploads && chown -R carrental:carrental /app

# Copy jar from build stage
COPY --from=build /app/target/car-rental-backend-*.jar app.jar

USER carrental
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=postgres \
    UPLOAD_DIR=/app/uploads

ENTRYPOINT ["java", "-jar", "app.jar"]
