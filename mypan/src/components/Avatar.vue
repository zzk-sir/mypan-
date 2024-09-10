<template>
  <span class="avatar" :style="{ width: width + 'px', height: width + 'px' }">
    <img
      :src="
        avatar && avatar != ''
          ? avatar
          : `${proxy.globalInfo.avatarUrl}${userId}?time=${timestamp}`
      "
      v-if="userId"
    />
  </span>
</template>

<script setup>
import { getCurrentInstance, watch } from "vue";
//================================================================globolVar
const { proxy } = getCurrentInstance();

//================================================================api

//================================================================props
const props = defineProps({
  userId: {
    type: String,
  },
  avatar: {
    type: String,
  },
  timestamp: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 40,
  },
});
// console.log(props.timestamp);
//================================================================var
//----------------------------------common

//----------------------------------rules

//================================================================methods
//----------------------------------common

//----------------------------------watch

//================================================================emits

//================================================================expose

//================================================================request
</script>

<style lang="scss" scoped>
.avatar {
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    object-fit: cover;
  }
}
</style>
