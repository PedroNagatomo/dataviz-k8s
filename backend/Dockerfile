# Estágio 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências
RUN npm install

# Copiar código fonte
COPY . .

# Estágio 2: Runtime
FROM node:18-alpine

# Instalar tini
RUN apk add --no-cache tini

WORKDIR /app

# Criar usuário não-root primeiro
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar node_modules e código do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./
COPY --from=builder --chown=nodejs:nodejs /app/auth.js ./

# Criar diretório de uploads com permissões corretas
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Entrypoint e comando
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
