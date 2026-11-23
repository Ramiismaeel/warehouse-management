# Frontend image: build with Node, serve with nginx as a non-root user.
# nginx serves the build and forwards /api/ to BACKEND_URL, so the browser only talks to one origin.
# Env vars: BACKEND_URL (required, no trailing slash), PORT (default 8080). See CLAUDE.md → v1.1.

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1-alpine

# Run as the image's nginx user: no `user` directive, pid file in /tmp, and writable cache + conf.d
# (the entrypoint renders the template into conf.d at startup). The stock default.conf is replaced by the template.
RUN sed -i '/^user /d' /etc/nginx/nginx.conf \
    && sed -i 's,^pid .*;,pid /tmp/nginx.pid;,' /etc/nginx/nginx.conf \
    && rm /etc/nginx/conf.d/default.conf \
    && chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 nginx/05-require-backend-url.sh /docker-entrypoint.d/05-require-backend-url.sh
COPY --from=build /app/dist /usr/share/nginx/html

# NGINX_ENTRYPOINT_LOCAL_RESOLVERS: the entrypoint puts the container's DNS server into NGINX_LOCAL_RESOLVERS.
# A non-root process can't bind ports below 1024 everywhere, so the default is 8080 (Render sets PORT itself).
ENV PORT=8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

USER nginx
EXPOSE 8080
