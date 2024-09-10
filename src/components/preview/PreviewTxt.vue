<template>
  <div class="code">
    <div class="top-op">
      <div class="encode-select">
        <!-- 下拉框 -->
        <el-select
          clearable
          placeholder="选择编码"
          v-model="encode"
          @change="changeEncode"
        >
          <el-option value="utf-8" lable="utf-8编码"></el-option>
          <el-option value="gbk" lable="gbk编码"></el-option>
        </el-select>
      </div>
    </div>
    <div class="copy-btn">
        <el-button type="primary" @click="copy">复制</el-button>
    </div>
    <highlightjs autodetect :code="txtContent"></highlightjs>
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
import useClipboard from "vue-clipboard3";
//================================================================globolVar
//----------------------------------common
const { proxy } = getCurrentInstance();
const { toClipboard } = useClipboard();
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
const txtContent = ref("");
const blobResult = ref();
const encode = ref("utf-8");

//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const showTxt = () => {
  const reader = new FileReader();
  reader.onload = () => {
    let txt = reader.result;
    txtContent.value = txt;
  };
  reader.readAsText(blobResult.value, encode.value);
};
const changeEncode = (e) => {
  encode.value = e;
  showTxt();
};
const copy = async () => {
  await toClipboard(txtContent.value);
  proxy.Message.success("复制成功");
};
//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  readTxt();
});
//================================================================emits

//================================================================expose

//================================================================request
const readTxt = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  if (!result||/json/.test(result.type)) {
    proxy.Message.error("文件不存在")
    return
  };
  blobResult.value = result;
  showTxt();
};
</script>

<style lang="scss" scoped>
.code{
    background-color:#fafafa;
    width:100%;
    .top-op{
        display:flex;
        align-items:center;
        justify-content:space-around;

    }
    .encode-select{
        flex:1;
        display: flex;
        align-items:center;
        margin:5px 10px;
        .tips{
            margin-left:10px;
            color:#828282;

        }
    }
    .copy-btn{
        margin-right: 10px;
        button{
            width:45px;
            height:23px;
            font-size: 14px;
            background-color:transparent;
            color:black;
            float: right;
            margin-left: -100px;
        }
    }
    pre{
        margin: 0;
    }
}
</style>
