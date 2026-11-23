# Backend image: build the jar with Maven, run it on a slim JRE as a non-root user.
# Configuration only via env vars (DB_URL, DB_USER, DB_PASSWORD, PORT). See CLAUDE.md → v1.1.

# ---- Build stage ----
# mvn from the image instead of ./mvnw: avoids CRLF/permission problems from Windows checkouts.
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build

# Dependencies first, so this layer is cached until pom.xml changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Tests run in CI, not in the image build.
RUN mvn -B -q package -DskipTests && cp target/*.jar app.jar

# ---- Runtime stage ----
FROM eclipse-temurin:25-jre
WORKDIR /app

RUN groupadd --system app && useradd --system --gid app --no-create-home app

# Owned by root and only readable by the app user, so the process can't modify its own jar.
COPY --from=build /build/app.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"

USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
