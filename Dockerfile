FROM node:18-alpine

RUN npm i npm@latest -g

RUN mkdir /opt/node_app
WORKDIR /opt/node_app

COPY package.json package-lock.json* ./
RUN npm install --no-optional && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH


WORKDIR /opt/node_app/app
COPY . .

CMD [ "npm", "start" ]
