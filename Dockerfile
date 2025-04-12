FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm prisma generate

COPY . .

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"] 