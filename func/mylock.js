const express = require('express');
const AsyncLock = require('async-lock');
const mongoose = require('mongoose');  // 引入mongoose
const File = require('../model/file'); // 定义文件数据模型
const Lock = require('../model/lock'); // 定义文件数据模型

// 定义各种锁拥有状态
const _status = {
	ERROR: -1, // 锁异常
	NOFOUND: 0, // 没有锁
	VALID: 1, // 锁存在且有效
	EXPIRE: 2, // 锁过期
	VALID_OWN: 3, // 锁存在自己持有
	VALID_OTH: 4, // 锁存在他人持有
}

// 定义锁操作
const locker = {
	get: null, // 获取锁
	release: null, // 释放锁
	hold: null, // 判断是否持有锁
	status: _status, // 锁状态枚举
};

// 定义 AsyncLock
asyncLock = new AsyncLock();

// 定义超时时间
const timeOut = 1000 * 10;

// 获得一个文件的锁
locker.get = (fileId, owner) => {
	return locker.hold(fileId, owner)
	.then(
		(status) => {
			return Promise.resolve(status);
		},
		(status) => {
			// 加锁
			return new Promise((resolve, reject) => {
				switch(status) {
					// 更新过期锁 成为新锁
					case _status.EXPIRE: 
						Lock.updateOne({"_id": fileId},
							{owner: owner, lockTime: Date.now()}, 
							(err, data) => {
								// 更新锁信息失败 则获取锁失败
								if (err) {
									console.log("更新锁信息失败: ", err);
									return reject(_status.ERROR);
								}
								
								// 获取锁成功
								resolve(_status.VALID_OWN);
						});
						break;
						
					// 没有锁 创建
					case _status.NOFOUND: 
						Lock.create({
							"_id": fileId,
							owner: owner,
							timeout: timeOut
						}, (err, data) => {
							// 加锁失败
						    if (err) {
								console.log("添加锁信息失败: ", err);
								return reject(_status.ERROR);
							}
							
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
			// 查询出错 无法判断有没有锁 重新
			if (err) {
				console.log("释放一个文件锁失败: ", err);
				return reject(_status.ERROR);
			};
			
			// 没有锁
			if (!data) {
				return reject(_status.NOFOUND);
			}
			
			// 判断锁是否过期 过期了就是已经解除了 
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