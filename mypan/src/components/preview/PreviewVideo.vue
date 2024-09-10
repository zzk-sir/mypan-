<template>
  <div id="player" ref="player"></div>
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
import DPlayer from "dplayer";
//================================================================globolVar
//----------------------------------common
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
const videoInfo = ref({
  video: null,
});
const player = ref();
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const initPlayer = () => {
  const dp = new DPlayer({
    element: player.value,
    theme: "#FADFA3",
    screenslot: true,
    video: {
      url: `/api${props.url}`,
      type: "customHls",
      customType: {
        customHls: function (video, player) {
          const h = new Hls({
            xhrSetup: (xhr, url) => {
              // 在此处添加自定义请求头
              xhr.setRequestHeader("authorization", sessionStorage.getItem('authorization'));
            },
          });
          h.loadSource(video.src);
          h.attachMedia(video);
        },
      },
    },
  });
  console.log("视频播放器初始化dp=======",dp)
};
//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  initPlayer();
});
//================================================================emits

//================================================================expose

//================================================================request
</script>

<style lang="scss" scoped>
#player {
  width: 100%;
  :deep(.dplayer-video-wrap) {
    text-align: center;
    .dplayer-video {
      margin: 0px center;
      max-height: calc(100vh - 41px);
    }
  }
}
</style>
