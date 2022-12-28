FROM node:16.19.0-bullseye-slim

ENV NODE_ENV development

WORKDIR /usr/app/source

COPY . ./

RUN npm run setup

# build web api
RUN npm run prepare-web

RUN npm run build-web

RUN mkdir /usr/app/api

RUN cp -r build/* /usr/app/api

# delete build
RUN rm -r build

# build electron api
RUN npm run prepare-electron

RUN npm run build-electron

RUN mkdir /usr/app/electron

RUN cp -r build/* /usr/app/electron

ENV NODE_ENV production
