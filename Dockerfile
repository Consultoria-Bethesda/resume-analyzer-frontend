# Estágio de build
FROM node:16-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Estágio de produção
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]