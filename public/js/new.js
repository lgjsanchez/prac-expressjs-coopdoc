/**
 * 新建页面 
 * 逻辑脚本
 */
(function (init) {
	// 执行
	init && init(window);
}((g) => {
	// 闭包自定义变量定义 -------------------------------
	
	// 初始化区 ----------------------------------------
	window.onload = () => {
		console.log("欢迎进入 WebEditor");
		
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
		if (!form.fileName.value) {
			return alert("无法提交: 请输入文件名");
		}
		if (!form.fileContents.value) {
			return alert("无法提交: 请输入文件内容");
		}
		
		// 发起请求
		axios.post("/service/file", {
			fileName: form.fileName.value.trim(),
			fileContents: form.fileContents.value.trim()
		})
		.then(
			function okHandler (e) {
				// 提交成功 进入查看页面
				alert(e.data);
				location.replace("/view");
			},
			function badHadnler (err) {
				alert("提交失败,请重试");
				console.warn(err);
			}
		);
	}

	
}));