FROM node:20-alpine
WORKDIR /code

ARG DATABASE_URL

COPY package*.json ./
RUN npm i -g husky
RUN npm i -g @nestjs/cli
RUN npm i --save-dev @types/node

COPY prisma ./prisma
RUN npm run prisma:generate

COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]