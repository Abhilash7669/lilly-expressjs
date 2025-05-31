FROM node:24

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run compile

ARG DEFAULT_PORT=8080

ENV PORT=${DEFAULT_PORT}

EXPOSE $PORT

CMD ["npm", "start"]