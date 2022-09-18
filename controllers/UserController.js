const HTTP = require('http-status-codes');
const _ = require('lodash')

const UserModel = require('../models/UserModel')
const KeywordModel = require('../models/KeywordModel')


exports.getUser = (req, res) => {
    let getUserResponse = UserModel.findOne(req.params.id);
    if (getUserResponse['code'] === UserModel.UserModelCodes.USER_NOT_FOUND) {
        res.status(HTTP.StatusCodes.NOT_FOUND).json({
            error: "E001",
            error_message: getUserResponse['code'],
        })
    }
    if (getUserResponse['code'] !== UserModel.UserModelCodes.SUCCESS) {
        res.status(HTTP.StatusCodes.BAD_REQUEST).json({
            error: "E002",
            error_message: getUserResponse['code'],
        })
    }

    let getKeywordResponse = KeywordModel.findAll(req.params.id);
    if (getKeywordResponse['code'] !== KeywordModel.KeywordModelCodes.SUCCESS) {
        res.status(HTTP.StatusCodes.BAD_REQUEST).json({
            error: "E002",
            error_message: getKeywordResponse['code'],
        })
    }

    let keywords = _.map(getKeywordResponse['keywords'], (keyword) => ({
        id: keyword['id'],
    }));
    const user = getUserResponse['user'];
    res.status(HTTP.StatusCodes.OK).json({
        nickname: user["nickname"],
        introduction: user["introduction"],
        profile_image: user["profile_image"],
        fname: user["fname"],
        lname: user["lname"],
        coin: user["coin"],
        keywords: keywords,
    });
}