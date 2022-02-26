FROM node:16.14.0-stretch-slim

ENV NODE_ENV production

WORKDIR /usr/app/api

COPY ./ ./
RUN npm i
