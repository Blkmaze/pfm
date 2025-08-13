FROM node:20-slim
WORKDIR /app
# OCR deps
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev ghostscript && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY src ./src
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node","src/server.mjs"]
