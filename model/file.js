var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 声明一个文件对象模型
var schema = new Schema({
	// 文件名
    fileName: {
        type: String
    },
	// 文件内容
    fileContents: {
        type: String
    },
	// 创建时间
    createTime: {
        type: Date,
        default : Date.now()
    },
	// 最后更新时间
	updateTime: {
	    type: Date,
	    default : Date.now()
	},
	// 版本号
	version: {
		type: Number,
		default: 1
	}
});

module.exports = mongoose.model('file', schema);