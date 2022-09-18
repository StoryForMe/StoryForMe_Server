const app = require('../app');

exports.UserModelCodes = {
    SUCCESS: 'SUCCESS',
    DB_QEURY_ERROR: 'query 문법 오류',
    USER_NOT_FOUND: 'id에 해당하는 유저가 존재하지 않습니다.'
}

exports.findOne = (id) => {
    console.log('dlwldnjs qkqh')
    app.getConnectionPool(async (conn) => {
        console.log("!!!!!!")
        var sql = "select * from USER where id=" + id;
        [err, results] = await conn.query(sql);
        console.log('??????')
        console.log(err)
        console.log(results)
        conn.release();
        if (err) {
            return {
                code: UserModelCodes.DB_QEURY_ERROR,
            }
        }
        if(!results[0]) {
            return {
                code: this.UserModelCodes.USER_NOT_FOUND,
            }
        }
        return {
            code: UserModelCodes.SUCCESS,
            user: results[0],
        }
    });
}