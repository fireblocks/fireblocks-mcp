FROM node:22-alpine AS base

# Set working directory
WORKDIR /mcp
RUN chown node:node /mcp

# Args
ARG GIT_COMMIT
ARG VERSION

# Set labels
LABEL org.opencontainers.image.title="Fireblocks MCP Server"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.authors="Fireblocks"
LABEL org.opencontainers.image.source="https://github.com/fireblocks/fireblocks-mcp.git"

USER node

# Copy package.json, package-lock.json
COPY --chown=node:node package.json package-lock.json ./

# Skip Husky prepare script
RUN npm pkg set scripts.prepare="echo no-prepare"

# Install stage
FROM base AS install

# Install dependencies once
RUN npm ci --prefer-offline --progress=false --no-audit

# Build stage
FROM install AS build

# Copy source code
COPY --chown=node:node . .

# Build the project
RUN npm run build

# Final stage
FROM base AS prod

# Set environment variables
ENV NODE_ENV=production

# Install production dependencies only
RUN npm ci --omit=dev --prefer-offline --progress=false --no-audit

# Copy dist from build stage
COPY --chown=node:node --from=build /mcp/dist ./dist

# Expose port
EXPOSE 3000

CMD ["node", "./dist/main.js"]
