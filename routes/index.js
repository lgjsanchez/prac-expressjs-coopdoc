const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mylock = require('../func/mylock');
const File = require('../model/file'); 

// 索引页面 新建页面
router.get('/', function(req, rsp, next) {
	rsp.render('new');
});
router.get('/index', function(req, rsp, next) {
	rsp.render('new');
});

// 查看页面
router.get('/view', function(req, rsp, next) {
	rsp.render('view');
});

// 编辑页面
router.get('/edit/:fileId', function(req, rsp, next) {
	// 持有锁进入编辑页面 没有持有进入只读页面
	mylock.get(req.params.fileId, req.ip)
		.then(
			() => {
				return Promise.resolve('edit');
			},
			() => {
				return Promise.resolve('read');
			}
		)
		.then(
			(page) => {
				File.findOne({"_id": req.params.fileId}, (err, data) => {
					if (err || !data) {
						rsp.locals.message = "查询文件失败";
						rsp.render("error");
						return;
					};
						
					rsp.locals.id = req.params.fileId;
					rsp.locals.fileName = data.fileName;
					rsp.locals.fileContents = data.fileContents;
					rsp.locals.version = data.version;
					rsp.render(page);
				});
			}
		);
});

module.exports = router;
