# # client/Dockerfile
# FROM node:23.6

# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# # Serve with Nginx
# # FROM nginx:stable-alpine
# # COPY --from=build /app/build /usr/share/nginx/html
# # EXPOSE 80
# EXPOSE 80
# CMD ["npm", "run"]

FROM node:23.6 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]