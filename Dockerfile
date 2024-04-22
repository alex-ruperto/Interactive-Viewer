# use official node.js runtime
FROM node:21

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install necessary dependencies and clean cache
RUN npm install -g npm@latest && npm cache clean --force

# bundle app's source code inside docker container
COPY . .

# make port 3000 available
EXPOSE 3000

# define command to run app
CMD ["npm", "start"]