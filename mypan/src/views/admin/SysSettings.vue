<template>
    <div>
        <div class="sys-setting-panel">
        <el-form
            :model="formData"
            :rule="rules"
            ref="formDataRef"
            label-width="140px"
            @submit.pervent>
        <el-form-item label="注册邮箱验证标题" prop="registerEmailTitle">
            <el-input
                clearable
                placeholder="请输入注册邮件验证码邮件标题"
                v-model.trim="formData.registerEmailTitle">
            </el-input>
        </el-form-item>
        <el-form-item label="注册邮箱内容" prop="registerEmailContent">
            <el-input
                type="textarea"
                :autosize="{'minRows': 4}"
                clearable
                placeholder="请输入注册邮件验证码邮箱内容"
                v-model.trim="formData.registerEmailContent">
            </el-input>
        </el-form-item>
        <el-form-item label="初始空间大小" prop="useInitUseSpace">
            <el-input
                clearable
                placeholder="初始化空间大小"
                v-model.trim="formData.userInitTotalSpace">
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="saveSettings">保存</el-button>
        </el-form-item>
        </el-form>
        </div>
    </div>
</template>
<script setup>
import {ref,reactive,getCurrentInstance,nextTick,watch,computed,onMounted} from 'vue'
import {useRouter,useRoute} from 'vue-router'
//================================================================globolVar
//----------------------------------common
const {proxy} = getCurrentInstance()
//----------------------------------declare
//================================================================api
const api = {
    getSysSettings:"/admin/getSysSettings",
    saveSettings:"/admin/saveSettings"
}
//================================================================props

//================================================================var
//----------------------------------common
const formData = ref({})
const formDataRef = ref()
//----------------------------------rules
const rules = {
    registerEmailTitle:[{required:true,message:"请输入注册邮箱验证码邮件标题"}],
    registerEmailContent:[{required:true,message:"请输入注册邮箱验证码邮件内容"}],
    userInitTotalSpace:[{required:true,message:"请输入初始化空间大小"},
        {
            validator:proxy.Verify.space,
            message:"请输入数字"
        }
    ]
}
//----------------------------------computed

//================================================================methods
//----------------------------------common

//----------------------------------watch

//----------------------------------onMounted
onMounted(()=>{
    getSysSettings()
})
//================================================================emits

//================================================================expose

//================================================================request
// 获取系统设置
const getSysSettings = async () =>{
    console.log(api.getSysSettings)
    let result = await proxy.Request({
        url:api.getSysSettings
    })
    if(!result){
        return
    }
    formData.value = result
}
// 保存系统设置
const saveSettings = async()=>{
    formDataRef.value.validate(async (valid)=>{
        if(!valid){
            return
        }
        let params = {}
        Object.assign(params,formData.value);
        let result = await proxy.Request({
            url:api.saveSettings,
            params
        })
        if(!result){
            return;
        }
        proxy.Message.success("保存成功")
    })
}
</script>

<style lang="scss" scoped>
.sys-setting-panel{
    margin-top:20px;
    width:600px;
}
</style>