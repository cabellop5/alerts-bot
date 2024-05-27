FROM node:18

RUN apt-get update

RUN apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY ./ ./app

WORKDIR /app

RUN npm install

RUN npm run build

CMD npm run serve
