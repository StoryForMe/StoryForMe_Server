var express = require('express');
var router = express.Router();
const app = require('../app');
const keyword = require('../utils/keyword');
const user = require('../utils/user');
const episode = require('../utils/episode');
const series = require('../utils/series');

router.get('/list/:option/:uid', (req, res) => {
	app.getConnectionPool((conn) => {
		conn.query(series.get_series_list_sql(req.params.option, null), function(err, series_list) {
			conn.release();
			if(err) console.log(err);
			series.makeResForSeriesList(series_list, req, res);
	   })
	})
})

router.get('/list/:option/:uid/:kid', (req, res) => {
	app.getConnectionPool((conn) => {
		conn.query(series.get_series_list_sql(req.params.option, req.params.kid), function(err, series_list) {
			conn.release();
			if(err) console.log(err);
			series.makeResForSeriesList(series_list, req, res);
	   })
	})
})

router.get('/:sid', (req, res) => {
	series.getSeriesData(res, req.params.sid, (series_data) => res.json(series_data));
})

router.post('/', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into SERIES SET ?";
		var values = {
			title: req.body.title,
			image: req.body.image,
			recent_update: new Date(),
			hits: 0,
			hits_week: 0,
			hits_month: 0,
			introduction: req.body.introduction,
			zzimkkong: 0,
			zzimkkong_week: 0,
			zzimkkong_month: 0,
			is_end: 0,
			ad_days: 0,
			coin_num: 0,
			coin_full_num: 0,
			episode_num: 0,
			uid: req.body.uid,
			fname: req.body.fname,
			lname: req.body.lname
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (req.body.keywords.length == 0) 
				series.getSeriesData(res, results.insertId, (series_data) => res.json(series_data));
			else {
				var index = 0;
				function addKeywordToSeriesCallback() {
					index++;
					if (index == req.body.keywords.length) 
						series.getSeriesData(results.insertId, (series_data) => res.json(series_data));
					else keyword.addKeywordToSeries(results.insertId, req.body.keywords[index], addKeywordToSeriesCallback);
				}
				keyword.addKeywordToSeries(results.insertId, req.body.keywords[index], addKeywordToSeriesCallback);
			}
		})
	})
})

router.patch('/', (req, res) => {
	if (req.body.id == undefined) {
		res.json({ 
			error: "E005",
			error_message: "수정할 시리즈의 id 정보가 누락됨."
		})
	}
	app.getConnectionPool((conn) => {
		var sql = "update SERIES SET ? where id=" + req.body.id;
		var values = {};
		for(var key in req.body) {
			if (key != "id" && key != "keywords") values[key] = req.body[key]
		}
		conn.query(sql, values, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) {
				res.json({ 
					error: "E001",
					error_message: "해당 시리즈가 존재하지 않음."
				})
			}
			else if (req.body.keywords == null)
				series.getSeriesData(req.body.id, (series_data) => res.json(series_data));
			else {
				keyword.getSeriesKeyword(req.body.id, (keyword_list) => {
					var index = 0;
					function addKeywordToSeriesCallback() {
						index++;
						if (index == req.body.keywords.length) {
							index = 0;
							keyword.deleteKeywordFromSeries(req.body.id, keyword_list[index], deleteKeywordFromSeriesCallback);
						}
						else if (keyword_list.indexOf(req.body.keywords[index]) != -1) addKeywordToSeriesCallback()
						else keyword.addKeywordToSeries(req.body.id, req.body.keywords[index], addKeywordToSeriesCallback);
					}
					function deleteKeywordFromSeriesCallback() {
						index++;
						if (index == keyword_list.length) {
							series.getSeriesData(req.body.id, (series_data) => res.json(series_data));
						}
						else if (req.body.keywords.indexOf(keyword_list[index]) != -1) deleteKeywordFromSeriesCallback()
						else keyword.deleteKeywordFromSeries(req.body.id, keyword_list[index], deleteKeywordFromSeriesCallback);
					}
					keyword.addKeywordToSeries(req.body.id, req.body.keywords[index], addKeywordToSeriesCallback);
				})
			}
		})
	})
})

router.delete('/:sid', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from SERIES where id=" + req.params.sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else if (results.affectedRows == 0) res.json({ result: 0 }); 
			else res.json({ result: 1 }); 
		})
	})
})

module.exports = router;