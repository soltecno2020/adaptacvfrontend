# Etapa de build
FROM node:22 AS builder

# Crea el directorio de trabajo
WORKDIR /app

# Alinea la version de npm con el entorno local que genero el lockfile
RUN npm install -g npm@11.7.0

# Copia solo lo necesario para instalar dependencias
COPY package.json package-lock.json ./

# Instala dependencias (incluye devDependencies necesarias para el build de Nuxt)
RUN npm ci

# Copia todo el código fuente
COPY . .

# Ejecuta el build de Nuxt (genera .output/)
RUN npm run build

# Etapa final: solo sirve lo necesario
FROM node:22-alpine AS runner

ENV NODE_ENV=production

# Crea el directorio de trabajo en producción
WORKDIR /app

# Alinea la version de npm con el entorno local que genero el lockfile
RUN npm install -g npm@11.7.0

# Instala dependencias de producción desde el proyecto
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia el build generado por Nuxt (.output/)
COPY --from=builder /app/.output ./.output

# Expone el puerto 3000
EXPOSE 3000

# Comando de inicio de la app SSR de Nuxt (Nitro)
CMD ["node", ".output/server/index.mjs"]
