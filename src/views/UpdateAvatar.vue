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
      :ref="formDataRef"
      label-width="80px"
      @submit.pervent
    >
      <!-- input输入 -->
      <el-form-item label="昵称">
        {{ formData.nickName }}
      </el-form-item>

      <el-form-item label="头像上传" prop="">
        <AvatarUpload v-model="formData.avatar"></AvatarUpload>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import AvatarUpload from "@/components/AvatarUpload.vue";
import { ref, reactive, getCurrentInstance, nextTick, watch } from "vue";

//================================================================globolVar
const { proxy } = getCurrentInstance();

//================================================================api
const api = {
  updateUserAvatar: "/updateUserAvatar",
};

//================================================================props

//================================================================var
//----------------------------------common
const formData = ref({});
const formDataRef = ref();
const rules = {
  title: [{ require: true, message: "请输入内容" }],
};
const dialogConfig = reactive({
  show: false,
  title: "修改头像",
  buttons: [
    {
      type: "danger",
      text: "确定",
      click: (e) => {
        SubmitForm();
      },
    },
  ],
});
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted

//================================================================emits
const emit = defineEmits([]);

//================================================================expose
const show = (data) => {
  formData.value = Object.assign({}, data);
  formData.value.avatar = { userId: data.id };
  dialogConfig.show = true;
};
defineExpose({ show });

//================================================================request
const SubmitForm = async () => {
  if (!(formData.value.avatar instanceof File)) {
    dialogConfig.show = false;
    return;
  }
  let res = await proxy.Request({
    url: api.updateUserAvatar,
    params: {
      avatar: formData.value.avatar,
    },
  });
  if (!res) {
    return;
  }
  dialogConfig.show = false;
  // console.log("提交表单", res);
  emit("updateAvatar");
};
</script>

<style lang="scss" scoped></style>
