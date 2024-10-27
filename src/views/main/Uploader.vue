<template>
  <div class="uploader-panel">
    <div class="uploader-title">
      <span>上传任务</span>
      <span class="tips">（仅展示本次上传任务）</span>
      <el-button
        type="danger"
        @click="delAllUpload"
        :disabled="filelist.length == 0"
      >
        <span class="iconfont icon-del m-right"></span>
        清空
      </el-button>
    </div>
    <div class="file-list">
      <div v-for="(item, index) in filelist" :key="index" class="file-item">
        <div class="upload-panel">
          <div class="file-name">
            {{ item.fileName }}
          </div>
          <div class="progress">
            <el-progress
              :percentage="item.uploadProgress"
              v-if="
                item.status == STATUS.uploading.value ||
                item.status == STATUS.upload_seconds.value ||
                item.status == STATUS.upload_finish.value
              "
            >
            </el-progress>
          </div>
          <div class="upload-status">
            <!-- 图标 -->
            <span
              :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
              :style="{ color: STATUS[item.status].color }"
            >
            </span>
            <!-- 状态描述 -->
            <span class="stauts" :style="{ color: STATUS[item.status].color }">
              {{ item.status == "fail" ? item.errorMsg : STATUS[item.status].desc }}
            </span>
            <!-- 上传中 -->
            <span class="upload-info" v-if="item.status == STATUS.uploading.value">
              {{ proxy.Utils.size2Str(item.uploadSize) }} /
              {{ proxy.Utils.size2Str(item.totalSize) }}
            </span>
          </div>
        </div>
        <div class="op">
          <!-- md5 -->
          <el-progress
            type="circle"
            :width="50"
            :percentage="item.md5Progress"
            v-if="item.status == STATUS.init.value"
          >
          </el-progress>
          <div class="op-btn">
            <!-- 上传中 -->
            <span v-if="item.status == STATUS.uploading.value">
              <Icon
                :width="28"
                class="btn-item"
                iconName="upload"
                v-if="item.pause"
                title="上传"
                @click="startUpload(item.uid)"
              >
              </Icon>
              <Icon
                v-else
                :width="28"
                class="btn-item"
                iconName="pause"
                title="暂停"
                @click="pauseUpload(item.uid)"
              >
              </Icon>
            </span>
            <!-- 解码中，上传成功，秒传成功 -->
            <Icon
              v-if="
                item.status != STATUS.init.value &&
                item.status != STATUS.upload_finish.value &&
                item.status != STATUS.upload_seconds.value
              "
              :width="28"
              class="btn-item"
              iconName="del"
              title="删除"
              @click="delUpload(item.uid, index)"
            >
            </Icon>
            <!-- 上传完成，秒传 -->
            <Icon
              v-if="
                item.status == STATUS.upload_finish.value ||
                item.status == STATUS.upload_seconds.value
              "
              :width="28"
              class="btn-item"
              iconName="clean"
              title="清除"
              @click="clearUpload(item.uid, index)"
            >
            </Icon>
          </div>
        </div>
      </div>

      <!-- 没有上传任务 -->
      <div v-if="filelist.length == 0">
        <NoData msg="暂无上传任务"></NoData>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance,onMounted } from "vue";

// import SparkMD5 from "spark-md5";
import jsSHA from "jssha";

//================================================================globolVar
const { proxy } = getCurrentInstance();
//================================================================api
const api = {
  upload: "/file/uploadFile",
};
//================================================================props

//================================================================var
//----------------------------------common
const filelist = ref([]); // 上传文件列表
const STATUS = {
  emptyfile: {
    value: "emptyfile",
    desc: "文件为空",
    color: "#F75000",
    icon: "close",
  },
  fail: {
    value: "fail",
    desc: "上传失败",
    color: "#F75000",
    icon: "close",
  },
  init: {
    value: "init",
    desc: "解析中",
    color: "#e6a23c",
    icon: "clock",
  },
  uploading: {
    value: "uploading",
    desc: "上传中",
    color: "#409eff",
    icon: "upload",
  },
  upload_finish: {
    value: "upload_finish",
    desc: "上传完成",
    color: "#67c23a",
    icon: "ok",
  },
  upload_seconds: {
    value: "upload_seconds",
    desc: "秒传",
    color: "#67c23a",
    icon: "ok",
  },
};

const chunkSize = 1024 * 1024 * 5; // 定义分片大小为5MB
const delList = ref([]); //删除列表

//----------------------------------rules

//----------------------------------computed

 

//================================================================methods
//----------------------------------common
// webworker异步操作
const createWorker2getSHAstr = (arrayBuffer)=>{
  return new Promise((res,rej)=>{
    const worker = new Worker("/worker.js")
    worker.onmessage = (e)=>{
      res(e.data)
      worker.terminate()
    }
    worker.onerror = rej
    worker.postMessage(arrayBuffer)
  })
}

