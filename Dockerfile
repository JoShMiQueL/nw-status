# Build stage
FROM oven/bun:1.3.0 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Production stage
FROM oven/bun:1.3.0-slim

WORKDIR /app

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy example config files
COPY config.example.json ./config.example.json
COPY .env.example ./.env.example

# Create data directory
RUN mkdir -p /app/data

# Set non-root user
RUN groupadd -r nwmonitor && useradd -r -g nwmonitor nwmonitor
RUN chown -R nwmonitor:nwmonitor /app
USER nwmonitor

# Environment variables with defaults
ENV NODE_ENV=production
ENV CHECK_INTERVAL=300000

# Expose port for potential future web interface
EXPOSE 3000

# Health check
HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 \
  CMD pgrep -f "bun" > /dev/null || exit 1

# Run the application
CMD ["bun", "start"]
