# Use Node.js Alpine version
FROM node:18-alpine 

# Set the working directory
WORKDIR /app 

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./ 

# Install dependencies
RUN npm install --legacy-peer-deps 

# Copy the entire project into the container
COPY . . 

# Build the React project
RUN npm run build 

# Serve the build folder using a lightweight HTTP server
CMD ["npm", "run", "dev"]
