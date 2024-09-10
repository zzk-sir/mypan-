<template>
  <div class="music">
    <div class="body-content">
      <div class="cover">
        <img 
          :class="ispaused?'paused':''"
          src="https://img1.baidu.com/it/u=655077751,2306344017&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
        />
      </div>
      <div ref="playerRef" class="music-player"></div>
    </div>
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
  onUnmounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import APlayer from "APlayer";
import "APlayer/dist/Aplayer.min.css";
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
  fileName: {
    type: String,
  },
});
//================================================================var
//----------------------------------common
const playerRef = ref();
const player = ref();

const ispaused = ref(true);
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted
onMounted(async () => {
    let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  if(!result) return
  let url =  URL.createObjectURL(result)
  player.value = new APlayer({
    container: playerRef.value,
    audio: {
      url: url,
      name: props.fileName,
      cover: new URL("@/assets/music_icon.png", import.meta.url).href,
      artist: "",
    }
  });
  player.value.audio.onplay = (e)=>{
    console.log('开始',e.target.paused)
    ispaused.value = false
  }
  player.value.audio.onpause = (e)=>{
    console.log('暂停',e.target.paused)
    ispaused.value = true
  }
  console.log("player===================================",player.value)
  console.log("player===================================",playerRef.value)
});
//----------------------------------onUnmounted
onUnmounted(() => {
  player.value.destroy();
});
//================================================================emits

//================================================================expose

//================================================================request

//================================================================

</script>

<style lang="scss" scoped>
.music {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color:rgb(135, 166, 222);
  .body-content {
    text-align: center;
    width: 80%;
    .cover {
      margin: 0px auto;
      width: 200px;
      text-align: center;
      img {
        width: 100%;
        border-radius: 50%;
        animation: revolve 4s linear infinite;
      }
      .paused {
        animation-play-state: paused;
      }
    }
    .music-player {
      border-radius: 15px 15px 10px 10px;
      margin-top: 200px;
      box-shadow: inset 0 -3em 3em rgba(0,0,0,0.1),
             0 0  0 2px rgb(190, 190, 190),
             0.3em 0.3em 1em rgba(0,0,0,0.3);
    }
    
  }
}
@keyframes revolve{
  from{
    transform: rotateZ(0deg);
  }
  to{
    transform: rotateZ(360deg);
  }
}
</style>
