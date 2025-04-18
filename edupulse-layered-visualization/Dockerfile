FROM node:18-alpine

WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3006

CMD ["npm", "start"] 