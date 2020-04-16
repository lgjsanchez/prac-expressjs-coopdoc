// 依赖引入
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // 解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
const logger = require('morgan');
const indexRouter = require('./routes/index');
const serviceRouter = require('./routes/service');
const mongoConnect = require('./func/mongoConnect');
const app = express();


// 设置模板以及资源路径
app.set('views', path.join(__dirname, 'views'));
app.engine(".html", require("ejs").__express);
app.set("view engine", "html")

// 载入中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 路由设置
app.use('/', indexRouter);
app.use('/service', serviceRouter);

// 数据库连接
mongoConnect();


// /**
//  * 404 处理器
//  */
// app.use(function(req, res, next) {
// 	next(createError(404));
// });

// /**
//  * 500 处理器
//  */
// app.use(function(err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
// 	// render the error page
// 	res.status(err.status || 500);
// 	res.render('error');
// });

// 模块输出
module.exports = app;
