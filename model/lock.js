var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 声明一个锁对象模型
var schema = new Schema({
	// 拥有者
    owner: {
        type: String
    },
	// 锁创建时间
    lockTime: {
        type: Date,
        default: Date.now()
    },
	// 锁超时时间 
	timeout: {
		type: String
	}
});

module.exports = mongoose.model('lock', schema);