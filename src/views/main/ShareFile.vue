<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      @close="closeDialog"
      width="400px"
      :showCancel="showCancel"
      @show="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
        @submit.prevent
      >
        <!-- 文件名 -->
        <el-form-item label="分享文件" prop="">
          {{ formData.fileName }}
        </el-form-item>
        <template v-if="showType == 0">
          <!-- 分享设置 -->
          <el-form-item label="有效期" prop="validType">
            <el-radio-group v-model="formData.validType">
              <el-radio :value="0">1天</el-radio>
              <el-radio :value="1">7天</el-radio>
              <el-radio :value="2">30天</el-radio>
              <el-radio :value="3">永久有效</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="提取码" prop="codeType">
            <el-radio-group v-model="formData.codeType">
              <el-radio :value="0">自定义</el-radio>
              <el-radio :value="1">系统生成</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- input输入 -->
          <el-form-item label="code" prop="code" v-if="formData.codeType == 0">
            <el-input
              clearable
              placeholder="请输入5位提取码"
              v-model="formData.code"
              maxLength="5"
              :style="{ width: '130px' }"
            >
            </el-input>
          </el-form-item>
        </template>
        <template v-else>
          <!-- 分享后 -->
          <el-form-item label="分享链接">
            {{ shareUrl }}{{ resultInfo.shareId }}
          </el-form-item>
          <el-form-item label="提取码">
            {{resultInfo.code}}
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="copy">复制链接</el-button>
          </el-form-item>
        </template>
      </el-form>
    </Dialog>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
//----------------------------------common
const { proxy } = getCurrentInstance();
//----------------------------------declare
//================================================================api
const api = {
  shareFile: "/share/shareFile",
};
//================================================================props

//================================================================var
//----------------------------------common
const formData = ref({})
const formDataRef = ref()
const shareUrl = ref(document.location.origin + "/shareCheck/");
const showType = ref(0); //是否分享表单 0 分享表单 1 分享结果
const dialogConfig = ref({
  show: false,
  title: "分享",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        share();
      },
    },
  ],
});
const resultInfo = ref({});
const showCancel = ref(true);
//----------------------------------rules
const rules = {
  validType: [{ required: true, message: "请选择有效期" }],
  codeType: [{ required: true, message: "请选择提取码类型" }],
  code: [
    { required: true, message: "请选择提取码类型" },
    { validator: proxy.Verify.shareCode, message: "请输入提取码" },
    { min: 5, max:5, message: "提取码5位" },
  ],
};
//----------------------------------computed

//================================================================methods
//----------------------------------common
const show = (data) => {
  showType.value = 0;
  dialogConfig.value.show = true;
  showCancel.value = true;
  resultInfo.value = {};
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = Object.assign({}, data);
  });
};
const closeDialog = ()=>{
    dialogConfig.value.show = false;
}
//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose
defineExpose({ show });
//================================================================request
const share = async () => {
  if (Object.keys(resultInfo.value).length > 0) {
    // 如果是关闭按钮退出
    dialogConfig.value.show = false;
    return;
  }
  // 分享按钮
  // 校验
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    let result = await proxy.Request({
      url: api.shareFile,
      params: params,
    });
    if (!result) return;
    // 设置位分享后
    showType.value = 1;
    resultInfo.value = result;
    dialogConfig.value.buttons[0].text = "关闭";
    showCancel.value = false;
  });
};
const copy = async()=>{
    await navigator.clipboard.writeText(`${shareUrl.value}${resultInfo.value.shareId} 提取码：${resultInfo.value.code}`);
    proxy.Message.success("复制成功");
}
</script>

<style lang="scss" scoped></style>
