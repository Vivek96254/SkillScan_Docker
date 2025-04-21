# Use Node.js Alpine version
FROM node:18-alpine 

# Set the working directory
WORKDIR /my-app 

# Copy package.json and package-lock.json first (for caching dependencies)
COPY my-app/package*.json ./ 

# Install dependencies
RUN npm install --legacy-peer-deps 

# Copy the entire project into the container
COPY my-app/ . 

# Build the React project
RUN npm run build 

# Serve the build folder using a lightweight HTTP server
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
