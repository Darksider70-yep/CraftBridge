FROM node:22-bullseye

WORKDIR /app/apps/artisan-mobile

# Install system libraries required by React Native DevTools (Chromium-based)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
    libglib2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libdbus-1-3 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxtst6 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY apps/artisan-mobile/package.json apps/artisan-mobile/package-lock.json ./

RUN npm install
RUN npm install -g @expo/ngrok@^4.1.0

COPY apps/artisan-mobile/ ./

EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "start:docker"]