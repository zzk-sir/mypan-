<template>
  <div class="top">
    <div class="top-op">
      <!-- 批量删除 -->
      <el-button
        type="danger"
        @click="delFileBatch"
        :disabled="selectFileIdList.length == 0"
      >
        <span class="iconfont icon-del"></span>
        批量删除
      </el-button>
      <!-- 搜索 -->
      <div class="search-panel">
        <!-- input -->
        <el-input
          clearable
          placeholder="请输入文件名搜索"
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
    <!-- 导航 -->
    <Navigation ref="navigationRef" @navChange="navChange"> </Navigation>
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
      <Table
        ref="dataTableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :initFetch="false"
        :options="tableOptions"
        @rowSelected="rowSelected"
      >
        <template #fileName="{ index, row }">
          <div
            class="file-item"
            @mouseenter="showOp(row)"
            @mouseleave="cancelShowOp(row)"
          >
            <!-- 文件图标 -->
            <!-- 文件类型为视频或图片，并且是转码成功的 使用后端的封面 -->
            <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2">
              <Icon :cover="row.fileCover" :width="32" @click="preview(row)"> </Icon>
            </template>
            <template v-else>
              <!-- 文件为文件 -->
              <Icon
                v-if="row.folderType == 0"
                :fileType="row.fileType"
                @click="preview(row)"
              >
              </Icon>
              <!-- 文件为目录 -->
              <Icon v-if="row.folderType == 1" :fileType="0" @click="preview(row)">
              </Icon>
            </template>
            <!-- 文件名 -->
            &nbsp;&nbsp;
            <template v-if="!row.fileId || row.status != 2">
              <span @click="preview(row)">{{ row.fileName }}</span>
            </template>
            <span class="file-name" :title="row.fileName" v-if="!row.showEdit">
              <!-- 文件操作 -->
              <template v-if="row.fileId && row.status == 2">
                <el-popover placement="left" :width="20" trigger="hover">
                  <div class="opt">
                    <el-button
                      class="iconfont icon-download"
                      v-if="row.folderType == 0"
                      @click="download(row)"
                    >
                      下载
                    </el-button>
                    <el-button class="iconfont icon-del" @click="delFile(row)"
                      >删除</el-button
                    >
                  </div>
                  <template #reference>
                    <span @click="preview(row)">{{ row.fileName }}</span>
                  </template>
                </el-popover>
              </template>

              <span v-if="row.status == 0" class="transfer-status">转码中</span>
              <span v-if="row.status == 1" class="transfer-status tranfer-fail"
                >转码失败</span
              >
            </span>

            <div class="edit-panel" v-if="row.showEdit">
              <el-input
                v-model.trim="row.fileNameReal"
                ref="editNameRef"
                :maxLength="190"
                type="text"
                @keyup.enter="saveNameEdit(index)"
              >
                <template #suffix>
                  {{ row.fileSuffix }}
                </template>
              </el-input>
              <span
                :class="['iconfont icon-right1', row.fileNameReal ? '' : 'not-allow']"
                @click="saveNameEdit(index)"
              ></span>
              <span class="iconfont icon-error" @click="cancelNameEdit(index)"></span>
            </div>
          </div>
        </template>
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">
            {{ proxy.Utils.size2Str(row.fileSize) }}
          </span>
        </template>
        <template #delFlag="{ index, row }">
          <span v-if="row.delFlag == 1"> 回收站 </span>
          <span v-else-if="row.delFlag == 2"> 主目录 </span>
        </template>
      </Table>
    </div>
    <!-- 预览 -->
    <Preview ref="previewRef"></Preview>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
//================================================================globolVar
//----------------------------------common
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
//----------------------------------declare

//================================================================api
const api = {
  loadDataList: "/admin/loadFileList",
  delFile: "/admin/delFile",
  createDownLoadUrl: "/admin/createDownloadUrl",
  download: "/api/admin/download",
};

//================================================================props

//================================================================var
//----------------------------------common
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "发布人",
    prop: "nickName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
  {
    label: "位置",
    prop: "delFlag",
    scopedSlots: "delFlag",
  },
];
const tableData = ref({});
const tableOptions = ref({
  extHeight: 50,
  selectType: "checkBox",
});
const fileNameFuzzy = ref();
const selectFileIdList = ref([]);
// 遮罩显示
const showLoading = ref(true);
// 当前目录
const currentFolder = ref({
  fileId: "0",
});
const navigationRef = ref();
const previewRef = ref();
//----------------------------------rules

//----------------------------------computed

//================================================================methods
//----------------------------------common
// 搜索
const search = () => {
  showLoading.value = true;
  resetPage();
  loadDataList();
  fileNameFuzzy.value = null;
};
// 刷新
const refresh = () => {
  fileNameFuzzy.value = null;
  resetPage();
  loadDataList();
};
// 多选
const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach((item) => {
    selectFileIdList.value.push(item.userId + "_" + item.fileId);
  });
};
//
const navChange = (data) => {
  const { curFolder } = data;
  console.log("nav", data);
  currentFolder.value = curFolder;
  showLoading.value = true;
  //
  resetPage();
  loadDataList();
};
// 预览
const preview = (data) => {
  if (data.folderType == 1) {
    // 目录
    navigationRef.value.openFolder(data);
    return;
  }
  // 文件
  if (data.status != 2) {
    proxy.Message.warning("文件正在转码中，暂时无法预览，刷新试试");
    return;
  }
  previewRef.value.showPreview(data, 1);
};
// 显示操作按钮
const showOp = (row) => {
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  row.showOp = true;
};
// 取消显示操作按钮
const cancelShowOp = (row) => {
  row.showOp = false;
};
// 重置pageNo
const resetPage = ()=>{
  tableData.value.pageNo = null;
}

//----------------------------------watch

//----------------------------------onMounted

//================================================================emits
const emit = defineEmits(["reload"]);
//================================================================expose

//================================================================request
// 加载文件数据
const loadDataList = async () => {
  console.log("加载文件数据");
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 15,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: currentFolder.value.fileId,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
    showLoading: showLoading.value,
  });
  if (!result) return;
  tableData.value = result;
};
// 单个删除
const delFile = (row) => {
  proxy.Confirm(
    `你确定要删除【${row.fileName}】吗？在管理端删除文件将会永久删除，还请三思.`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIdAndUserIds: row.userId + "_" + row.fileId,
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success(result);
      resetPage();
      loadDataList();
      emit('reload');
    }
  );
};
// 批量删除
const delFileBatch = () => {
  if (selectFileIdList.value.length == 0) {
    // 没有选中
    return;
  }
  proxy.Confirm(
    `你确定要删除这些文件吗? 在管理端删除文件将会永久删除，还请三思.`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIdAndUserIds: selectFileIdList.value.join(","),
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success(result);
      resetPage();
      loadDataList();
      emit('reload');
    }
  );
};
// 下载
const download = async (row) => {
  console.log(row);
  let result = await proxy.Request({
    url: api.createDownLoadUrl + "/" + row.userId + "/" + row.fileId,
  });
  if (!result) return;
  else {
    window.location.href = api.download + "/" + result;
  }
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
