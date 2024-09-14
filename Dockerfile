FROM node
WORKDIR /app
COPY package.json /app
RUN npm install --production
COPY . /app
EXPOSE 80
EXPOSE 443
ENV NODE_ENV=production
CMD ["node","app.js"]