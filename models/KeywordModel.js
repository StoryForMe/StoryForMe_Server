const app = require('../app');

exports.KeywordModelCodes = {
    SUCCESS: 'SUCCESS',
    DB_QEURY_ERROR: 'query 문법 오류',
}

exports.findAll = (uid) => {
    app.getConnectionPool(async (conn) => {
        var sql = "select * from KEYWORD as k join `LIKE` as l on k.id=l.kid where uid=" + uid;
        [err, results] = await conn.query(sql);
        console.log(err)
        console.log(results)
        conn.release();
        if (err) {
            return {
                code: KeywordModelCodes.DB_QEURY_ERROR,
            }
        }
        return {
            code: KeywordModelCodes.SUCCESS,
            keywords: results,
        }
    });
}