// md5操作
const computedMD5 = async (fileItem) => {
  let file = fileItem.file; // 获取文件对象
  // 切片
  let blogSlice =
    File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;

  // 切片的总数
  let chunks = Math.ceil(file.size / chunkSize);

  // 当前分片
  let currentChunk = 0;

  // let spark = new SparkMD5.ArrayBuffer(); // 创建 SparkMD5 实例用于计算 MD5 值
  let shaObj = new jsSHA("SHA3-256", "TEXT");

  let fileReader = new FileReader(); // 创建 FileReader 对象用于读取文件
  // 计算下一个分片
  let loadNext = () => {
    let start = currentChunk * chunkSize;
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsArrayBuffer(blogSlice.call(file, start, end));
  };

  loadNext(); // 加载第一个分片
  return new Promise((resolve, reject) => {
    let resFile = getFileUid(file.uid); // 获取文件对象
    resFile.md5Progress = 0;
    // 文件读取成功时触发
    fileReader.onload = async (e) => {
      // spark.append(e.target.result); // 将读取的文件数据添加到 SparkMD5 实例中
      // 使用webworker 异步处理生成sha
      let str = await createWorker2getSHAstr(e.target.result)
      shaObj.update(str)
      
      currentChunk++;

      // 如果还有分片未读取完
      if (currentChunk < chunks) {
        let percent = Math.floor((currentChunk / chunks) * 100); // 计算分片读取进度
        resFile.md5Progress = percent; // 更新文件的 MD5 计算进度
        loadNext(); // 加载下一个分片
      } else {
        // 所有分片都已读取完
        // let md5 = spark.end(); // 计算文件的 MD5 值
        let md5 = shaObj.getHash("HEX");
        //spark.destroy(); // 释放内存
        resFile.md5Progress = 100; // 设置 MD5 计算进度为 100%
        resFile.status = STATUS.uploading.value; // 更新文件状态为上传中
        resFile.md5 = md5; // 存储文件的 MD5 值
        resolve(fileItem.uid); // 返回文件的唯一标识
      }
    };

    // 文件读取失败时触发
    fileReader.onerror = (e) => {
      resFile.md5Progress = -1; // 设置 MD5 计算进度为 -1，表示失败
      resFile.status = STATUS.fail.value; // 更新文件状态为上传失败
      resolve(fileItem.uid); // 返回文件的唯一标识
    };
  }).catch((error) => {
    // 捕获异常
    console.error(error);
    return null;
  });
};
// 获取文件
const getFileUid = (uid) => {
  let file = filelist.value.find((item) => {
    return item.file.uid === uid;
  });
  return file;
};
// 修改文件
const setFileValue = (uid,keyValueObj)=>{
  for(let i=0;i<filelist.value.length;i++){
    if(filelist.value[i].file.uid===uid){
      Object.assign(filelist.value[i],keyValueObj)
      break;      
    }
  }
}

///
// 开始上传
const startUpload = (uid)=>{
  setFileValue(uid,{
    pause:false
  })
  uploadFile(uid,getFileUid(uid).chunkIndex)
  localStorage.setItem('filelist',JSON.stringify(filelist.value))
  // console.log('开始上传',uid)
}
//暂停上传
const pauseUpload = (uid)=>{
  setFileValue(uid,{pause:true})
  localStorage.setItem('filelist',JSON.stringify(filelist.value))
  // console.log('暂停上传',uid)
}
// 全部删除
const delAllUpload = ()=>{
  filelist.value = []
  localStorage.setItem('filelist',JSON.stringify(filelist.value))
}

// 删除正在上传的任务
const delUpload = (uid,index)=>{
  // console.log('删除正在上传的任务',uid,index)
  filelist.value.splice(index,1)
  localStorage.setItem('filelist',JSON.stringify(filelist.value))
}
// 删除已经上传完成的任务
const clearUpload = (uid,index)=>{
  // console.log('删除已经上传的任务',uid,index)
  filelist.value.splice(index,1)
  localStorage.setItem('filelist',JSON.stringify(filelist.value))
}
//----------------------------------watch

