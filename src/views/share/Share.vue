<template>
  <div>
    <div class="top">
      <div class="top-op">
        <el-button
          type="primary"
          :disabled="selectIdList.length == 0"
          @click="cancelShareBatch"
        >
          <span class="iconfont icon-cancel"></span>
          取消分享</el-button
        >
        <!-- 搜索 -->
        <div class="search-panel">
          <!-- input -->
          <el-input
            clearable
            placeholder="请输入分享文件名搜索"
            v-model.trim="fileNameFuzzy"
            @keyup.enter="search"
          >
            <template #suffix>
              <i class="iconfont icon-search" @click="search"></i>
            </template>
          </el-input>
        </div>
        <!-- 刷新 -->
        <div class="iconfont icon-refresh" @click="refresh"></div>
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
              <template
                v-if="row.fileType == 3 || (row.fileType == 1 && row.status != 0)"
              >
                <Icon :cover="row.fileCover"></Icon>
              </template>
              <template v-else>
                <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
                <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
              </template>
              <template v-if="!showOp">
                <span class="file-name" :title="row.fileName">{{ row.fileName }}</span>
              </template>
              <template v-if="showOp">
                <el-popover placement="left" :width="20" trigger="hover">
                  <div class="opt">
                    <el-button class="iconfont icon-link" @click="copy(row)"
                      >复制链接</el-button
                    >
                    <el-button class="iconfont icon-cancel" @click="cancelShare(row)"
                      >取消分享</el-button
                    >
                  </div>
                  <template #reference>
                    <span class="file-name" :title="row.fileName">{{
                      row.fileName
                    }}</span>
                  </template>
                </el-popover>
              </template>
            </div>
          </template>
          <template #expireTime="{ index, row }">
            {{ row.validType == 3 ? "永久" : row.expireTime }}
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
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
    label: "分享时间",
    prop: "shareTime",
    width: 200,
  },
  {
    label: "失效时间",
    prop: "expireTime",
    scopedSlots: "expireTime",
    width: 200,
  },
  {
    label: "浏览次数",
    prop: "showCount",
    width: 200,
  },
];
//----------------------------------common
//----------------------------------declare
//================================================================api
const api = {
  loadDataList: "/share/loadDataList",
  cancelShare: "/share/cancelShare",
};
//================================================================props

//================================================================var
//----------------------------------common
const selectIdList = ref([]);
const shareUrl = ref(document.location.origin + "/shareCheck/");
const tableData = ref({});
const tableOptions = {
  extHeight: 20,
  selectType: "checkBox",
};
const cancelShareIdList = ref([]);
const fileNameFuzzy = ref();

const navigationRef = ref();
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
// 取消分享(批量)
const cancelShareBatch = () => {
  if (selectIdList.value.length == 0) {
    return;
  }
  cancelShareIdList.value = selectIdList.value;
  console.log(cancelShareIdList.value);
  cancelShareDone();
};
// 取消分享(单个)
const cancelShare = (row) => {
  cancelShareIdList.value = [row.shareId];
  cancelShareDone();
};

const cancelShareDone = () => {
  proxy.Confirm(`你确定要取消分享吗?`, async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: cancelShareIdList.value.join(","),
      },
    });
    if (!result) return;
    proxy.Message.success("取消分享成功");
    loadDataList();
  });
};
// 搜索
const search = () => {
  loadDataList();
};
const rowSelected = (row) => {
  selectIdList.value = [];
  row.forEach((item) => {
    selectIdList.value.push(item.shareId);
  });
};
const showOp = (row) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  row.showOp = true;
};
const cancelShowOp = (data) => {
  data.showOp = false;
};
const copy = async(data) => {
    await proxy.toClipboard(`${shareUrl.value}${data.shareId} 提取码：${data.code}`)
    .then((res)=>{
      proxy.Message.success("复制成功");
    }).catch(err=>{
      proxy.Message.error(`复制失败：${err}`);
    })
};

//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose

//================================================================
const refresh = () => {
  loadDataList();
};
// 加载文件数据
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 15,
    fileNameFuzzy: fileNameFuzzy.value || "",
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
  });
  if (!result) return;
  tableData.value = result;
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.file-list {
  margin-top: 10px;
  .file-item {
    .file-name {
      span {
        &:hover {
          color: #494944;
        }
      }
    }
  }
  .op {
    width: 170px;
  }
}
.opt {
  .iconfont {
    margin: 2px auto 2px 12px;
  }
}
</style>
