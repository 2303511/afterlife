# server/Dockerfile
FROM node:23.6

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]  
# update if your entry is named differently
