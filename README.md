文件协同编辑

环境

1. 服务端 `nodejs v10.16.0`，`express` 简易框架
2. 前端 原生js
3. 数据库 mongoDB 

操作：

请确保在有`nodejs v10.16.0`版本及以上。

运行下面指令，浏览器访问`localhost:8080`即可：

```bash
npm install
npm start
```

已经部署云端mongoDB，如果云端数据库宕机，请修改代码连接本地mongoDB数据库

`/config/mongoConnec.js `

```javascript
// 修改setting配置local属性为true
_setting = {
	// ..
	local: true // 开启本地连接
}
```

