// 工具库对象
const idbFileTool = {
	// IndexedDB数据库名称和版本
	DB_NAME: "fileDatabase",
	DB_VERSION: 1,

	// 存储对象的名称
	OBJECT_STORE_NAME: "fileStore",

	// 初始化IndexedDB数据库
	init: function () {
		const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
		request.onerror = function (event) {
			console.error("IndexedDB error:", event.target.error);
		};

		request.onupgradeneeded = function (event) {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(this.OBJECT_STORE_NAME)) {
				db.createObjectStore(this.OBJECT_STORE_NAME, { keyPath: "id" });
			}
		}.bind(this);
		request.onsuccess = ()=>{
			console.log(request.result)
			this.db = request.result;
		}
	},

	// 保存文件
	saveFile: function (file, fileId) {
		const transaction = this.db.transaction(
			[this.OBJECT_STORE_NAME],
			"readwrite"
		);
		const objectStore = transaction.objectStore(this.OBJECT_STORE_NAME);
		objectStore.put({ id: fileId, blob: file });
	},

	// 修改文件
	updateFile: function (fileId, newFile) {
		const transaction = this.db.transaction(
			[this.OBJECT_STORE_NAME],
			"readwrite"
		);
		const objectStore = transaction.objectStore(this.OBJECT_STORE_NAME);
		const request = objectStore.get(fileId);

		request.onsuccess = function (event) {
			if (event.target.result) {
				event.target.result.blob = newFile;
				objectStore.put(event.target.result);
			}
		};
	},

	// 删除文件
	delFile: function (fileId) {
		const transaction = this.db.transaction(
			[this.OBJECT_STORE_NAME],
			"readwrite"
		);
		const objectStore = transaction.objectStore(this.OBJECT_STORE_NAME);
		try{
			objectStore.delete(fileId);
		}catch(error){
			console.error("未找到文件,无法删除")
		}
	},

	// 获取文件，返回 Promise
	getFile: function(fileId) {
		return new Promise((resolve, reject) => {
		  const transaction = this.db.transaction([this.OBJECT_STORE_NAME]);
		  const objectStore = transaction.objectStore(this.OBJECT_STORE_NAME);
		  const request = objectStore.get(fileId);
	
		  request.onsuccess = function(event) {
			if (event.target.result) {
			  resolve(event.target.result.blob);
			} else {
			  reject(new Error('文件未找到'));
			}
		  };
		  request.onerror = function(event) {
			reject(event.target.error);
		  };
		});
	}
};
export default idbFileTool