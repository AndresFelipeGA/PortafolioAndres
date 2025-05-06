FROM node:18-alpine

WORKDIR /app

# Copy project files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]