FROM node:19.2.0-bullseye-slim

ENV NODE_ENV development

WORKDIR /usr/app/api

COPY . ./

RUN mkdir .husky
RUN npm i

ENV NODE_ENV production
RUN npm run build
