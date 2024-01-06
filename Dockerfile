FROM node:20
# RUN npm i -g yarn

WORKDIR /app
COPY ./package*.json .
RUN yarn install

COPY . .

CMD ["yarn", "start"]
