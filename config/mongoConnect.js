const mongoose = require('mongoose');  // 引入mongoose

var connection = () => {
	// mongoDB连接配置
	var _setting = {
			host: "xxx", // 云主机
			db: "file" ,// 连接库
			auth: "xxx:xxx" ,// 鉴权
			local: false // 本地连接 默认关闭
		}, 
		targetDb;
	
	// 获取连接
	// 连接本地时 请确保本地mongo无鉴权服务启动
	!_setting.local 
	? mongoose.connect(`mongodb://${_setting.auth}@${_setting.host}/${_setting.db}?authSource=admin`, { useNewUrlParser: true })
	: mongoose.connect(`mongodb://localhost:27017/${_setting.db}`, { useNewUrlParser: true });
	
	// 定义连接事件
	targetDb = mongoose.connection;
	
	targetDb.on('open', () => {
	    console.log('MongoDB Connection Successed');
	});
	
	targetDb.on('error', (err) => {
		if (err) {
			throw err;
		}
	});
};

module.exports = connection;