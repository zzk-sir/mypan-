<template>
  <div class="image-rieww"></div>
  <el-image-viewer
    :initial-index="previewImgIndex"
    :url-list="imageList"
    @close="closeImgViewer"
    v-if="previewImgIndex != null"
  ></el-image-viewer>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
//----------------------------------common
const { proxy } = getCurrentInstance();
//----------------------------------declare
//================================================================api

//================================================================props
const props = defineProps({
  imageList: {
    type: Array,
  },
});
//================================================================var
//----------------------------------common
const previewImgIndex = ref(null);

//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const show = (index)=>{
    // stopScroll()
    previewImgIndex.value = index
}
const closeImgViewer = ()=>{
    // startScroll()
    previewImgIndex.value = null;
}
// 这里可以不用因为打开图片，滚动条在里面，不会影响
// 隐藏滚动条
// const stopScroll = ()=>{
//     document.body.style.overflow = "hidden";
// }
// // 显示滚动条
// const startScroll = ()=>{
//     document.body.style.overflow = "auto";
// }
//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose
defineExpose({show})

//================================================================request
</script>

<style lang="scss" scoped>
.image-viewer {
  .el-image-viewer__mask {
    opacity: 0.7;
  }
}
</style>
