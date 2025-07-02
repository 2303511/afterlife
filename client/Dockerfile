# client/Dockerfile
FROM node:23.6

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build

# Serve with Nginx
# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
EXPOSE 8080
CMD ["npm", "start"]
