FROM node:16.18.1-bullseye-slim

ENV NODE_ENV development

WORKDIR /usr/app/api

COPY . ./

RUN npm run setup

ENV NODE_ENV production

RUN npm run build
