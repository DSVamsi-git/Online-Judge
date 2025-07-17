FROM node:22-alpine
RUN apk add --no-cache g++ make python3
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 7000
CMD ["npm", "start"]
