const express = require('express');
const mongoose = require('mongoose');
const File = require('../model/file'); 
const mylock = require('../func/mylock');
const router = express.Router();
const AsyncLock = require('async-lock');

// 定义 AsyncLock
const asyncLock = new AsyncLock();

// 定义 入库文件大小
const fileLimit = 10 * 1000;

/**
 * POST /file 
 * 处理添加文件
 */
router.post("/file", (req, rsp, next) => {
	var body = req.body;
	
	// 数据校验
	if (!req.body || !req.body.fileName.trim() || !req.body.fileContents.trim()) {
		badRsp(rsp, "保存文件失败, 请确认数据");
		return;
	}
	
	if (req.body.fileContents.length > fileLimit) {
		badRsp(rsp, `保存文件失败, 文件内容过多, 请不要超过${fileLimit}个字符`);
		return;
	}
	
	// 写数据到数据库
	File.create({
		fileName: req.body.fileName,
		fileContents: req.body.fileContents
	}, (err, data) => {
	    if (err) {
			badRsp(rsp, "创建文件失败");
			console.log(err);
			return;
		}
	    rsp.send(`保存文件成功`);
	});
});

/**
 * PUT /file/fileId
 * 更新文件
 */
router.put("/file/:fileId", (req, rsp, next) => {
	var body = req.body, 
		fileId = req.params.fileId;
	
	// 数据校验
	if (!req.body || !req.body.fileContents.trim() || !fileId) {
		badRsp(rsp, "保存文件失败, 请确认数据");
		return;
	}
	
	if (req.body.fileContents.length > fileLimit) {
		badRsp(rsp, `保存文件失败, 文件内容过多, 请不要超过${fileLimit}个字符`);
		return;
	}
	
	// 利用 AsyncLock 同步更新操作 
	// 限制在更新时文件锁过期导致的更新冲突
	asyncLock.acquire(fileId, () => {
	    return mylock.get(fileId, req.ip)
				.then(
					() => {
						// 写数据到数据库
						File.updateOne({"_id": fileId},
							{fileContents: req.body.fileContents, updateTime: Date.now()}, 
							(err, data) => {
								// 更新锁信息失败 则获取锁失败
								if (err) {
									console.log("更新文件信息失败: ", err);
									badRsp(rsp, "更新文件信息失败, 请重试");
									return;
								}
								
								// 释放锁
								mylock.release(fileId, req.ip);
								
								rsp.send("更新文件成功");
						});
					},
					(status) => {
						badRsp(rsp, "更新文件时间过长,其它人正在编辑中");
					}
				);
	})
	.catch((err) => {
	    console.log("更新文件失败: ", err.message);
	});
});

/**
 * GET /file/:fileId
 * 处理获取单个文件
 */
router.get("/file/:fileId", (req, rsp, next) => {
	if (!req.params.fileId) {
		badRsp(rsp, "请传入文件");
		return;
	}
	
	File.findOne({"_id": req.params.fileId}, (err, data) => {
		if (err || !data) {
			badRsp(rsp, "查无此文件");
			return;
		};
		
	    rsp.send(data);
	});
});

/**
 * GET /batch/file/:top
 * 批量获取文件
 */
router.get("/files/:top", (req, rsp, next) => {
	if (+req.params.top > 10*1000) {
		badRsp(rsp, "请求文件过多");
		return;
	}
	
	// 批量请求
	File.find({})
	  .limit(+req.params.top)
	  .sort('-updateTime')
	  .exec((err, data) => {
		  if (err  || !data) {
		  	badRsp(rsp, "查无文件");
			return 
		  };
		  
		  rsp.send(data);
	  });
});

/**
 * GET /file/download/:fileId
 * 下载文件
 */
router.get("/file/download/:fileId", (req, rsp, next) => {
	if (!req.params.fileId) {
		badRsp(rsp, "请传入文件ID");
		return;
	}
	
	File.findOne({"_id": req.params.fileId}, (err, data) => {
		if (err  || !data) {
			badRsp(rsp, "查无此文件");
			return;
		};
		
		// 设置文件下载的头部
		rsp.writeHead(200, {
		    'Content-Type': 'application/octet-stream',
		    'Content-Disposition': 'attachment;'
		});
		rsp.end(data.fileContents);
	});
});

/**
 * GET /lock/:fileId
 * 尝试获取文件锁 进入编辑
 */
router.get("/lock/:fileId", (req, rsp, next) => {
	if (!req.params.fileId) {
		badRsp(rsp, "请传入文件ID");
		return;
	}

	// 尝试获取锁
	mylock.get(req.params.fileId, req.ip)
		.then(
			(status) => {
				rsp.send("可以编辑");
			},
			(status) => {
				badRsp(rsp, "其他人正在编辑中");
			}
		);
});


/**
 * 定义错误返回
 */
function badRsp (rsp, mes) {
	rsp.status(500);
	rsp.send({
		message: mes
	});
}

module.exports = router;
