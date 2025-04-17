FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Build the frontend React app
RUN cd src/presentation && npm install && npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 