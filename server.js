const cors = require("cors");
const express = require("express");
const app = express();

var fileupload = require("express-fileupload");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./filelog.sqlite3');
app.locals.db = db;
app.use(fileupload());

global.__basedir = __dirname;

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors());

const initRoutes = require("./src/routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let port = 8080;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
