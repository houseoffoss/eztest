#!/bin/sh
set -e

echo "Starting EzTest application..."
echo "Waiting for database connection..."

MAX_RETRIES=30
RETRY_COUNT=0

# ✅ SAFE DB CONNECTION CHECK (read-only)
until npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Database unavailable - attempt $RETRY_COUNT/$MAX_RETRIES"

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database"
    exit 1
  fi

  sleep 2
done

echo "Database is ready!"

# ✅ RUN MIGRATIONS EXACTLY ONCE
echo "Running database migrations..."
npx prisma migrate deploy

# ✅ OPTIONAL SEED (safe after migrations)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  npm install tsx --no-save >/dev/null 2>&1 || true
  npx tsx prisma/seed.ts || echo "Seeding skipped or already completed"
fi

echo "Database setup completed!"

exec "$@"
