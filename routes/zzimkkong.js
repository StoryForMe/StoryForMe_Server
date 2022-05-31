var express = require('express');
var router = express.Router();
const app = require('../app');
const series = require('../utils/series');

router.post('/writer', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "insert into ZZIMKKONG_WRITER SET ?";
    var values = {
      uid: req.body.uid,
      wid: req.body.wid
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) res.json({ result: 0})
      else {
        res.json({ result: 1 })
      }
    })
  })
})

router.post('/series', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "insert into ZZIMKKONG_SERIES SET ?";
    var values = {
      uid: req.body.uid,
      sid: req.body.sid
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) res.json({ result: 0})
      else {
        series.updateZzimkkongNum(req.body.sid, (result) => {
          res.json({ result: result })
        })
      }
    })
  })
})

module.exports = router;