# Usar Node 22
FROM node:22-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Mostrar versões
RUN node -v && npm -v

# Instalar dependências com log detalhado
RUN npm install --verbose

# Copiar o resto dos arquivos
COPY . .

# Listar arquivos para debug
RUN ls -la

# Configurar variáveis de ambiente
ENV NODE_ENV=development
ENV REACT_APP_BACKEND_URL=http://localhost:8000
ENV CI=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Tentar build com mais informações de debug
RUN npm run build --verbose || (echo "Build failed" && npm run build --verbose)

# Instalar serve
RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]
