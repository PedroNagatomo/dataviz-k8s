FROM node:18-alpine

WORKDIR /app

# Copiar apenas o necessário primeiro
COPY package*.json ./
RUN npm install --production

# Copiar o resto
COPY server.js .

# Criar diretório de uploads
RUN mkdir -p uploads && chmod 777 uploads

EXPOSE 3001

CMD ["node", "server.js"]