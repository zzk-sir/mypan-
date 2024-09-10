<template>
  <div>
    <div class="top-panel">
      <el-form
        label-width="80px"
        @submit.prevent
      >
        <el-row>
          <el-col :span="8">
            <!-- 输入 -->
            <el-form-item label="用户昵称">
              <el-input
                clearable
                placeholder="支持模糊搜索"
                v-model.trim="searchFormData.nickNameFuzzy"
                @keyup.enter="loadDataList"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!-- 下拉框 -->
            <el-form-item label="状态">
              <el-select
                clearable
                placeholder="请选择状态"
                v-model="searchFormData.status"
              >
                <el-option :value="0" label="启用" />
                <el-option :value="1" label="禁用" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" :style="{'margin-left':'20px'}" @click="loadDataList">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="file-list">
      <Table
        ref="dataTableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :initFetch="true"
        :options="tableOptions"
      >
        <template #avatar="{ index, row }">
          <div class="avatar">
            <Avatar :userId="row.userId" :avatar="null" :timestamp="timestamp"></Avatar>
          </div>
        </template>
        <template #space="{ index, row }">
        <div>
          <span style="color:#52f;">{{proxy.Utils.size2Str(row.useSpace)}}</span>
           / 
           <span style="color: #333;">{{ proxy.Utils.size2Str(row.totalSpace)}}</span>
        </div>
        </template>
        <template #status="{index,row}">
            <div v-if="row.status==0" class="use use-notuse">已启用</div>
            <div v-if="row.status==1" class="notuse use-notuse">已禁用</div>
        </template>
        <template #op="{index,row}">
            <span class="a-link" @click="updateSpace(row)">分配空间
            </span>
            <el-divider direction="vertical"></el-divider>
            <span v-if="!row.isAdmin" class="a-link" @click="updateUserStatus(row)" :style="row.status==0?{color:'#f56c62'}:{color:'#529b2e'}">{{row.status==1?"启用":"禁用"}}</span>
        </template>
      </Table>
    </div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show=false">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
      <el-form-item label="昵称">
        {{formData.nickName}}
      </el-form-item>
      <el-form-item label="添加空间大小" prop="changeSpace">
        <el-input
          clearable
          placeholder="请输入空间大小"
          v-model.trim="formData.changeSpace">
        <template #suffix>MB</template>
        </el-input>
      </el-form-item>
    </el-form>
    </Dialog>
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
    loadDataList:"/admin/loadUserList",
    updateUserStatus:"/admin/updateUserStatus",
    updateUserSpace:"/admin/updateUserSpace"
}
//================================================================props

//================================================================var
//----------------------------------common
const columns = [
    {
        label:"头像",
        prop:"avatar",
        width:60,
        scopedSlots:"avatar"
    },
    {
        label:"昵称",
        prop:"nickName",
    },
    {
        label:"邮箱",
        prop:"email",
    },
    {
        label:"空间使用",
        prop:"space",
        scopedSlots:"space",
    },
    {
        label:"加入时间",
        prop:"createTime",
    },
    {
        label:"最后登录时间",
        prop:"lastLoginTime",
    },
    {
        label:"状态",
        prop:"status",
        scopedSlots:"status",
        width:80,
    },
    {
        label:"操作",
        prop:"op",
        width:200,
        scopedSlots:"op"
    },
]
const searchFormData = ref({})
const tableData = ref({})
const tableOptions = {
    extHeight:20
}
const timestamp = ref(0)
const formData = ref({})
const formDataRef = ref();
const dialogConfig = ref({
  show:false,
  title:"修改空间大小",
  buttons:[
    {
      type:"primary",
      text:"确定",
      click:(e)=>{
        submitForm();
      }
    }
  ]
})

//----------------------------------rules
const rules = {
  changeSpace:[
    {required:true,message:"请输入空间大小"},
    {
      validator: proxy.Verify.space,
      message: "请输入数字",
    }]
}
//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted

//================================================================emits

//================================================================expose

//================================================================request
const loadDataList = async ()=>{
    let params = {
        pageNo:tableData.value.pageNo || 1,
        pageSize:tableData.value.pageSize || 15,
    }
    Object.assign(params,searchFormData.value)
    let result = await proxy.Request({
        url:api.loadDataList,
        params
    })
    if(!result){
        return
    }
    timestamp.value = +new Date()
    tableData.value = result
}
// 修改状态
const updateUserStatus = (row)=>{
  proxy.Confirm(`你确定要${row.status==1?"启用":"禁用"} ${row.nickName} 吗`,async()=>{
    let result = await proxy.Request({
      url:api.updateUserStatus,
      params:{
        userId:row.userId,
        status:row.status==0?1:0,
      }
    })
    if(!result){
      return
    }
    loadDataList()
  })
}
const updateSpace = (data)=>{
  dialogConfig.value.show = true
  nextTick(()=>{
    formDataRef.value.resetFields()
    formData.value = Object.assign({},data)
  })
}

const submitForm = ()=>{
  formDataRef.value.validate(async (valid)=>{
    console.log(formData.value)
    if(!valid){
      return;
    }
    let result = await proxy.Request({
      url:api.updateUserSpace,
      params:{
        userId:formData.value.userId,
        changeSpace:formData.value.changeSpace*1024*1024
      }
    })
    if(!result){
      return
    }
    dialogConfig.value.show = false;
    proxy.Message.success("操作成功")
    loadDataList();
  })
}
</script>

<style lang="scss" scoped>
.top-panel {
  margin-top: 10px;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  overflow: hidden;
}

.use-notuse{
  color:whitesmoke;
  width: max-content;
  padding: 3px 5px;
  border-radius: 15px;
}

.use{
  background-color: #71cb44;
  box-shadow: 2px 2px 2px #bbc;
}
.notuse{
  background-color: #f66055;
  box-shadow: 2px 2px 2px #bbc;
}
</style>
