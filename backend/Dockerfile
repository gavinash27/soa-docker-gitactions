
# Stage 1: Build the Spring Boot application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY src/ ./src/
RUN mvn -B clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
