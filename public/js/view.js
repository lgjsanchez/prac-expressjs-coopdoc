/**
 * 查看页面 
 * 逻辑脚本
 */
(function (init) {
	// 执行
	init && init(window);
}((g) => {
	// 闭包自定义变量定义 -------------------------------
	
	// 初始化区 ----------------------------------------
	window.onload = () => {
		// 构建列表
		listBuilder();
		
	};
	
	// 逻辑方法 -----------------------------------------
	
	/**
	 * 构建查看列表
	 */
	function listBuilder () {
		// 发起请求
		axios.get("/service/files/10000")
		.then(
			function okHandler (e) {
				var frgments = [];
				(e.data && e.data.length > 0) &&
				e.data.forEach(function (item, index) {
					// 格式化日期
					var d = new Date(item.updateTime), format;
					format = [
						[d.getFullYear(), patchZero(d.getMonth()), patchZero(d.getDay())].join("-"),
						[patchZero(d.getHours()), patchZero(d.getMinutes()), patchZero(d.getSeconds())].join(":")
					].join(" ");
					
					// 构建
					frgments.push(`
						<tr class="item">
							<th>${index + 1}. </th>
							<th>
								<a href="/service/file/download/${item._id}" download="${item.fileName || "(未知)"}">
									${item.fileName || "(未知)"}
								</a>
							</th>
							<th>${format || ""}</th>
							<th><button data-id="${item._id}" onclick="editHandler(event)" href="javascript:void(0)">编辑</button></th>
						</tr>
					`);
				});
				
				// 如果有值则构建dom元素
				frgments.length > 0 && $('.list-sheet table').append(frgments);
			},
			function badHadnler (err) {
				alert(err.response.data.message || "查询失败, 请重试");
				console.warn(err);
			}
		)
	}
	
	/**
	 * 事件 编辑
	 * 开放到全局 onclick属性可以访问到
	 */
	g.editHandler = function (ev) {
		var id = ev.currentTarget.dataset.id;
		if (!id) {
			alert("请传入文件ID");
			return false;
		}
		
		// 请求判断能否编辑
		axios.get("/service/lock/" + id)
		.then(
			function okHandler (e) {
				alert("即将前往编辑");
				// 跳转进入编辑页
				window.open("/edit/" + id);
			},
			function badHadnler (err) {
				var r = confirm("其它用户正在编辑中, 进入只读模式") ;
				r ? window.open("/edit/" + id) : "";
				console.warn(err);
			}
		);
		
		return false;
	}
	
	/**
	 * 小于10的数值补零
	 */
	function patchZero (v) {
		return v < 10 ? "0" + v : v
	}

	
}));