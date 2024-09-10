<template>
  <div class="share">
    <div class="header">
      <div class="header-content">
        <div class="logo" @click="jump">
          <span class="iconfont icon-pan"></span>
          <span class="name">My Pan</span>
        </div>
      </div>
    </div>
  </div>
  <div class="share-body">
    <template v-if="Object.keys(shareInfo).length == 0">
      <div class="loading" v-loading="Object.keys(shareInfo).length == 0"></div>
    </template>
    <template v-else>
      <div class="share-panel">
        <div class="share-user-info">
          <div class="avatar">
            <Avatar :userId="shareInfo.userId" :avatar="null" :width="50">
            </Avatar>
          </div>
          <div class="share-info">
            <div class="user-info">
              <span class="nick-name">
                {{ shareInfo.nickName }}
              </span>
              <span class="share-time"> 分享于: {{ shareInfo.shareTime }} </span>
            </div>
            <div class="file-name">分享文件: {{ shareInfo.fileName }}</div>
          </div>
        </div>
        <div class="share-op-btn">
          <el-button
            type="primary"
            @click="save2MyPan"
            :disabled="selectFileIdList.length == 0"
          >
            <span class="iconfont icon-import"></span>
            保存到我的网盘</el-button
          >
        </div>
      </div>
      <Navigation ref="navigationRef" @navChange="navChange" :shareId="shareId">
      </Navigation>
      <div class="file-list">
        <Table
          ref="dataTabelRef"
          :columns="columns"
          :dataSource="tableData"
          :fetch="loadDataList"
          :initFetch="false"
          :options="tableOptions"
          @rowSelected="rowSelected"
        >
          <template #fileName="{ index, row }">
            <div
              class="file-item"
              @mouseenter="showOp(row)"
              @mouseleave="cancelShowOp(row)"
            >
              <!-- 文件图标 -->
              <!-- 文件类型为视频或图片，并且是转码成功的 使用后端的封面 -->
              <template v-if="row.fileType == 3 || row.fileType == 1">
                <Icon :cover="row.fileCover" :width="32" @click="preview(row)"> </Icon>
              </template>
              <template v-else>
                <!-- 文件为文件 -->
                <Icon
                  v-if="row.folderType == 0"
                  :fileType="row.fileType"
                  @click="preview(row)"
                >
                </Icon>
                <!-- 文件为目录 -->
                <Icon v-if="row.folderType == 1" :fileType="0" @click="preview(row)">
                </Icon>
              </template>
              <!-- 文件名 -->
              &nbsp;&nbsp;
              <template v-if="!row.fileId||row.folderType != 0">
                <span class="file-name-hover" @click="preview(row)">{{ row.fileName }}</span>
              </template>
              <span class="file-name" :title="row.fileName" v-if="!row.showEdit">
                <!-- 文件操作 -->
                <template v-if="row.fileId&&row.folderType == 0">
                  <el-popover placement="left" :width="20" trigger="hover">
                    <div class="opt">
                      <el-button
                        class="iconfont icon-download"
                        v-if="row.folderType == 0"
                        @click="download(row)"
                      >
                        下载
                      </el-button>
                    </div>
                    <template #reference>
                      <span @click="preview(row)">{{ row.fileName }}</span>
                    </template>
                  </el-popover>
                </template>
              </span>
            </div>
          </template>
          <template #fileSize="{ index, row }">
            <span v-if="row.fileSize">
              {{ proxy.Utils.size2Str(row.fileSize) }}
            </span>
          </template>
        </Table>
      </div>
    </template>
    <!--   目录 选择 -->
    <FolderSelect ref="folderSelectRef" @folderSelect="save2MyPanDone"></FolderSelect>
    <Preview ref="previewRef"></Preview>
  </div>
</template>
<script setup>
import FolderSelect from "@/components/FolderSelect.vue";
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
//----------------------------------common
const {proxy} = getCurrentInstance();
const route = useRoute();
const router = useRouter();
//----------------------------------declare
//================================================================api
const api = {
  getShareLoginInfo: "/showShare/getShareLoginInfo",
  loadFileList: "/showShare/loadFileList",
  createDownloadUrl: "/showShare/createDownloadUrl",
  download: "/api/showShare/download",
  saveShare: "/showShare/saveShare",
};
//================================================================props

//================================================================var
//----------------------------------common

