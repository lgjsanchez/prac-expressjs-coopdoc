const express = require('express');
const AsyncLock = require('async-lock');
const mongoose = require('mongoose');  // 引入mongoose
const Lock = require('../model/lock');

// 定义各种锁拥有状态
const _status = {
	ERROR: -1, // 锁异常
	NOFOUND: 0, // 没有锁
	VALID: 1, // 锁存在且有效
	EXPIRE: 2, // 锁过期
	VALID_OWN: 3, // 锁存在自己持有
	VALID_OTH: 4, // 锁存在他人持有
}

// 定义锁操作 方法返回体都以Promise方式构造
const locker = {
	get: null, // 获取锁
	release: null, // 释放锁
	hold: null, // 判断是否持有锁
	status: _status, // 锁状态枚举
};

// 定义 AsyncLock
asyncLock = new AsyncLock();

// 定义超时时间
const timeOut = 1000 * 15;

// 获得一个文件的锁
locker.get = (fileId, owner) => {
	return locker.hold(fileId, owner)
			.then(
				(status) => {
					// 自己持有锁 直接返回
					return Promise.resolve(status);
				},
				(status) => {
					// 未持有锁 但是存在多种情况
					return new Promise((resolve, reject) => {
						switch(status) {
							// 旧锁过期 先删除 后新建 避免脏数据更新失效
							case _status.EXPIRE: 
								Lock.deleteOne({"_id": fileId}, (err, data) => {
								    if (err) {
										console.log("释放一个文件锁失败: ", err);
										return reject(_status.ERROR);
									};
									console.log(1, owner)
									
								    Lock.create({"_id": fileId, "owner": owner, "timeout": timeOut, "lockTime": Date.now()}, (err, data) => {
								    	// 加锁失败
								    	if (err) {
								    		console.log("添加锁信息失败: ", err);
								    		return reject(_status.ERROR);
								    	}
								    	
										console.log(2, owner)
								    	// 获取锁成功
								    	resolve(_status.VALID_OWN);
								    });
								});
								break;
							// 没有锁 直接新建获得锁
							case _status.NOFOUND: 
								Lock.create({"_id": fileId, "owner": owner, "timeout": timeOut, "lockTime": Date.now()}, (err, data) => {
									// 加锁失败
									if (err) {
										console.log("添加锁信息失败: ", err);
										return reject(_status.ERROR);
									}
									console.log(3, owner)
									// 获取锁成功
									resolve(_status.VALID_OWN);
								});
								break;
							// 其它状态 获取锁失败
							default: reject(status);
						}	
					});
				}
			);
}

// 释放一个文件锁
locker.release = (fileId, ip) => {
	if (!fileId || !ip) {
		console.log("释放一个文件锁失败: 请传入文件参数");
		return Promise.reject(_status.ERROR);
	}
	
	return new Promise((resolve, reject) => {
		// 判断是否已经有锁
		Lock.findOne({"_id": fileId}, (err, data) => {
			// 查询出错 无法判断有没有锁
			if (err) {
				console.log("释放一个文件锁失败: ", err);
				return reject(_status.ERROR);
			};
			
			// 没有锁
			if (!data) {
				return reject(_status.NOFOUND);
			}
			
			// 释放锁 删除锁记录
			Lock.deleteOne({"_id": fileId, "owner": ip}, (err, data) => {
			    if (err) {
					console.log("释放一个文件锁失败: ", err);
					return reject(_status.ERROR);
				};
				
			    resolve(_status.NOFOUND);
			});
		});
	});
}

// 判断是否持有锁
locker.hold = (fileId, owner) => {
	if (!fileId || !owner) {
		console.log("持有锁判断失败: 未传入必要参数");
		return Promise.reject(_status.ERROR);
	}
	
	return new Promise((resolve, reject) => {
		// 判断是否已经有锁
		Lock.findOne({"_id": fileId}, (err, data) => {
			// 查询出错 无法判断有没有锁
			if (err) {
				console.log("持有锁判断失败: ", err);
				return reject(_status.ERROR);
			};
			
			// 没有锁
			if (!data) {
				return reject(_status.NOFOUND);
			}
			
			// 判断锁是否过期
			if ((Date.now() - new Date(data.lockTime).getTime()) > +data.timeout) {
				return reject(_status.EXPIRE)
			}
			
			// 判断是否拥有
			owner === data.owner ? resolve(_status.VALID_OWN) : reject(_status.VALID_OTH);
		});
	});
}

module.exports = locker;