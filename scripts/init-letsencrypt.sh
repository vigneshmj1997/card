#!/usr/bin/env bash
#
# Issues the first certificate for marriage.automatebrains.com.
#
# Run this once, on the server, before the first `docker compose up -d`.
# Renewals after that are automatic — the certbot container handles them
# and nginx reloads itself to pick them up.
#
#   CERTBOT_EMAIL=you@example.com ./scripts/init-letsencrypt.sh
#
# Set STAGING=1 to issue against Let's Encrypt's staging environment
# first. The certificate it returns is not trusted by browsers, but the
# staging rate limits are far looser — worth doing if you are unsure the
# DNS or the ports are right, because production allows only 5 failures
# per hostname per hour.

set -euo pipefail

DOMAIN="${DOMAIN:-marriage.automatebrains.com}"
EMAIL="${CERTBOT_EMAIL:-}"
STAGING="${STAGING:-0}"
RSA_KEY_SIZE=4096

cd "$(dirname "$0")/.."

compose() { docker compose "$@"; }

if [ -z "$EMAIL" ]; then
  echo "CERTBOT_EMAIL is not set."
  echo "Let's Encrypt uses it to warn you if a renewal ever stops working:"
  echo
  echo "  CERTBOT_EMAIL=you@example.com $0"
  exit 1
fi

echo "==> Domain: $DOMAIN"
if [ "$STAGING" != "0" ]; then
  echo "==> Using the STAGING environment — the certificate will not be trusted."
fi

# --- 1. the chicken and the egg -----------------------------------------
# nginx refuses to start when ssl_certificate points at a file that is not
# there, and certbot cannot pass the HTTP challenge until nginx is
# serving. So: a throwaway self-signed certificate, just so nginx will
# come up long enough to answer the challenge.
LIVE_PATH="/etc/letsencrypt/live/$DOMAIN"

if compose run --rm --entrypoint sh certbot -c "[ -f '$LIVE_PATH/fullchain.pem' ]" 2>/dev/null; then
  echo "==> A certificate for $DOMAIN already exists. Nothing to do."
  echo "    (To replace it: docker compose run --rm --entrypoint sh certbot \\"
  echo "       -c 'rm -rf $LIVE_PATH /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf')"
  exit 0
fi

echo "==> Creating a temporary self-signed certificate"
compose run --rm --entrypoint sh certbot -c "\
  mkdir -p '$LIVE_PATH' && \
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
    -keyout '$LIVE_PATH/privkey.pem' \
    -out '$LIVE_PATH/fullchain.pem' \
    -subj '/CN=localhost'"

# --- 2. the TLS options nginx.conf includes -----------------------------
echo "==> Installing certbot's recommended TLS settings"
compose run --rm --entrypoint sh certbot -c "\
  [ -f /etc/letsencrypt/options-ssl-nginx.conf ] || \
    wget -qO /etc/letsencrypt/options-ssl-nginx.conf \
      https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot/_internal/tls_configs/options-ssl-nginx.conf; \
  [ -f /etc/letsencrypt/ssl-dhparams.pem ] || \
    wget -qO /etc/letsencrypt/ssl-dhparams.pem \
      https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem"

# --- 3. bring up nginx so the challenge can be answered -----------------
echo "==> Starting nginx"
compose up -d web
# Give it a moment to bind :80 before certbot knocks.
sleep 5

# --- 4. swap the dummy for the real thing -------------------------------
echo "==> Deleting the temporary certificate"
compose run --rm --entrypoint sh certbot -c "\
  rm -rf '$LIVE_PATH' \
         '/etc/letsencrypt/archive/$DOMAIN' \
         '/etc/letsencrypt/renewal/$DOMAIN.conf'"

echo "==> Requesting the real certificate"
STAGING_ARG=""
if [ "$STAGING" != "0" ]; then STAGING_ARG="--staging"; fi

compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  $STAGING_ARG \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --rsa-key-size "$RSA_KEY_SIZE" \
  -d "$DOMAIN" \
  --force-renewal

echo "==> Reloading nginx"
compose exec web nginx -s reload

echo
echo "Done. Start everything with:"
echo "  docker compose up -d"
echo "Then check https://$DOMAIN"
