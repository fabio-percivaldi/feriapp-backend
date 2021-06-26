FROM node:10.17.0-alpine as build

ARG COMMIT_SHA=<not-specified>
ENV NODE_ENV=production

WORKDIR /build-dir

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN echo "feriapp-backend: $COMMIT_SHA" >> ./commit.sha

########################################################################################################################

FROM node:10.17.0-alpine

LABEL maintainer="undefined" \
      name="feriapp-backend" \
      description="" \
      eu.mia-platform.url="https://www.mia-platform.eu" \
      eu.mia-platform.version="0.1.0"

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV SERVICE_PREFIX=/
ENV HTTP_PORT=3000

WORKDIR /home/node/app

COPY --from=build /build-dir ./

USER node

CMD ["npm", "-s", "start", "--", "--options", "--port", "${HTTP_PORT}", "--log-level", "${LOG_LEVEL}", "--prefix=${SERVICE_PREFIX}", "--address", "0.0.0.0"]
