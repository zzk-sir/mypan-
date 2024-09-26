<template>
  <div class="framework" @drop="dropFile($event)" @dragover="dragover($event)">
    <!-- 蒙版容器 -->
    <div id="mask" :class="['mask',showMask?'show':'']"></div>
    <!-- 蒙版下的内容，比如一个模态窗口 -->
    <div id="modal" :class="['modal',showMask?'show':'']">
      <h2>放入当前文件夹</h2>
    </div>
    <div class="header">
      <div class="logo" @click="goHome">
        <span class="iconfont icon-pan"></span>
        <div class="name">My Pan</div>
      </div>
      <div class="right-panel">
        <el-popover
          :width="800"
          trigger="click"
          v-model:visible="showUploader"
          :offset="20"
          transition="none"
          :hide-after="0"
          :popper-style="{ padding: '0px' }"
        >
          <template #reference>
            <span class="iconfont icon-transfer"></span>
          </template>
          <template #default>
            <Uploader ref="uploaderRef" @uploadCallback="uploadCallbackHandler">
            </Uploader>
          </template>
        </el-popover>

        <el-dropdown>
          <div class="user-info">
            <div class="avatar">
              <Avatar
                :userId="userInfo.id"
                :avatar="userInfo.avatar"
                :timestamp="timestamp"
                :width="46"
              ></Avatar>
            </div>
            <span class="nickname">{{ userInfo.nickName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="updateAvatar">修改头像</el-dropdown-item>
              <el-dropdown-item @click="updatePassword">修改密码</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="body">
      <div class="left-sider">
        <div class="menu-list">
          <div
            @click="jump(item)"
            :class="['menu-item', item.menuCode == currentMenu.menuCode ? 'active' : '']"
            v-for="(item, index) in menus"
            :key="index"
          >
            <div :class="['iconfont', 'icon-' + item.icon]"></div>
            <div class="text">{{ item.name }}</div>
          </div>
        </div>
        <div class="menu-sub-list">
          <div
            @click="jump(sub)"
            :class="['menu-item-sub', currentPath == sub.path ? 'active' : '']"
            v-for="(sub, index) in currentMenu.children"
            :key="index"
          >
            <span :class="['iconfont', 'icon-' + sub.icon]" v-show="sub.icon"> </span>
            <span class="text">{{ sub.name }}</span>
          </div>
          <div class="tips" v-show="currentMenu && currentMenu.tips">
            {{ currentMenu.tips }}
          </div>
          <div class="space-info">
            <div>空间使用</div>
            <div class="percent">
              <el-progress
                :percentage="
                  Math.floor((useSpaceInfo.useSpace / useSpaceInfo.totalSpace) * 10000) /
                  100
                "
                color="#409eff"
              >
              </el-progress>
              <div class="space-use">
                <div class="use">
                  {{ proxy.Utils.size2Str(useSpaceInfo.useSpace) }} /
                  {{ proxy.Utils.size2Str(useSpaceInfo.totalSpace) }}
                </div>
                <div class="iconfont icon-refresh" @click="getUseSpace"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="body-content">
        <router-view v-slot="{ Component }">
          <component
            ref="routerViewRef"
            :is="Component"
            @addFile="addFile"
            @reload="getUseSpace"
          >
          </component>
        </router-view>
      </div>
    </div>
    <UpdateAvatar ref="updateAvatarRef" @updateAvatar="reloadAvatar"></UpdateAvatar>
    <UpdatePassword ref="updatePasswordRef"></UpdatePassword>
    
  </div>
</template>
<script setup>
import UpdateAvatar from "./UpdateAvatar.vue";
import UpdatePassword from "./UpdatePassword.vue";
import Uploader from "@/views/main/Uploader.vue";

import {
  ref,
  reactive,
  getCurrentInstance,
  watch,
  onMounted,
  nextTick,
  computed,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import md5 from "js-md5";
import axios from "axios";
//================================================================globolVar
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
//================================================================api
const api = {
  getUserInfo: "/getUserInfo",
  logout: "/logout",
  getUseSpace: "/getUseSpace",
};
//================================================================props

//================================================================var
//----------------------------------common
const timestamp = ref(0);
const userInfo = ref({});
const showMask = ref(false);
const menus = ref([
  {
    icon: "cloude",
    name: "首页",
    menuCode: "main",
    path: "/main/all",
    allShow: true,
    children: [
      {
        icon: "all",
        name: "全部",
        category: "all",
        path: "/main/all",
      },
      {
        icon: "video",
        name: "视频",
        category: "video",
        path: "/main/video",
      },
      {
        icon: "music",
        name: "音频",
        category: "music",
        path: "/main/music",
      },
      {
        icon: "image",
        name: "图片",
        category: "image",
        path: "/main/image",
      },
      {
        icon: "doc",
        name: "文档",
        category: "doc",
        path: "/main/doc",
      },
      {
        icon: "more",
        name: "其他",
        category: "other",
        path: "/main/others",
      },
    ],
  },
  {
    path: "/myshare",
    icon: "share",
    name: "分享",
    menuCode: "share",
    allShow: true,
    children: [
      {
        name: "分享记录",
        path: "/myshare",
      },
    ],
  },
  {
    path: "/recycle",
    icon: "del",
    name: "回收站",
    menuCode: "recycle",
    tips: "回收站为您保存10天内删除的文件",
    allShow: true,
    children: [
      {
        name: "回收站",
        path: "/recycle",
      },
    ],
  },
]);

const currentMenu = ref({});
const currentPath = ref();
// 显示上传文件状态
const showUploader = ref(false);
const uploaderRef = ref();
const updateAvatarRef = ref();

const updatePasswordRef = ref();

const updateDataList = ref(null);

const routerViewRef = ref();
// 使用空间
const useSpaceInfo = ref({ useSpace: 0, totalSpace: 1 });
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const jump = (data) => {
  if (!data.path || data.menuCode == currentMenu.value.menuCode) {
    return;
  }
  router.push(data.path);
};
const goHome = ()=>{
  console.log("goHome")
  router.push("/")
}
const setMenu = (menuCode, path) => {
  const menu = menus.value.find((item) => {
    return item.menuCode == menuCode;
  });
  currentMenu.value = menu;
  currentPath.value = path;
};
const reloadAvatar = () => {
  let user = JSON.parse(sessionStorage.getItem("user"));
  user.avatar = null;
  userInfo.value = user;
  timestamp.value = new Date().getTime();
};
// 修改头像
const updateAvatar = () => {
  updateAvatarRef.value.show(userInfo.value);
};
// 修改密码
const updatePassword = () => {
  updatePasswordRef.value.show();
};
// 上传文件
const addFile = (data) => {
  const { file, filePid, addFileCallback } = data;
  showUploader.value = true;
  uploaderRef.value.addFile(file, filePid);
  // 更新数据
  updateDataList.value = addFileCallback;
};
// 上传文件回调
const uploadCallbackHandler = () => {
  nextTick(() => {
    // 刷新数据
    routerViewRef.value.reload();
    getUseSpace();
    // 更新用户空间
    // updateDataList.value();
  });
};
const checkAdmin = () => {
  let user = JSON.parse(sessionStorage.getItem("user"));
  if (user && user.isAdmin && menus.value.length == 3) {
    menus.value.push({
      path: "/settings/fileList",
      icon: "settings",
      name: "设置",
      menuCode: "settings",
      allShow: true,
      children: [
        {
          name: "用户文件",
          path: "/settings/fileList",
        },
        {
          name: "用户管理",
          path: "/settings/userList",
        },
        {
          name: "系统管理",
          path: "/settings/sysSetting",
        },
      ],
    });
  }
};

// 拖动文件上传
const dropFile = (event) => {
  event.preventDefault(); //阻止浏览器默认行为，不会自动打开文件管理页面
  const DataTransferItemList = event.dataTransfer.items; // 获取文件的数据
  for (const dataTransferItem of DataTransferItemList) {
    const file = dataTransferItem.getAsFile();
    const uid = proxy.Utils.fileUid()
    file.uid = uid;
    let entry = dataTransferItem.webkitGetAsEntry()
    if(routerViewRef.value.dropFile){
      if(entry.isFile){
        routerViewRef.value.dropFile(file)
      }else{
        proxy.Confirm(`你确定要上传文件夹以及其中所有的文件到当前目录吗？`,()=>{
          // 遍历文件夹
          routerViewRef.value.dropFolder(entry)
        })
      }
    }
  }
  showMask.value = false
};




let timer = null;
const dragover = (event)=>{
if(routerViewRef.value.dropFile){
  event.preventDefault();
  if(timer) clearTimeout(timer)
  timer = setTimeout(()=>{
      showMask.value = false
  },1000)
    showMask.value = true
  }
}

// 防抖函数
const debounce = (fn, wait)=>{
  let timeout = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}

//----------------------------------onMounted
onMounted(async () => {
  await getUserInfo();
  let user = JSON.parse(sessionStorage.getItem("user"));
  user.avatar = null;
  userInfo.value = user;
  checkAdmin();
  getUseSpace();
});

//================================================================emits

//================================================================expose

//================================================================request
// 获取用户信息
const getUserInfo = async () => {
  const user = sessionStorage.getItem("user");
  const res = await proxy.Request({
    url: api.getUserInfo,
    params: {},
  });
  if (!res) {
    return;
  }
  sessionStorage.setItem("user", JSON.stringify(res));
  
};
// 退出
const logout = () => {
  proxy.Confirm("您确定要退出吗？", async () => {
    let res = await proxy.Request({
      url: api.logout,
    });
    if (!res) return;
    // 清空sessionStorage user和token
    sessionStorage.clear();
    proxy.LocalStorage.remove("loginInfo");
    router.push("/login");
  });
};
// 获取用户空间
const getUseSpace = async () => {
  let result = await proxy.Request({
    url: api.getUseSpace,
    showLoading: false,
  });
  if (!result) return;
  useSpaceInfo.value = result;
};
//----------------------------------watch
watch(
  () => route,
  async (newVal, oldVal) => {
    await getUseSpace();
    await getUserInfo();
    let user = sessionStorage.getItem("user");
    if (user != null && user) checkAdmin();
    if (newVal.meta.menuCode) {
      setMenu(newVal.meta.menuCode, newVal.path);
    }
  },
  { immediate: true, deep: true }
);
</script>
<style lang="scss" scoped>
.header {
  box-shadow: 0 3px 10px 0 rgb(0, 0, 0, 6%);
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .logo {
    display: flex;
    align-items: center;
    .icon-pan {
      font-size: 40px;
      color: #1296db;
    }
    .name {
      font-weight: bold;
      margin-left: 5px;
      font-size: 25px;
      color: #05a1f5;
    }
  }
  .right-panel {
    display: flex;
    align-items: center;
    .icon-transfer {
      cursor: pointer;
    }
    .user-info {
      margin-right: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .avatar {
        margin: 0px 5px 0px 15px;
      }
    }
    .nick-name {
      color: #05a1f5;
    }
  }
}
.body {
  display: flex;
  .left-sider {
    border-right: 1px solid #f1f2f4;
    display: flex;
    .menu-list {
      height: calc(100vh - 56px);
      width: 80px;
      box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
      border-right: 1px solid #f1f2f4;
      .menu-item {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        padding: 20px 0px;
        cursor: pointer;
        &:hover {
          background: #f3f3f3;
        }
        .iconfont {
          font-weight: normal;
          font-size: 20px;
        }
      }
      .active {
        .iconfont {
          color: #06a7ff;
        }
        .text {
          color: #06a7ff;
        }
      }
    }

    .menu-sub-list {
      min-width: 200px;
      padding: 20px 10px 0px;
      position: relative;

      .menu-item-sub {
        text-align: center;
        line-height: 40px;
        border-radius: 5px;
        cursor: pointer;
        &:hover {
          background: #f3f3f3;
        }
        .iconfont {
          font-size: 14px;
          margin-right: 20px;
        }
        .text {
          font-size: 13px;
        }
      }
      .active {
        background: #eef9fe;
        .iconfont {
          color: #05a1f5;
        }
        .text {
          color: #05a1f5;
        }
      }

      .tips {
        margin-top: 10px;
        color: #888888;
        font-size: 13px;
      }
      .space-info {
        position: absolute;
        bottom: 10px;
        width: 100%;
        .percent {
          padding-left: 10px;
        }
        .space-use {
          margin-top: 5px;
          color: #7e7e7e;
          display: flex;
          justify-content: space-around;
          .use {
            flex: 1;
          }
          .iconfont {
            cursor: pointer;
            margin-right: 20px;
            color: #05a1f5;
          }
        }
      }
    }
  }
  .body-content {
    flex: 1;
    width: 0;
    padding-left: 20px;
  }
}
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: contrast(10);
  background-color: rgba(0, 0, 0, 0.5); /* 黑色背景，50%透明度 */
  display: none; /* 默认不显示蒙版 */
  z-index: 1000; /* 确保蒙版在其他元素之上 */
}
.mask.show{
  display: block;
}
.modal.show{
  display: block;
}
.modal {
  display: none;
  position: fixed;
  color:#aaa;
  font-size: 25px;
  top: 50%;
  filter: blur(1px);
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border-radius: 5px;
  z-index: 1001; /* 确保模态窗口在蒙版之上 */
  width: max-content; /* 模态窗口的宽度 */
}

@media screen and (max-width: 800px) {
  .menu-sub-list {
    display: none;
  }
}
</style>
