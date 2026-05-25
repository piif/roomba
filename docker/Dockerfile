FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY config ./config

EXPOSE 3000

CMD ["node", "src/web/web-server.js", "--mode=real", "--lang=fr", "--port=3000"]
