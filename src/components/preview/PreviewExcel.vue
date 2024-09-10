<template>
  <div v-html="excelContent" class="table-info"></div>
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
import * as XLSX from "xlsx";
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
const excelContent = ref();
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  initExcel();
});
//================================================================emits

//================================================================expose

//================================================================request
const initExcel = async () => {
  console.log("初始化Excel");
  let result = await proxy.Request({
    url: props.url,
    responseType: "arraybuffer",
  });
  if (!result) return;
  let workbook = XLSX.read(new Uint8Array(result), { type: "array" });
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  excelContent.value = XLSX.utils.sheet_to_html(worksheet);
};
</script>

<style lang="scss" scoped>
.table-info {
  // overflow-x: scroll;
  width:100%;
  padding:10px;
  :deep(table) {
    width:100%;
    border-collapse:collapse;
    td {
      border:1px solid #ddd;
      border-collapse:collapse;
      padding:5px;
      height:30px;
      min-width:50px;
    }
  }
}
</style>
