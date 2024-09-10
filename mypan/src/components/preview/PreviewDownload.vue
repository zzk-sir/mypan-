<template>
  <div class="others">
    <div class="body-content">
      <div>
        <Icon :iconName="fileInfo.fileType == 9 ? 'zip' : 'others'" :width="80"></Icon>
      </div>
      <div class="file-name">{{fileInfo.fileName}}</div>
      <div class="tips">该类型的文件暂不支持查看，请下载后查看</div>
      <div class="download-btn">
        <el-button type="primary" @click="download">点击下载{{proxy.Utils.size2Str(fileInfo.fileSize)}}</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  watch,
  computed,
  onMounted,
  onUnmounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
//----------------------------------common
const { proxy } = getCurrentInstance();

//----------------------------------declare
//================================================================api

//================================================================props
const props = defineProps({
  createDownloadUrl: {
    type: String,
  },
  downloadUrl: {
    type: String,
  },
  fileInfo: {
    type: Object,
  },
});
//================================================================var
//----------------------------------common

//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const download = async ()=>{
    let result = await proxy.Request({
        url:props.createDownloadUrl,
    })
    if(!result) return
    else{
      window.location.href = props.downloadUrl + "/" + result
    }
}
//----------------------------------watch

//----------------------------------onMounted

//----------------------------------onUnmounted

//================================================================emits

//================================================================expose

//================================================================request
</script>

<style lang="scss" scoped>
.others {
  background-color:rgb(215, 244, 244);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  .body-content {
    text-align: center;
    .file-name {
      font-weight: bold;
    }
    .tips {
      color: #999898;
      margin-top: 5px;
      font-size: 13px;
    }
    .download-btn {
      margin-top: 20px;
    }
  }
}
</style>
