# Usar Node.js 20
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Instalar dependências (usando npm install em vez de ci para garantir)
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]