//----------------------------------onMounted
onMounted(()=>{
  let list = localStorage.getItem('filelist')
  if(list){
    filelist.value = JSON.parse(list)
  }
})
//================================================================emits
const emit = defineEmits(["uploadCallback"]);
//================================================================expose
const addFile = async (file, filePid) => {
  const fileItem = {
    // 文件 （文件大小，文件流，文件名。。。）
    file: file,
    // 文件uid
    uid: file.uid,
    // 文件MD5进度
    md5Progress: 0,
    // 文件MD5值
    md5: null,
    // 文件名
    fileName: file.name,
    // 上传状态
    status: STATUS.init.value,
    // 已上传大小
    uploadSize: 0,
    // 文件总大小
    totalSize: file.size,
    // 文件上传进度
    uploadProgress: 0,
    // 暂停
    pause: false,
    // 当前分片
    chunkIndex: 0,
    // 父级文件ID
    filePid: filePid,
    // 错误信息
    errorMsg: null,
    type:file.type
  };
  // 存到localStorage
  filelist.value.unshift(fileItem);
  if (fileItem.totalSize == 0) {
    fileItem.status = STATUS.emptyfile.value;
    localStorage.setItem("filelist",JSON.stringify(filelist.value))
    return;
  }
  let md5FileUid = await computedMD5(fileItem);
  if (md5FileUid == null) {
    return;
  }
  uploadFile(md5FileUid);
};
defineExpose({
  addFile,
});
//================================================================request
// 上传文件
const uploadFile = async (uid, chunkIndex) => {
  chunkIndex = chunkIndex || 0;
  // 分片上传
  let currentFile = getFileUid(uid);

  let file = currentFile.file;
  if(!file.name){
    // 断点续传
    try{
      file = await proxy.IdbFileTool.getFile(uid)
    }catch(error){
      proxy.Message.error(error)
      return;
    }
  }
  const fileSize = currentFile.totalSize;
  const chunks = Math.ceil(fileSize / chunkSize);
  for (let i = chunkIndex; i < chunks; i++) {
    let delIndex = delList.value.indexOf(uid);
    if (delIndex != -1) {
      delList.value.slice(delIndex, 1);
      break;
    }
    if (currentFile.pause) {
        setFileValue(uid,{
          chunkIndex:i,
        })
      // 保存到idb中
      proxy.IdbFileTool.saveFile(file,uid)
      localStorage.setItem('filelist',JSON.stringify(filelist.value))
      return;
    }
    let start = i * chunkSize;
    let end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
    let chunkFile = file.slice(start, end);
    // console.log(file)
    // 上传文件
    let uploadResult = await proxy.Request({
      url: api.upload,
      showLoading: false,
      dataType: "file",
      params: {
        file: chunkFile,
        fileName: file.name,
        fileMd5: currentFile.md5,
        chunkIndex: i,
        chunks: chunks,
        fileId: currentFile.fileId,
        filePid: currentFile.filePid,
      },
      showError: false,
      errorCallback: (errorMsg) => {
        // console.log("上传文件请求异常回调", errorMsg);
        currentFile.status = STATUS.fail.value;
        currentFile.errorMsg = errorMsg;
      },
      // 更新进度条
      onUploadProgressCallback: (event) => {
        let loaded = event.loaded;
        if (loaded > fileSize) {
          loaded = fileSize;
        }
        currentFile.uploadSize = i * chunkSize + loaded;
        currentFile.uploadProgress = Math.floor(
          (currentFile.uploadSize / fileSize) * 100
        );
      },
    });
    if (uploadResult == null) break;
    currentFile.fileId = uploadResult.fileId;
    currentFile.status = STATUS[uploadResult.status].value;
    currentFile.chunkIndex = i;
    if (
      uploadResult.status == STATUS.upload_seconds.value ||
      uploadResult.status == STATUS.upload_finish.value
    ) {
      // 上传成功，删除idb中的File
      proxy.IdbFileTool.delFile(uid)
      currentFile.uploadProgress = 100;
      emit("uploadCallback");
      break;
    }
  }
  localStorage.setItem("filelist",JSON.stringify(filelist.value))
};
</script>

<style lan="scss" scoped>
.uploader-panel {
  .uploader-title {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;
    .tips {
      font-size: 13px;
      color: rgb(169, 169, 169);
      margin-right: 55%;
    }
    
  }
  .file-list {
    overflow: auto;
    padding: 10px 0px;
    min-height: calc(100vh / 2);
    max-height: calc(100vh - 120px);
    .file-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 10px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
      border-radius: 5px #ddd;
    }
    .file-item:nth-child(even) {
      background-color: #fcf8f4;
    }
    .upload-panel {
      flex: 1;
      .file-name {
        color: rgb(64, 62, 62);
      }
      .upload-status {
        display: flex;
        align-items: center;
        margin-top: 5px;
        .iconfont {
          margin-right: 3px;
        }
        .status {
          color: red;
          font-size: 13px;
        }
        .upload-info {
          margin-left: 5px;
          font-size: 12px;
          color: rgb(112, 111, 111);
        }
      }
      .progress {
        height: 10px;
      }
    }
    .op {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .op-btn {
        .btn-item {
          cursor: pointer;
        }
        .del,
        .clean {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
