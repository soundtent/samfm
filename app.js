var mongoUrl;
if (process.env.NODE_ENV == "production") {
  require('dotenv').config({ path: '.env' });
  console.log('Using environment file: .env');
  mongoUrl = `mongodb://${process.env.MONGODB_ROOT_USERNAME}:${process.env.MONGODB_ROOT_PASSWORD}@${process.env.MONGODB_CONTAINER_NAME}:27017/${process.env.MONGODB_DATABASE_NAME}?authSource=admin`;
}
else {
  require('dotenv').config({ path: '.env.dev' });
  console.log('Using environment file: .env.dev')
  mongoUrl = `mongodb://localhost:27017/${process.env.MONGODB_DATABASE_NAME}`;
}

const express = require('express');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const WebSocket = require('ws');
const http = require('http');

const connectDB = require('./server/config/dbConfig');
const initialisePassportLocalStrategy = require('./server/config/authConfig');

const app = express();
const port = process.env.PORT;

//allows PUT and POST requests to be received by middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));


app.locals.pathToUrl = function(filePath) { //
  return filePath.replace("public", process.env.BASE_URL);
}

/*
  Session configuration and utilization of the MongoStore for storing
  the session in the MongoDB database
*/

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.MONGODB_CONNECT_RANDOMSECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongoUrl: mongoUrl })
}));

//Web sockets
const httpServer = http.createServer(app);
const webSocketServer = new WebSocket.WebSocketServer({server: httpServer});
app.set('webSocketServer', webSocketServer);

connectDB(mongoUrl);
initialisePassportLocalStrategy();

app.use(passport.initialize());
app.use(passport.session());

// Templating Engine
app.use(expressLayout);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');

app.use(require('./server/routes/routes'));
app.use(require('./server/routes/authRoutes'));


httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
// Not needed anymore because using httpServer instead
// app.listen(port, () => {
  // console.log(`App listening on port ${port}`);
// })