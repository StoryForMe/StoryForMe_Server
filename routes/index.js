var express = require('express');
var router = express.Router();

const User = require('./user');
const Series = require('./series');
const Episode = require('./episode');
//const Comment = require('./comment');

router.use('/user', User);
router.use('/series', Series);
router.use('/episode', Episode);
//router.use('/comment', Comment);

router.get('/', function(req, res, next) {
  res.send('hello world!!');
});

module.exports = router;
