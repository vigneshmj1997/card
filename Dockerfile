# syntax=docker/dockerfile:1

# ---- build ------------------------------------------------------------
# The build needs devDependencies (tsc, vite), so this stage installs the
# full tree and is thrown away afterwards — none of it reaches the image
# that gets deployed.
FROM node:22-alpine AS build

WORKDIR /app

# Copied on their own so the install layer is only rebuilt when the
# dependency set actually changes, not on every edit to a component.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ----------------------------------------------------------
# Nothing but nginx and the static output: no node, no npm, no source.
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

# Certificates are renewed in a sibling container; nginx only picks up a
# new one when it is reloaded, so it reloads itself twice a day. The
# reload is a no-op when nothing has changed.
CMD ["sh", "-c", "while :; do sleep 12h & wait $!; nginx -s reload; done & nginx -g 'daemon off;'"]
