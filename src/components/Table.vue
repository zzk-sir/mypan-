<template>
  <div>
    <el-table
      ref="datatable"
      :data="dataSource.list || []"
      :height="tableHeight"
      :stripe="options.stripe"
      :border="options.border"
      header-row-class-name="table-header-row"
      highlight-current-row
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
      <!--selection选择框  -->
      <el-table-column
        v-if="options.selectType && options.selectType == 'checkBox'"
        type="selection"
        width="50"
        align="center"
      >
      </el-table-column>
      <!-- 序号 -->
      <el-table-column
        v-if="options.showIndex"
        label="序号"
        type="index"
        width="60"
        algn="center"
      >
      </el-table-column>
      <!-- 数据列 -->
      <template v-for="(column, index) in columns">
        <template v-if="column.scopedSlots">
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
          >
            <template #default="scope">
              <slot :name="column.scopedSlots" :index="scope.$index" :row="scope.row">
              </slot>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
            :fixed="column.fixed"
          >
          </el-table-column>
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination" v-if="showPagination">
      <el-pagination
        v-if="dataSource.totalCount"
        background
        :total="dataSource.totalCount"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="dataSource.pageSize"
        :current-page.sync="dataSource.pageNo"
        :layout="layout"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNoChange"
        style="text-align: right"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

//================================================================globolVar

//================================================================api

//================================================================props
const props = defineProps({
  dataSource: Object,
  showPagination: {
    type: Boolean,
    default: true,
  },
  showPageSize: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Object,
    default: {
      extHeight: 0,
      showIndex: false,
    },
  },
  columns: Array,
  fetch: Function, // 获取数据的方法
  initFetch: {
    type: Boolean,
    default: true,
  },
});
//================================================================var
//----------------------------------common
const dataTable = ref();
//顶部 60,内容20 内容上下间距 15*2 分页区域高度 46
const topHeight = 60 + 20 + 30 + 46;

const tableHeight = ref(
  props.options.tableHeight
    ? props.options.tableHeight
    : window.innerHeight - topHeight - props.options.extHeight
);
//----------------------------------computed
const layout = computed(() => {
  return `total,${props.showPageSize ? "sizes" : ""},prev,pager,next,jumper`;
});
//----------------------------------rules

//================================================================methods
//----------------------------------common
// 行点击
const handleRowClick = (row) => {
  emit("rowClick", row);
};
//  多选
const handleSelectionChange = (row) => {
  emit("rowSelected", row);
};
// 切换每页大小
const handlePageSizeChange = (size) => {
  props.dataSource.pageSize = size;
  props.dataSource.pageNo = 1;
  props.fetch();
};
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  props.fetch();
};
//----------------------------------watch

//----------------------------------onMounted
// 初始化
const init = () => {
  if (props.initFetch && props.fetch) {
    props.fetch();
  }
};
init();
//================================================================emits
const emit = defineEmits(["rowSelected", "rowClick"]);

//================================================================expose
// 清除选中
const clearSelection = () => {
  dataTable.value.clearSelection();
};
//设置选中行
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] == rowValue;
  });
  dataTable.value.setCurrentRow(row);
};
// 将子组件暴露出去，否则父组件无法调用
defineExpose({
  setCurrentRow,
  clearSelection,
});
//================================================================request
</script>

<style lan="scss" scoped>
.pagination {
  padding-top: 10px;
  padding-right: 10px;
}
.el-pagination {
  justify-content: right;
}
:deep(el-table__cell) {
  padding: 4px 0px;
}
</style>
