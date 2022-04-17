const express = require('express');
const mysql = require('mysql');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = require('./routes');
const dotenv = require('dotenv');
const cors = require('cors'); 

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

//app.set("View engine","ejs");
//app.set('views', path.join(__dirname, 'views'));

const port = process.env.PORT || 8000;

app.use('/', router);


dotenv.config();

const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  insecureAuth: true,
});

exports.getConnectionPool = (callback) => {
  connectionPool.getConnection((err, conn) => {
    if(!err) callback(conn);
  })
}

app.listen(8000,()=> {
  console.log('hello');
})

console.log("hihi");
