<template>
  <div class="top">
    <div class="top-op">
      <div class="btn">
        <!-- 上传按钮 -->
        <el-upload
          :show-file-list="false"
          :with-credentials="true"
          :multiple="true"
          :http-request="addFile"
          :accept="fileAccept"
        >
          <el-button type="primary">
            <span class="iconfont icon-upload"></span>
            上传
          </el-button>
        </el-upload>
      </div>
      <!-- 新建文件夹 -->
      <el-button type="success" @click="newFolder" v-if="route.params.category == 'all'">
        <span class="iconfont icon-folder-add"></span>
        新建文件夹
      </el-button>
      <!-- 批量删除 -->
      <el-button
        type="danger"
        @click="delFileBatch"
        :disabled="selectFileIdList.length == 0"
      >
        <span class="iconfont icon-del"></span>
        批量删除
      </el-button>
      <!-- 批量移动 -->
      <el-button
        type="warning"
        @click="moveFolderBatch"
        :disabled="selectFileIdList.length == 0"
      >
        <span class="iconfont icon-del"></span>
        批量移动
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
                <el-button class="iconfont icon-share" @click="share(row)">
                  分享
                </el-button>
                <el-button
                  class="iconfont icon-download"
                  v-if="row.folderType == 0"
                  @click="download(row.fileId)"
                >
                  下载
                </el-button>
                <el-button class="iconfont icon-del" @click="delFile(row)"
                  >删除</el-button
                >
                <el-button class="iconfont icon-edit" @click="editFileName(index)">
                  重命名
                </el-button>
                <el-button class="iconfont icon-move" @click="moveFolder(row)"
                  >移动</el-button>
                </div>
                <template #reference>
                  <span
                    @click="preview(row)"
                    >{{ row.fileName }}</span
                  >
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
                :maxlength="190"
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
      </Table>
    </div>
    <div class="no-data" v-else>
      <div class="no-data-inner">
        <Icon iconName="no_data" :width="120" fit="fill"></Icon>
        <div class="tips">当前目录为空，上传你的第一个文件吧</div>
        <div class="op-list">
          <!-- 上传按钮 -->
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <div class="op-item">
              <Icon iconName="file" :width="60"></Icon>
              <div>上传文件</div>
            </div>
          </el-upload>
          <div class="op-item" v-if="category == 'all'" @click="newFolder">
            <Icon iconName="folder" :width="60"></Icon>
            <div>新建目录</div>
          </div>
        </div>
      </div>
    </div>
    <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
    <!-- 预览 -->
    <Preview ref="previewRef"></Preview>
    <!-- 分享 -->
    <ShareFile ref="shareRef"></ShareFile>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  computed,
  onMounted,
  onUnmounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import CategoryInfo from "@/js/CategoryInfo";
import ShareFile from "./ShareFile.vue";
//================================================================globolVar
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
//================================================================api
const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFolder: "/file/newFolder",
  getFolderInfo: "/file/getFolderInfo",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
};
//================================================================props

//================================================================var
//----------------------------------common

// 当前目录
const currentFolder = ref({
  fileId: "0",
});

const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
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
];

const tableData = ref({});
const tableOptions = ref({
  extHeight: 50,
  selectType: "checkBox",
});
const category = ref();
const fileNameFuzzy = ref();
const selectFileIdList = ref([]);

const folderSelectRef = ref();
const currentMoveFile = ref();
// 是否正在编辑行
const editing = ref(false);
const editNameRef = ref();
const navigationRef = ref();
// 遮罩显示
const showLoading = ref(true);

const previewRef = ref();
const shareRef = ref();
const wwidth = ref();

const showPopover = ref(false);
//----------------------------------rules

//----------------------------------computed
// 过滤上传文件的格式
const fileAccept = computed(() => {
  const categoryItem = CategoryInfo[category.value];
  return categoryItem ? categoryItem.accept : "*";
});
//================================================================methods
//----------------------------------common

