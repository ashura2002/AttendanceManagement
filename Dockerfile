FROM node:20-alpine

# working directory
WORKDIR /app

# copy dependencies
COPY package.json package-lock.json ./

# run
RUN npm install

COPY . .

# build the application
RUN npm run build

EXPOSE 3000

# start the application
CMD [ "npm", "run", "start:dev" ]