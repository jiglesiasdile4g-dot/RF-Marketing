# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build-client
WORKDIR /app
COPY package*.json ./
RUN set -euxo pipefail ; npm install --no-audit --no-fund --loglevel=error
COPY . .
RUN set -euxo pipefail ; npm run build

FROM node:20-alpine AS build-server
WORKDIR /app/server
COPY server/package*.json ./
RUN set -euxo pipefail ; npm install --no-audit --no-fund --loglevel=error
COPY server/ ./
RUN set -euxo pipefail ; npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006

COPY --from=build-client /app/dist ./dist
COPY --from=build-server /app/server/dist ./server/dist

COPY package*.json ./
COPY server/package*.json ./server/

RUN set -euxo pipefail ; npm install --omit=dev --no-audit --no-fund --loglevel=error && npm cache clean --force
RUN set -euxo pipefail ; cd server && npm install --omit=dev --no-audit --no-fund --loglevel=error && npm cache clean --force

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" || exit 1

CMD ["node", "server/dist/index.js"]
