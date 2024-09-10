<template>
  <div class="avatar-upload">
    <div class="avatar-show">
      <template v-if="localFile">
        <img :src="localFile" />
      </template>
      <template v-else>
        <img :src="`/api/getAvatar/${modelValue.userId}`" v-if="modelValue.userId" />
      </template>
    </div>
    <div class="select-btn">
      <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage"
      >
        <el-button type="primary">选择</el-button>
      </el-upload>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

//================================================================api

//================================================================props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});
//================================================================var
//----------------------------------common
const timestamp = ref("");
const localFile = ref(null);
//----------------------------------rules

//================================================================methods
//----------------------------------common
const uploadImage = async (file) => {
  file = file.file;
  let img = new FileReader();
  img.readAsDataURL(file);
  img.onload = ({ target }) => {
    // console.log(target);
    localFile.value = target.result;
  };
  // console.log("加载图片", file);
  emit("update:modelValue", file);
};
//----------------------------------watch

//================================================================emits
const emit = defineEmits();

//================================================================expose

//================================================================request
</script>

<style lang="scss" scoped>
.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: end;
  .avatar-show {
    background: rgb(245, 245, 245);
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    .iconfont {
      font-size: 50px;
      color: #ddd;
    }
    img {
      width: 100%;
      height: 100%;
    }
    .op {
      position: absolute;
      color: #0ebaef;
      top: 80px;
    }
  }
  .select-btn {
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
