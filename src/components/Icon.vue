<template>
  <span :style="{ width: width + 'px', height: width + 'px' }" class="icon">
    <img :src="getImage()" :style="{ 'object-fit': fit }" />
  </span>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";

//================================================================globolVar
const { proxy } = getCurrentInstance();

//================================================================api

//================================================================props
const props = defineProps({
  fileType: {
    type: Number,
  },
  iconName: {
    type: String,
  },
  cover: {
    type: String,
  },
  width: {
    type: Number,
    default: 32,
  },
  fit: {
    type: String,
    default: "cover",
  },
});
//================================================================var
//----------------------------------common
const fileTypeMap = {
  0: { desc: "目录", icon: "folder" },
  1: { desc: "视频", icon: "video" },
  2: { desc: "音频", icon: "music" },
  3: { desc: "图片", icon: "image" },
  4: { desc: "pdf", icon: "pdf" },
  5: { desc: "doc", icon: "word" },
  6: { desc: "excel", icon: "excel" },
  7: { desc: "纯文本", icon: "txt" },
  8: { desc: "代码", icon: "code" }, // 代码
  9: { desc: "压缩包", icon: "zip" }, // 压缩包
  10: {desc: "其他文件", icon: "others"}, // 其他
};
//----------------------------------rules

//================================================================methods
//----------------------------------common

//----------------------------------watch

//================================================================emits

//================================================================expose

//================================================================request
const getImage = () => {
 // // console.log("getImage cover iconName fileType",props.cover,props.iconName,props.fileType);
  // 有封面
  if (proxy.cover) {
    return proxy.globalInfo.imageUrl + proxy.cover;
  }
  let icon = "unknow_icon";
  if (props.iconName) {
    icon = props.iconName;
  } else {
    // if(props.fileType==8) {
    //   // 代码
    // }else if(props.fileType==10){
    //   //其他
    // }
    const iconMap = fileTypeMap[props.fileType];
    if (iconMap != undefined) {
      icon = iconMap["icon"];
    }
  }
  // // console.log("icon",icon);
  return new URL(`/src/assets/icon-image/${icon}.png`, import.meta.url).href;
};
</script>

<style lan="scss" scoped>
.icon {
  text-align: center;
  display: inline-block;
  border-radius: 3px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
