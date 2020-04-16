/**
 * 编辑页面 
 * 逻辑脚本
 */
(function (init) {
	// 执行
	init && init(window);
}((g) => {
	// 闭包自定义变量定义 -------------------------------
	
	// 初始化区 ----------------------------------------
	window.onload = () => {
		
		// 事件: 定义表单提交 
		document.querySelector("form input[name='save']").addEventListener("click", submit);
	};
	
	// 逻辑方法 -----------------------------------------
	
	/**
	 * 事件 表单提交
	 */
	function submit (ev) {
		// 检查参数
		var form = document.querySelector("form");

		if (!form.fileContents.value) {
			return alert("无法提交: 请输入文件内容");
		}
		
		// 发起请求
		var d = ev.currentTarget.dataset || {};
 		axios.put("/service/file/" + d.id, {
			fileContents: form.fileContents.value,
			version: d.version
		})
		.then(
			function okHandler (e) {
				// 编辑成功 进入查看页面
				alert(e.data);
				location.replace("/view");
			},
			function badHadnler (err) {
				// 提示操作过期
				alert(err.response.data.message);
				console.warn(err);
				
				// 下载用户自己文件到本地 防止丢失
				var binary = new Blob([form.fileContents.value], {type: 'application/octet-stream'})
					download = URL.createObjectURL(binary);
				$(`<a href="${download}" download="自己编辑的副本,防止丢失"></a>`)[0].click();
				
				// 重载页面
				location.reload();
			}
		);
	}

	
}));