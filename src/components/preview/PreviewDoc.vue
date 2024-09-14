<template>
  <div class="doc-content" ref="docRef"></div>
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
} from "vue";
import { useRouter, useRoute } from "vue-router";
import * as docx from "docx-preview";
//================================================================globolVar
//----------------------------------common
const { proxy } = getCurrentInstance();
//----------------------------------declare
//================================================================api

//================================================================props
const props = defineProps({
  url: {
    type: String,
  },
});
//================================================================var
//----------------------------------common
const docRef = ref();

//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  initDoc();
});
//================================================================emits

//================================================================expose

//================================================================request
const initDoc = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  if (!result) return;
  console.log(result)
  docx.renderAsync(result, docRef.value).catch(error=>{
    proxy.Message.error('目前只支持docx类型的文档，其他类型请下载后查看')
  })
};
</script>

<style lang="scss" scoped>
.doc-content {
  margin: 0px auto;
  :deep(.docx-wrapper) {
    background: #fff;
    padding: 10px 0px;
  }
  :deep(.docx-wrapper > section.docx) {
    margin-bottom: 0px;
  }
}
</style>