// 窗口相应式
const resizeHandle = () => {
  wwidth.value = window.innerWidth;
};
// 多选
const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId);
  });
};
// 批量移动
const moveFolderBatch = () => {
  // console.log("批量移动", currentFolder.value);
  currentMoveFile.value = {};
  let execludeIds = tableData.value.list
    .filter(
      (file) => file.folderType == 1 && selectFileIdList.value.includes(file.fileId)
    )
    .map((file) => file.fileId);
  // console.log(execludeIds);
  folderSelectRef.value.excludeSelectFolder(execludeIds);
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};
// 单独移动
const moveFolder = (data) => {
  // console.log("单独移动");
  currentMoveFile.value = data;
  if (data.fileType == 1) folderSelectRef.value.excludeSelectFolder([data]);
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
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
// 新建文件夹
const newFolder = () => {
  if (editing.value) return;
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  editing.value = true;
  let filePid = "0";
  if (!!route.query.path) {
    let arr = route.query.path.split("/");
    filePid = arr[arr.length - 1];
  }
  // console.log("文件Pid+++++++++++++", filePid);
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: "",
    filePid: filePid,
  });
  nextTick(() => {
    editNameRef.value?.focus();
  });
};
// 取消重命名或创建
const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index];
  if (fileData.fileId) {
    fileData.showEdit = false;
  } else {
    tableData.value.list.splice(index, 1);
  }
  editing.value = false;
};
// 重命名
const editFileName = (index) => {
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1);
    index = index - 1;
  }
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  let currentData = tableData.value.list[index];
  currentData.showEdit = true;
  // 编辑文件
  if (currentData.folderType == 0) {
    currentData.fileNameReal = currentData.fileName.substring(
      0,
      currentData.fileName.lastIndexOf(".")
    );
    currentData.fileSuffix = currentData.fileName.substring(
      currentData.fileName.lastIndexOf(".")
    );
  } else {
    currentData.fileNameReal = currentData.fileName;
    currentData.fileSuffix = "";
  }
  editing.value = true;
  nextTick(() => {
    editNameRef.value.focus();
  });
};
// 上传文件 ，子组件调用父组件方法
const addFile = (fileData) => {
  emit("addFile", {
    file: fileData.file,
    filePid: currentFolder.value.fileId,
    addFileCallback: loadDataList,
  });
};
// 拖拽文件
const dropFile = (file,filePid)=>{
  emit("addFile", {
    file: file,
    filePid: filePid?filePid:currentFolder.value.fileId,
    addFileCallback: loadDataList,
  });
}
// 拖拽文件夹
const dropFolder = (folderEntry)=>{
  console.log(folderEntry)
  processEntry(folderEntry,currentFolder.value.fileId)
  resetPage()
  loadDataList()
}
// 遍历文件夹
const processEntry = async (entry,filePid)=>{
  console.log(123,entry)
  if (entry.isDirectory) {
      // 如果是目录，递归调用 processEntries
      // console.log("文件夹",entry)
      // 新建文件夹
      let res = await dropNewFolder(filePid, entry.name);
      if(!res){
        return;
      }
      const reader = entry.createReader();
      reader.readEntries((subEntries) => {
        for(let subEntry of subEntries){
          processEntry(subEntry,res.fileId); // 递归处理子目录
        }
      });
    } else {
      // 如果是文件，调用回调函数
      entry.file((file)=>{
        // 上传文件
        // console.log("文件",file,filePid)
        file.uid = proxy.Utils.fileUid() 
        dropFile(file,filePid)
      })
    }
}


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
  previewRef.value.showPreview(data, 0);
};

const navChange = (data) => {
  // console.log("navChange",data)
  const { categoryId, curFolder } = data;
  currentFolder.value = curFolder;
  category.value = categoryId;
  resetPage();
  loadDataList();
};

//  添加文件回调
const reload = () => {
  // 上传完成后，不展示遮罩
  showLoading.value = false;
  resetPage()
  loadDataList();
};
// 搜索
const search = () => {
  showLoading.value = true;
  resetPage()
  loadDataList();
  fileNameFuzzy.value = null;
};
// 刷新
const refresh = () => {
  fileNameFuzzy.value = null;
  resetPage();
  loadDataList();
};
// 分享
const share = (row) => {
  shareRef.value.show(row);
};
// 重置pageNo
const resetPage = ()=>{
  tableData.value.pageNo = null;
}
//----------------------------------watch

//----------------------------------onMounted

//================================================================emits
const emit = defineEmits(["addFile"]);

//================================================================expose
defineExpose({ reload,dropFile,dropFolder });
//================================================================request
// 加载文件数据
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 15,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: currentFolder.value.fileId,
    category: category.value,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
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
    `你确定要删除【${row.fileName}】吗？删除的文件可在10天内通过回收站还原.`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: row.fileId,
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success(result);
      resetPage()
      loadDataList();
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
    `你确定要删除这些文件吗? 删除的文件可在10天内通过回收站还原.`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: selectFileIdList.value.join(","),
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success(result);
      resetPage()
      loadDataList();
    }
  );
};
//
const moveFolderDone = async (folderId) => {
  if (currentFolder.value.fileId == folderId) {
    proxy.Message.warning("文件正在当前目录无需移动");
    return;
  }
  let fileIdsArray = [];
  if (currentMoveFile.value.fileId) {
    fileIdsArray.push(currentMoveFile.value.fileId);
  } else {
    fileIdsArray = fileIdsArray.concat(selectFileIdList.value);
  }
  // console.log("移动请求");
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: fileIdsArray.join(","),
      filePid: folderId,
    },
  });
  if (!result) {
    return;
  }
  // 关闭子模态框
  folderSelectRef.value.close();
  // 重新加载列表
  resetPage();
  loadDataList();
};
// 拖拽新建文件夹 
const dropNewFolder = async (filePid, fileNameReal)=>{
  if (fileNameReal == "" || /[\\/\*\?\:]/.test(fileNameReal)) {
    proxy.Message.warning("文件名不能为空且不能含有\/*?:");
    return;
  }
  let res = await proxy.Request({
    url:api.newFolder,
    params: {
      filePid: filePid,
      fileName: fileNameReal,
    },
  });
  if (!res) return;
  editing.value = false;
  return res;
} 

// 保存文件名
const saveNameEdit = async (index) => {
  console.log(tableData.value.list,index)
  const { fileId, filePid, fileNameReal } = tableData.value.list[index];
  if (fileNameReal == "" || /[\\/\*\?\:]/.test(fileNameReal)) {
    proxy.Message.warning("文件名不能为空且不能含有\/*?:");
    return;
  }
  let url = api.rename;
  if (fileId == "") {
    url = api.newFolder;
  }
  let res = await proxy.Request({
    url,
    params: {
      fileId: fileId,
      filePid: filePid,
      fileName: fileNameReal,
    },
  });
  if (!res) return;

  tableData.value.list[index] = res;
  editing.value = false;
};
// 下载
const download = async (fileId) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + fileId,
  });
  if (!result) return;
  else {
    window.location.href = api.download + "/" + result;
  }
};
//
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.opt{
  .iconfont{
    margin:2px auto 2px 12px;
  }
}
</style>
