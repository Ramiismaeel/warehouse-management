# One image for the whole app: Spring Boot serves the React build and /api/v1.
# backend-target/app.jar is built by .github/workflows/deploy.yml (or locally, see T31 in docs/TICKETS.md).
# Configuration only via env vars on Render: DB_URL, DB_USER, DB_PASSWORD (PORT is set by Render).
# SPRING_PROFILES_ACTIVE defaults to prod below; Render may still set it explicitly.
FROM eclipse-temurin:25-jre
EXPOSE 8080
# A container must never silently fall back to the dev profile (in-memory H2, seed data).
ENV SPRING_PROFILES_ACTIVE=prod
# Render free has 512 MB; without this Java uses only 25 % of it for the heap.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
# Run as an unprivileged system user, not root (the base image is Ubuntu).
RUN groupadd --system app && useradd --system --gid app --no-create-home --shell /usr/sbin/nologin app
# The jar stays owned by root and read-only (0444), so the app user can run it but not change it.
COPY --chmod=0444 backend-target/app.jar /app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app.jar"]