const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
];
const tableData = ref({});
const tableOptions = ref({
  extHeight: 80,
  selectType: "checkBox",
});
const selectFileIdList = ref([]);
// 当前目录
const currentFolder = ref({
  fileId: "0",
});
const navigationRef = ref();
const previewRef = ref();

const shareId = route.params.shareId.split(' ')[0]
const shareInfo = ref({});

const folderSelectRef = ref()
const save2MyPanFileIdArray = ref([])

//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
// 多选
const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId);
  });
  console.log(selectFileIdList.value,rows)
};
// 显示操作按钮
const showOp = (row) => {
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  row.showOp = true;
};
// 取消显示操作按钮
const cancelShowOp = (row) => {
  row.showOp = false;
};
// 切换目录
const navChange  = (data)=>{
    const {curFolder} = data;
    currentFolder.value = curFolder;
    resetPage()
    loadDataList()
}

// 预览 
 const preview = (data)=>{
    if(data.folderType==1){
        navigationRef.value.openFolder(data)
        return
    }
    data.shareId = shareId
    previewRef.value.showPreview(data,2)
 }

 //  保存到我的网盘
const save2MyPan = ()=>{
    if(selectFileIdList.value.length==0){
        return;
    }
    if(!sessionStorage.getItem('authorization')){
        proxy.Message.success('请先登录')
        router.replace(`/login?redirectUrl=${route.path}`)
        return;
    }
    save2MyPanFileIdArray.value = selectFileIdList.value;
    console.log(save2MyPanFileIdArray.value,selectFileIdList.value)
    folderSelectRef.value.showFolderDialog()
}
const save2MyPanSingle = ()=>{
    if(!sessionStorage.getItem('authorization')){
        proxy.Message.success('请先登录')
        router.replace(`/login?redirectUrl=${route.path}`)
        return;
    }
    save2MyPanFileIdArray.value = [row.fileId]
    folderSelectRef.value.showFolderDialog()
}

const jump = ()=>{
    router.push("/")
}

// 重置pageNo
const  resetPage = ()=>{
  tableData.value.pageNo = null
}
//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose

//================================================================request

const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareLoginInfo,
    params: {
      shareId,
    },
  });
  if (!result) {
    // 返回分享页面
    router.push(`/shareCheck/${shareId}`);
    return;
  }
  shareInfo.value = result;
};
getShareInfo();
// 加载文件数据
const loadDataList = async () => {
  console.log("加载文件数据");
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 15,
    shareId:shareId,
    filePid:currentFolder.value.fileId
  };
  let result = await proxy.Request({
    url: api.loadFileList,
    params: params,
  });
  if (!result) return;
  tableData.value = result;
};



// 下载
const download = async(row)=>{
    let result = await proxy.Request({
        url:api.createDownloadUrl+"/"+shareId+"/"+row.fileId,
    })
    if(!result){
        retrun
    }
    window.location.href=api.download+"/"+result
}

//  保存到我的网盘
const save2MyPanDone = async(folderId)=>{
    let result = await proxy.Request({
        url:api.saveShare,
        params:{
            shareId:shareId,
            shareFileIds:save2MyPanFileIdArray.value.join(','),
            myFolderId:folderId
        }
    })
    if(!result){
        return;
    }
    loadDataList();
    proxy.Message.success("保存成功")
    folderSelectRef.value.close()
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.header {
  width: 100%;
  position: fixed;
  background: #0c95f7;
  height: 50px;
  .header-content {
    width: 70%;
    margin: 0px auto;
    color: #fff;
    line-height: 50px;
    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      .icon-pan {
        font-size: 40px;
      }
      .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 25px;
      }
    }
  }
}
.share-body {
  width: 70%;
  margin: 0px auto;
  padding-top: 50px;
  .loading {
    height: calc(100vh / 2);
    width: 100%;
  }
  .share-panel {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }
  .share-user-info {
    flex: 1;
    display: flex;
    align-items: center;
    .avatar {
      margin-right: 5px;
    }
    .share-info {
      .user-info {
        display: flex;
        align-items: center;
        .nick-name {
          font-size: 15px;
        }
        .share-time {
          margin-left: 20px;
          font-size: 12px;
        }
      }
    }
  }
}
.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 170px;
    }
  }
}
.file-name-hover:hover{
  color:rgb(86, 210, 210);
}
.opt {
  .iconfont {
    margin: 2px auto 2px 12px;
  }
}
</style>
