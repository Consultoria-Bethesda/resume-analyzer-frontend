FROM node:16
WORKDIR /app
COPY . .
RUN chmod +x /app/node_modules/.bin/react-scripts
RUN npm install
RUN npm run build
CMD ["npm", "start"]

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]