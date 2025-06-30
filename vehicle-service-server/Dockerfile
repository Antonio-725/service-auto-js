# vehicle-service-server/Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["node", "index.js"]
