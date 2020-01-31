
FROM node:12
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci 
# Bundle app source
COPY . .
RUN npm update sequelize --depth 1
RUN npm update iodash --depth 3
RUN npm update cli usage --depth 3
EXPOSE 8080
CMD [ "npm", "run", "prod" ]