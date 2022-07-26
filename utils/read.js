const app = require('../app');

exports.recordReadInfo = (res, uid, sid, eid, chapter, date, callback) => {
  app.getConnectionPool((conn) => {
    console.log("special " + uid);
    var sql = "insert into `READ`(uid, sid, eid, chapter, date) values(" + uid + ", " + sid + ", " + eid + ", '" + chapter + "', '" + date + "') on duplicate key update uid=" + uid + ", sid=" + sid + ", eid=" + eid + ", chapter='" + chapter + "', date='" + date +"'";
    conn.query(sql, function(err, results) {
      conn.release();

      if(err) {
        res.json({ err: err })
      }

      // if(err) {
      //   console.log("here");
      //   addReadInfo(uid, sid, eid, chapter, date, (result) => {
      //     callback(result);
      //   });
      // }
      // else {
      //   console.log("no here");
      //   updateReadInfo(uid, sid, eid, chapter, date, (result) => {
      //     callback(result);
      //   });
      // }
    })
  })
}

// function updateReadInfo(uid, sid, eid, chapter, date, callback) {
//   app.getConnectionPool((conn) => {
//     console.log("problem " + uid);
//     var sql = "update `READ` SET ? where uid=" + uid + " and sid=" + sid;
//     var values = {
//       eid: eid,
//       recent_episode: chapter,
//       date: date
//     }
//     conn.query(sql, values, function(err, results) {
//       conn.release();
//       if (err) {
//         console.log(err)
//       } else {
//         callback({ result: 1 });
//       }
//     })
//   })
// }
// exports.updateReadInfo = updateReadInfo;

// function addReadInfo(uid, sid, eid, chapter, date, callback) {
//   app.getConnectionPool((conn) => {
//     var sql = "insert into `READ` SET ? ";
//     var values = {
//       uid: uid,
//       eid: eid,
//       sid: sid,
//       recent_episode: chapter,
//       date: date
//     }
//     conn.query(sql, values, function(err, results) {
//       conn.release();
//       if (err) {
//         // console.log(err)
//       } else {
//         callback({ result: 1 });
//       }
//     })
//   })
// }
// exports.addReadInfo = addReadInfo;