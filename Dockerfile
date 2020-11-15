# Our first stage, that is the Builder
FROM nikolaik/python-nodejs:python3.9-nodejs12-alpine AS npm-packages
WORKDIR /app
COPY . .
RUN rm -rf dist
RUN npm install
RUN npm run build

# Install production NPM packages separately
FROM nikolaik/python-nodejs:python3.9-nodejs12-alpine AS npm-packages
WORKDIR /app
COPY package* ./
RUN npm install --production

# Our Second stage, that creates an image for production
FROM node:12-alpine AS ts-sample-prod
VOLUME /app
WORKDIR /app
EXPOSE 3000
COPY --from=ts-sample-builder ./app/dist ./dist
COPY package* ./
COPY --from=npm-packages ./app/node_modules ./node_modules
CMD npm start:bot
