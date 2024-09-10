<template>
  <div class="top-navigation">
    <template v-if="folderList.length > 0">
      <span class="back link" @click="backParent">返回上一级</span>
      <el-divider direction="vertical"></el-divider>
    </template>
    <span v-if="folderList.length == 0" class="all-file">主目录</span>
    <span v-if="folderList.length > 0" class="link" @click="setCurrentFolder(-1)">
      主目录
    </span>
    <template v-for="(item, index) in folderList">
      <span class="iconfont icon-right"></span>
      <span
        class="link"
        v-if="index < folderList.length - 1"
        @click="setCurrentFolder(index)"
        >{{ item.fileName }}</span
      >
      <span v-if="index == folderList.length - 1" class="text">{{ item.fileName }}</span>
    </template>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
//================================================================api
const api = {
  getFolderInfo: "/file/getFolderInfo", // 获取文件夹列表
  getFolderInfo4Share: "/showShare/getFolderInfo", // 分享获取目录信息
  getFolderInfo4Admin: "/admin/getFolderInfo", // 管理员获取目录信息
};
//================================================================props
const props = defineProps({
  watchPath: {
    // 是否监听路由
    type: Boolean,
    default: true,
  },
  shareId: {
    // 分享的ID
    type: String,
  },
  adminShow: {
    // 管理员
    type: Boolean,
    default: false,
  },
});
//================================================================var
const category = ref(); // 分类
const folderList = ref([]); // 目录的集合
const currentFolder = ref({ fileId: "0" }); // 当前目录
//================================================================emits
const emit = defineEmits(["navChange"]);

//================================================================request
const getNavigationFolder = async () => {
  // 获取当前路径的目录
  let url = api.getFolderInfo;
  if (props.shareId) {
    url = api.getFolderInfo4Share;
  }
  if (props.adminShow) {
    url = api.getFolderInfo4Admin;
  }

  let result = await proxy.Request({
    url: url,
    showLoading: false,
    params: {
      path: route.query.path,
      shareId: props.shareId,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result;
};
//================================================================methods
//----------------------------------common
const setPath = () => {
  //设置路径
  if (!props.watchPath) {
    doCallback();
    return;
  }
  let pathArray = [];
  folderList.value.forEach((item) => {
    pathArray.push(item.fileId);
  });
  router.push({
    path: route.path,
    query: pathArray.length == 0 ? "" : { path: pathArray.join("/") },
  });
};
const doCallback = () => {
  emit("navChange", {
    categoryId: category.value,
    curFolder: currentFolder.value,
  });
};
const init = () => {
  folderList.value = [];
  currentFolder.value = { fileId: "0" };
  doCallback();
};
// 点击导航设置当前目录
const setCurrentFolder = (index) => {
  if (index == -1) {
    // 返回全部
    currentFolder.value = { fileId: "0" };
    folderList.value = [];
  } else {
    currentFolder.value = folderList.value[index];
    folderList.value.splice(index + 1, folderList.value.length);
  }
  setPath();
};
// 返回上一级
const backParent = () => {
  let currentIndex = 0;
  for (let i = 0; i < folderList.value.length; i++) {
    if (folderList.value[i].fileId == currentFolder.value.fileId) {
      currentIndex = i;
      break;
    }
  }
  // // console.log("当前索引", currentIndex, folderList.value, currentFolder.value.fileId);
  setCurrentFolder(currentIndex - 1);
};
//----------------------------------watch
watch(
  () => route,
  (n, o) => {
    if (!props.watchPath) {
      return;
    }
    if (n.path.indexOf("/main") === -1&&
    n.path.indexOf("/settings/fileList")===-1&&
    n.path.indexOf("/share")===-1) {
      return;
    }
    const path = n.query.path;
    const categoryId = n.params.category;
    category.value = categoryId;
    if (path == undefined) {
      // 初始化
      init();
    } else {
      getNavigationFolder();
      let pathArray = path.split("/");
      currentFolder.value = {
        fileId: pathArray[pathArray.length - 1],
      };
      doCallback();
    }
  },
  { immediate: true, deep: true }
);

//================================================================expose

const openFolder = (data) => {
  // 打开某个文件夹
  const { fileId, fileName } = data;
  const folder = {
    fileName: fileName,
    fileId: fileId,
  };
  folderList.value.push(folder);
  currentFolder.value = folder;
  setPath();
};

defineExpose({ openFolder });
</script>

<style lan="scss" scoped>
.top-navigation {
  font-size: 13px;
  display: flex;
  align-items: center;
  line-height: 40px;
  .all-file {
    font-weight: bold;
  }
  .link {
    color: #06a7ff;
  }
  .icon-right {
    color: #06a7ff;
    padding: 0px 5px;
    font-size: 13px;
  }
}
</style>
