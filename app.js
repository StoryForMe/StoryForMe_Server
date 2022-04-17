const express = require('express');
const mysql = require('mysql');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// const router = require('./routes');
const dotenv = require('dotenv');

dotenv.config();


var app = express();

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var usrappendRouter = require('./routes/usrappend');


// app.use('/',indexRouter);
// app.use('/users',usersRouter);
// app.use('/usrappend', usrappendRouter);

// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);

const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  insecureAuth: true,
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const port = process.env.PORT || 80;

exports.getConnectionPool = (callback) => {
  connectionPool.getConnection((err, conn) => {
    if(!err) callback(conn);
  })
}