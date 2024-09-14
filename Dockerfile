FROM node
WORKDIR /app
COPY package.json /app
RUN npm install --production
COPY . /app
ENV NODE_ENV=production
CMD ["node","app.js"]