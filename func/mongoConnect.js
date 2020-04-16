const mongoose = require('mongoose');  // 引入mongoose

var connection = () => {
	// mongoDB连接
	var _setting = {
			host: "47.111.178.186:27017", // 云主机
			db: "file" // 连接库
		}, 
		targetDb;
	
	// 获取连接和连接的库
	mongoose.connect(`mongodb://@${_setting.host}/${_setting.db}?authSource=admin`, { useNewUrlParser: true });
	targetDb = mongoose.connection;
	
	// 定义连接事件
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