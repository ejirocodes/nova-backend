FROM node:20-alpine AS base

WORKDIR /code

ARG DATABASE_URL

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm setup
RUN pnpm i -g @nestjs/cli
RUN pnpm i --save-dev @types/node

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma

RUN pnpm prisma generate

COPY . .

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
