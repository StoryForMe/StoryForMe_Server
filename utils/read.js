const app = require('../app');

exports.recordReadInfo = (res, uid, sid, eid, chapter, date, callback) => {
  app.getConnectionPool((conn) => {
    console.log("special " + uid);
    var sql = "select * from `READ` where uid=" + uid + " and sid=" + sid;
    conn.query(sql, values, function(err, results) {
      conn.release();

      if(err) {
        console.log("here");
        addReadInfo(uid, sid, eid, chapter, date);
      }
      else {
        console.log("no here");
        updateReadInfo(uid, sid, eid, chapter, date);
      }
    })

  //   conn.query(sql, values, function(err, results) {
  //     conn.release();
  //     if(err) {
  //       res.status(400).json({
  //         error: "E001",
  //         error_message: err
  //       })
  //     }
  //     else {
  //       callback({ result: 1 })
  //     }
  //   })
  // })
  })
}

function updateReadInfo(uid, sid, eid, chapter, date, callback) {
  app.getConnectionPool((conn) => {
    console.log("problem " + uid);
    var sql = "update `READ` SET ? where uid=" + uid + " and sid=" + sid;
    var values = {
      eid: eid,
      recent_episode: chapter,
      date: date
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if (err) {
        console.log(err)
      } else {
        callback();
      }
    })
  })
}
exports.updateReadInfo = updateReadInfo;

function addReadInfo(uid, sid, eid, chapter, date, callback) {
  app.getConnectionPool((conn) => {
    var sql = "insert into `READ` SET ? ";
    var values = {
      uid: uid,
      eid: eid,
      sid: sid,
      recent_episode: chapter,
      date: date
    }
    conn.query(sql, values, function(err, results) {
      conn.release();
      if (err) {
        // console.log(err)
      } else {
        callback();
      }
    })
  })
}
exports.addReadInfo = addReadInfo;