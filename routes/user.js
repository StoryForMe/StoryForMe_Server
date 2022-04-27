var express = require('express');
var router = express.Router();
const app = require('../app');

router.get('/:login/:email', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where login_method=" + req.params.login + " and email='" + req.params.email +"'";
    conn.query(sql, function(err, [user]) {
      conn.release();
      if(err) console.log("error");
      else if(!user) {
        var result = {
          id: -1
        }
        res.json(result);
      } else {
        var result = {
          id: user["id"]
        }
        res.json(result);
      }
    })
  })
})

module.exports = router;