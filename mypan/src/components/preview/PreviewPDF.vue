<template>
  <div class="pdf">
    <vue-pdf-embed
      ref="pdfRef"
      :source="state.url"
      class="vue-pdf-embed"
      width="850"
      :page="state.pageNum"
    ></vue-pdf-embed>
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
} from "vue";
import { useRouter, useRoute } from "vue-router";
import VuePdfEmbed from "vue-pdf-embed";
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
const state = ref({
  source: null,
  pageNum: 0,
  numPages: 0,
});
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  initPdf();
});
//================================================================emits

//================================================================expose

//================================================================request
const initPdf = async () => {
  console.log("初始化Pdf");
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  if (!result) return;
  // 
  let imgUrl =  URL.createObjectURL(result)
  state.value.url = imgUrl
  
};
</script>

<style lang="scss" scoped>
.pdf {
  width: 100%;
}
</style>
