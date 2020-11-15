# Our first stage, that is the Builder
FROM node:12-alpine AS ts-sample-builder
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache make g++ python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
WORKDIR /app
COPY . .
RUN rm -rf dist
RUN npm install
RUN npm run build

# Install production NPM packages separately
FROM node:12-alpine AS npm-packages
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache make g++ python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
WORKDIR /app
COPY package* ./
RUN npm install --production

# Our Second stage, that creates an image for production
FROM node:12-alpine AS ts-sample-prod
VOLUME /app
WORKDIR /app
COPY --from=ts-sample-builder ./app/dist ./dist
COPY package* ./
COPY --from=npm-packages ./app/node_modules ./node_modules
CMD npm start:bot
