const app = require('../app');

exports.addReadInfo = (res, uid, sid, eid, chapter, callback) => {
  app.getConnectionPool((conn) => {
    var sql = "update `READ` SET ? where uid=" + uid + " and sid=" + sid;
    var values = {
      eid: eid,
      recent_episode: chapter
    }

    conn.query(sql, values, function(err, results) {
      conn.release();
      if(err) {
        res.status(400).json({
          error: "E001",
          error_message: "존재하지 않는 id가 있음"
        })
      }
      else {
        res.json({ result: 1 })
      }
    })
  })
}