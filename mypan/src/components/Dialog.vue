<template>
  <div>
    <el-dialog
      :show-close="showClose"
      :draggable="true"
      :model-value="show"
      :close-on-click-model="false"
      :title="title"
      class="cust-dialog"
      :top="top + 'px'"
      :width="width"
      @close="close"
    >
      <div
        class="dialog-body"
        :style="{ 'max-height': maxHeight + 'px', padding: padding + 'px' }"
      >
        <slot></slot>
      </div>
      <template v-if="(buttons && buttons.length > 0) || showCancel">
        <div class="dialog-footer">
          <el-button v-if="showCancel" link @click="close"> 取消 </el-button>
          <el-button
            v-for="(btn, index) in buttons"
            :type="btn.type || 'primary'"
            :key="index"
            @click="btn.click"
          >
            {{ btn.text }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
//================================================================globolVar

//================================================================api

//================================================================props
const props = defineProps({
  title: {
    type: String,
  },
  show: {
    type: Boolean,
    default: false,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  top: {
    type: Number,
    default: 50,
  },
  width: {
    type: String,
    default: "30%",
  },
  buttons: {
    type: Array,
  },
  padding: {
    type: Number,
    default: 15,
  },
});
//================================================================var
//----------------------------------common
const maxHeight = window.innerHeight - props.top - 100;

//----------------------------------rules

//================================================================methods
//----------------------------------common
const close = () => {
  emit("close");
};
//----------------------------------watch

//================================================================emits
const emit = defineEmits();

//================================================================expose

//================================================================request
</script>
<style lang="scss" scoped>
.cust-dialog {
  margin: 30px auto 10px limportant;
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    min-height: 80px;
    overflow: auto;
  }
  .dialog-footer {
    text-align: right;
    padding: 5px 20px;
  }
}
</style>
