FROM node:8
COPY . .
RUN npm install
RUN npm install nodemailer
EXPOSE 80
WORKDIR /
 
CMD node index.js
