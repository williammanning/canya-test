# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Clone the repository from main branch
RUN apk add --no-cache git && \
    git clone --branch main https://github.com/williammanning/canya-test.git .

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
