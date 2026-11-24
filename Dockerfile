# One image for the whole app: Spring Boot serves the React build and /api/v1.
# backend-target/app.jar is built by .github/workflows/deploy.yml (or locally, see T31 in docs/TICKETS.md).
# Configuration only via env vars on Render: SPRING_PROFILES_ACTIVE, DB_URL, DB_USER, DB_PASSWORD (PORT is set by Render).
FROM eclipse-temurin:25-jre
EXPOSE 8080
# Render free has 512 MB; without this Java uses only 25 % of it for the heap.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
COPY backend-target/app.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
