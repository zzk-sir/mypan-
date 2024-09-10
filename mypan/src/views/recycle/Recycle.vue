<template>
  <div>
    <div class="top">
      <el-button
        type="success"
        class="iconfont icon-revert"
        :disabled="selectIdList.length == 0"
        @click="revertBatch"
      >
        <span>还原</span>
      </el-button>
      <el-button
        type="danger"
        class="iconfont icon-del"
        :disabled="selectIdList.length == 0"
        @click="delBatch"
      >
        <span>批量删除</span>
      </el-button>
    </div>
    <div class="file-list">
      <Table
        ref="dataTableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :initFetch="true"
        :options="tableOptions"
        @rowSelected="rowSelected"
      >
        <template #fileName="{ index, row }">
          <div
            class="file-item"
            @mouseenter="showOp(row)"
            @mouseleave="cancelShowOp(row)"
          >
            <!-- 视频或图片显示封面 -->
            <template v-if="row.fileType == 3 || (row.fileType == 1 && row.status != 0)">
              <Icon :cover="row.fileCover"></Icon>
            </template>
            <template v-else>
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>
            <span v-if="!showOp" class="file-name" :title="row.fileName">{{
              row.fileName
            }}</span>

            <template v-if="showOp">
              <el-popover placement="left" :width="20" trigger="hover">
                <div class="opt">
                  <el-button class="iconfont icon-revert" @click="revert(row)"
                    >还原</el-button
                  >
                  <el-button class="iconfont icon-del" @click="delFile(row)"
                    >删除</el-button
                  >
                </div>
                <template #reference>
                  <span class="file-name" :title="row.fileName">{{ row.fileName }}</span>
                </template>
              </el-popover>
            </template>
          </div>
        </template>
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">{{ proxy.Utils.size2Str(row.fileSize) }}</span>
        </template>
      </Table>
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
} from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
const { proxy } = getCurrentInstance();
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "删除时间",
    prop: "recoveryTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
];
//----------------------------------common
//----------------------------------declare
//================================================================api
const api = {
  loadDataList: "/recycle/loadRecycleList",
  delFile: "/recycle/delFile",
  recoverFile: "/recycle/recoverFile",
};
//================================================================props

//================================================================var
//----------------------------------common
const tableData = ref({});
const tableOptions = {
  extHeight: 20,
  selectType: "checkBox",
};
const selectIdList = ref([]);
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
const rowSelected = (row) => {
  selectIdList.value = [];
  row.forEach((item) => {
    selectIdList.value.push(item.fileId);
  });
};
const showOp = (row) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  row.showOp = true;
};
const cancelShowOp = (row) => {
  row.showOp = false;
};
//----------------------------------watch

//----------------------------------onMounted

//================================================================emits
const emit = defineEmits(["reload"]);
//================================================================expose

//================================================================request
// 加载
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 15,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) return;
  tableData.value = result;
};
// 恢复
const revert = (row) => {
  proxy.Confirm(`你确定要还原【${row.fileName}】吗?`, async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {
        fileIds: row.fileId,
      },
    });
    if (!result) {
      loadDataList();
      return;
    }
    proxy.Message.success(result);
    loadDataList();
    emit("reload");
  });
};
const revertBatch = () => {
  proxy.Confirm(`你确定要还原这些文件吗?`, async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {
        fileIds: selectIdList.value.join(","),
      },
    });
    if (!result) {
      loadDataList();
      return;
    }
    proxy.Message.success(result);
    loadDataList();
    emit("reload");
  });
};
// 删除文件
const delFile = (row) => {
  proxy.Confirm(`你确定要删除【${row.fileName}】吗?`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: row.fileId,
      },
    });
    if (!result) {
      loadDataList();
      return;
    }
    proxy.Message.success(result);
    loadDataList();
    emit("reload");
  });
};
const delBatch = () => {
  proxy.Confirm(`你确定要删除这些文件吗?删除后无法恢复。`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: selectIdList.value.join(","),
      },
    });
    if (!result) {
      loadDataList();
      return;
    }
    proxy.Message.success(result);
    loadDataList();
    emit("reload");
  });
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 120px;
    }
  }
}
.opt {
  .iconfont {
    margin: 2px auto 2px 12px;
  }
}
</style>
