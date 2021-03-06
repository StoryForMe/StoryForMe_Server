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
      if(err) {
        res.status(400).json({ 
          error: "E001", 
          error_message: "작가(혹은 사용자)가 존재하지 않음"
        })
      }
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
      if(err) {
        res.status(400).json({ 
          error: "E001", 
          error_message: "시리즈(혹은 사용자)가 존재하지 않음"
          // 쿼리가 틀린 거긴한데 대부분은 시리즈가 존재 하지 않는 경우가 아닐까?
        })
      }
      else {
        series.updateZzimkkongNum(res, req.body.sid, (result) => {
          res.json({ result: result })
        })
      }
    })
  })
})

router.delete('/writer/:uid/:wid', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "delete from ZZIMKKONG_WRITER where uid=" + req.params.uid + ' and wid=' + req.params.wid;
    conn.query(sql, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(results.affectedRows == 0) res.json({ result: 0 });
      else res.json({ result: 1 })
    })
  })
})

router.delete('/series/:uid/:sid', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "delete from ZZIMKKONG_SERIES where uid=" + req.params.uid + ' and sid=' + req.params.sid;
    conn.query(sql, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
      else if(results.affectedRows == 0) res.json({ result: 0 });
      else {
        series.deleteZzimkkongNum(res, req.params.sid, (result) => {
          res.json({ result: result })
        })
      }
    })
  })
})

module.exports = router;