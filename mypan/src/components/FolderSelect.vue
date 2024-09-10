<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :isShowCancel="false"
      @close="close"
    >
      <!-- 文件路径导航 -->
      <div class="navigation-panel">
        <Navigation
          ref="navigationRef"
          @navChange="navChange"
          :watchPath="false"
        ></Navigation>
      </div>
      <!-- 文件列表 -->
      <div class="folder-list" v-if="folderList.length > 0">
        <div
          class="folder-item"
          v-for="(item, index) in folderList"
          @click="selectFolder(item)"
          :key="index"
        >
          <Icon :fileType="0"></Icon>
          <span class="file-name">{{ item.fileName }}</span>
        </div>
      </div>
      <div v-else class="tips">
        移动<span>{{ currentFolder.fileName }}</span>
      </div>
    </Dialog>
  </div>
</template>
<script setup lan="js">
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
//================================================================globolVar
const { proxy } = getCurrentInstance();

//================================================================api
const api = {
  loadAllFolder: "/file/loadAllFolder",
};
//================================================================props

//================================================================var
//----------------------------------common
// 弹窗配置
const dialogConfig = ref({
  show: false,
  title: "移动到",
  buttons: [
    {
      type: "primary",
      text: "移动到此处",
      click: (e) => {
        folderSelect();
      },
    },
  ],
});

const filePid = ref("0"); // 父级Id

const folderList = ref([]); // 文件夹列表

const currentFileIds = ref([]); //  当前文件夹Id 
const excludeSelectFolderIds = ref([]) // 要排除选中的文件夹ID
const currentFolder = ref({});
const navigationRef = ref();
//----------------------------------rules

//================================================================methods
//----------------------------------common
// 选择目录
const selectFolder = (data) => {
  // console.log("TODO 选择目录=====");
  navigationRef.value.openFolder(data)

};

// 确定选则目录,传递给父组件
const folderSelect = () => {
  emit("folderSelect", filePid.value);
};
//----------------------------------watch

//================================================================emits
const emit = defineEmits(["folderSelect"]);

//================================================================expose
// 暴露显示方法给父类
const showFolderDialog = (currentFolder) => {
  dialogConfig.value.show = true;
  if(currentFileIds.value.includes(currentFolder)) currentFileIds.value.push(currentFolder);
  loadAllFolder();
};
// 排除选中的文件夹ID
const excludeSelectFolder = (execludeIds)=>{
  currentFileIds.value.push(...execludeIds)
  currentFileIds.value = [...new Set(currentFileIds.value)]
}
// 关闭显示
const close = () => {
  dialogConfig.value.show = false;
};
defineExpose({
  showFolderDialog,
  close,
  excludeSelectFolder
});
// 导航改变回调
const navChange = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  filePid.value = curFolder.fileId;
  loadAllFolder();
};
//================================================================request
// 获取所有的目录
const loadAllFolder = async () => {
  let result = await proxy.Request({
    url: api.loadAllFolder,
    params: {
      filePid: filePid.value,
      currentFileIds: currentFileIds.value,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result;
};
</script>

<style lang="scss" scoped>
.navgation-panel {
  padding-left: 10px;
  background: #f1f1f1;
}
.folder-list {
  .folder-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 10px;
    .file-name {
      display: inline-block;
      margin-left: 10px;
    }
    &:hover {
      background: #f8f8f8;
    }
  }
  max-height: calc(100vh - 200px);
  min-height: 200px;
}
.tips {
  text-align: center;
  line-height: 200px;
  span {
    color: #06a7ff;
  }
}
</style>
