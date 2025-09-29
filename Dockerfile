ARG NODE_VERSION=18-alpine
ARG TARGETPLATFORM

# Build stage
FROM --platform=$TARGETPLATFORM node:${NODE_VERSION} AS builder
WORKDIR /app

# Dependencies first
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --no-audit --no-fund

# Copy sources
COPY . .

# Build front and back
RUN npm run build

# Runtime stage
FROM --platform=$TARGETPLATFORM node:${NODE_VERSION}
WORKDIR /app

ENV NODE_ENV=production \
    NEST_PORT=3001 \
    NEXT_PUBLIC_API_URL=http://localhost:3001

# Install only prod deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built artifacts and minimal runtime sources needed
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/src ./api/src
COPY --from=builder /app/api/data ./api/data

# Expose ports
EXPOSE 3000 3001

# Start both services (bind 0.0.0.0)
CMD ["sh", "-c", "node api/dist/main.js & next start -p 3000 -H 0.0.0.0"]

