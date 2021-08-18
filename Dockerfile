FROM node:15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
COPY .env.example .env

EXPOSE $PORT

CMD [ "npm", "start" ]
