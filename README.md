### 环境

1. 服务端 `nodejs v10.16.0`，`express` 简易框架
2. 前端 原生js
3. 数据库 mongoDB 

### 操作

- 请确保在有`nodejs v10.16.0`版本及以上。

  运行下面指令，浏览器访问`localhost:8080`即可，分正常以及debug模式启动：

  ```bash
  npm install --save-dev
  npm start # 正常启动
  npm run dev # debug模式 
  ```

- 已经部署云端mongoDB，如果云端数据库宕机，请修改代码连接本地mongoDB数据库

  `/config/mongoConnec.js `

  ```javascript
  // 修改setting配置local属性为true
  _setting = {
  	// ..
  	local: true // 开启本地连接
  }
  ```

- debug使用node inspector 使用参考: https://zhuanlan.zhihu.com/p/30264842



