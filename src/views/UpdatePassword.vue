<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
      @submit.prevent
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          clearable
          placeholder="请输入密码"
          v-model.trim="formData.password"
          size="large"
          show-password
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePassword">
        <el-input
          clearable
          placeholder="请再次输入密码"
          v-model.trim="formData.rePassword"
          size="large"
          show-password
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import md5 from "js-md5";

//================================================================globolVar
const { proxy } = getCurrentInstance();
//----------------------------------declare
const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
//================================================================api
const api = {
  updatePassword: "/updatePassword",
};
//================================================================props

//================================================================var
//----------------------------------common
const formDataRef = ref();
const formData = ref({});
const dialogConfig = ref({
  show: false,
  title: "修改密码",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: () => {
        submitForm();
      },
    },
  ],
});
//----------------------------------rules
const rules = {
  password: [
    { required: true, message: "请输入密码" },
    {
      validator: proxy.Verify.password,
      message: "请输入数字,字母,-,_,且长度在8-32之间的密码",
    },
  ],
  rePassword: [
    { required: true, message: "请再次输入密码" },
    { validator: checkRePassword, message: "两次密码不一致" },
  ],
};
//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose
const show = () => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {};
  });
};
defineExpose({
  show,
});
//================================================================request
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let res = await proxy.Request({
      url: api.updatePassword,
      params: {
        password: md5(formData.value.password),
      },
    });
    if (!res) return;
    dialogConfig.value.show = false;
    // 修改localstorage 中的password
    let userInfo = proxy.LocalStorage.get("loginInfo");
    userInfo.password = md5(formData.value.password);
    proxy.LocalStorage.update("loginInfo", userInfo);
    proxy.Message.success("密码修改成功");
  });
};
</script>

<style lang="less" scoped></style>
