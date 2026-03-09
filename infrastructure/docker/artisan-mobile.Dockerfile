FROM node:22-bullseye

WORKDIR /app/apps/artisan-mobile

COPY apps/artisan-mobile/package.json apps/artisan-mobile/package-lock.json ./

RUN npm install
RUN npm install -g @expo/ngrok@^4.1.0

COPY apps/artisan-mobile/ ./

EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "start:docker"]
