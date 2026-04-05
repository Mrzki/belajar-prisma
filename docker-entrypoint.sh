#!/bin/sh
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Menjalankan database migration..."
npx prisma migrate deploy

echo "Menjalankan seed..."
node prisma/seed.js

echo "Menjalankan aplikasi..."
exec node src/index.js