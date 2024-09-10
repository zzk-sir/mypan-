import axios from 'axios'

import { ElLoading } from 'element-plus'
import router from '@/router'
import Message from '@/utils/Message'
import VueCookies from 'vue-cookies'
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = 'application/json'

const responseTypeJson = 'json'

let loading = null
const instance = axios.create({
    baseURL:'/api',
    timeout:30*1000
})
// 请求拦截器
instance.interceptors.request.use(
    (config)=>{
        // console.log(config)
        // 发送请求时的，一个遮罩
        if(config.showLoading){
            loading = ElLoading.service({
                lock: true,
                text: '加载中。。。。。。',
                background: 'rgba(0, 0, 0, 0.7)'
            })
        }
        return config
    },
    (error)=>{
        if(config.showLoading && loading){
            loading.close()
        }
        Message.error('请求发送失败')
        return Promise.reject('请求发送失败')
    }
)

// 响应拦截器
instance.interceptors.response.use(
    (response)=>{
        // console.log("拦截器",response)
        const {showLoading,errorCallback,showError=true,responseType} = response.config
        // 关闭遮罩
        if(showLoading && loading){
            loading.close()
        }
        const responseData = response.data
        if(responseType == 'arraybuffer' || responseType == 'blob'){
            // 如果时arraybuffer或blob，则直接返回
            return responseData
        }
        // 正常请求json
        // console.log("响应码",responseData.code)
        if(responseData.code == 200){
            return responseData.data
        }else if(responseData.code == 901||responseData.code == 401){
            // 登录超时
            router.push('/login?redirectUrl='+encodeURI(router.currentRoute.value.path))
            return Promise.reject({showError:true,msg:"请先登录"})
        }else{
            if(errorCallback){
                errorCallback(responseData.info)
            }
            return Promise.reject({showError:true,msg:responseData.errorMsg})
        }
    },({response})=>{
        const {showLoading,showError=true,responseType} = response.config
        // 关闭遮罩
        if(showLoading && loading){
            loading.close()
        }
        if(response.status == 901||response.status == 401){
            // 登录超时
            router.push('/login?redirectUrl='+encodeURI(router.currentRoute.value.path))
            return Promise.reject({showError:true,msg:"登录超时"})
        }else{
            return Promise.reject({showError:true,msg:response.statusText})
        }
    }
)
const request = (config)=>{
    // console.log("request",config)
    const {url,params,dataType,showLoading=true,responseType=responseTypeJson} = config
    let contentType = contentTypeForm
    let formData = new FormData() // 创建formData对象
    for(let key in params){
        formData.append(key,params[key]==undefined?'':params[key])
    }
    if(dataType!=null&&dataType == 'json'){
        contentType = contentTypeJson
    }
    let headers = {
        'Content-Type':contentType,
        'x-Requested-With':'XMLHttpRequest',
        'authorization':sessionStorage.getItem('authorization')
    }
    let res = instance.post(url,formData,{
            onUploadProgress:(event)=>{
                // 进度条
                if(config.onUploadProgressCallback){
                    config.onUploadProgressCallback(event)
                }
            },
            responseType:responseType,
            headers:headers,
            showLoading:showLoading,
            errorCallback:config.errorCallback,
            showError:config.showError
        }).catch(error=>{
            // console.log(error);
            
            if(error.showError){
                Message.error(error.msg)
                // config.errorCallback(error.msg)
            }else{
                // 关闭遮罩
                if(showLoading && loading){
                    loading.close()
                }
                Message.error('网络异常')
                // config.errorCallback('网络异常')
            }
            return null;
        })
    return res;
    
}
export default request