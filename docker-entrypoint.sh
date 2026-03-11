#!/bin/sh
set -e

echo "Starting EzTest application..."

# Wait for database to be ready
echo "Waiting for database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma migrate deploy 2>&1 | tee /tmp/prisma_error.log || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Database is unavailable - attempt $RETRY_COUNT/$MAX_RETRIES"
  if [ -f /tmp/prisma_error.log ]; then
    echo "Error details:"
    cat /tmp/prisma_error.log | head -3
  fi
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Failed to connect to database after $MAX_RETRIES attempts"
  exit 1
fi

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."

# TEMPORARY FIX: Resolve failed migrations (remove this block after successful deployment)
echo "Resolving failed migrations..."
npx prisma migrate resolve --rolled-back 20260213023835_ 2>/dev/null || true

npx prisma migrate deploy

# Seed database if SEED_DATABASE is set to true
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  # Install tsx temporarily for seeding (it's in devDependencies)
  npm install tsx --no-save 2>/dev/null || true
  # Run seed directly with npx tsx
  npx tsx prisma/seed.ts || echo "Seeding failed or already completed"
fi

echo "Database setup completed!"

# Execute the main command
exec "$@"
