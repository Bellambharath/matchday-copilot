FROM node:20-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code and public files
COPY src/ ./src/
COPY public/ ./public/

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 8080

CMD ["node", "src/server.js"]
