const app = require('../app');

exports.getSeries = (sid, callback) => [
  app.getConnectionPool((conn) => {
    var sql = "select title, recent_update, hits, zzimkkong, episode_num from SERIES where id=" + sid;
    conn.query(sql, function(err, results) {
      conn.release();
      if (err) console.log(err);
      else callback(results);
    })
  })
]