# ── STAGE 1: Build del frontend ──────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Instalar dependencias del frontend
COPY package*.json ./
RUN npm ci

# Copiar fuentes y construir
COPY . .
RUN npm run build
# Resultado en /app/dist


# ── STAGE 2: Build del backend ───────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server/ .
RUN npm run build 2>/dev/null || true
# Si no hay step de build en server, los ficheros .ts se compilan en runtime


# ── STAGE 3: Imagen final de producción ──────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias de producción del backend
COPY --from=backend-builder /app/server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copiar código del backend compilado (o fuente si usa ts-node)
COPY --from=backend-builder /app/server ./server

# Copiar el build del frontend al directorio que sirve Express
COPY --from=frontend-builder /app/dist ./server/public

# Variables de entorno (valores reales se pasan en Easypanel)
ENV NODE_ENV=production
ENV PORT=3006

EXPOSE 3006

# Arrancar el servidor Express (que sirve la API + los estáticos)
CMD ["node", "server/src/index.js"]
