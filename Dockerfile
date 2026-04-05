# Base image - gunakan Node versi yang sama dengan yang kamu pakai
FROM node:24-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dulu (untuk cache layer)
COPY package*.json ./

# Install depedencies
RUN npm install

# Copy semua source code
COPY . .

# Expose port
EXPOSE 3000

# Jalankan aplikasi
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
CMD [ "./docker-entrypoint.sh" ]