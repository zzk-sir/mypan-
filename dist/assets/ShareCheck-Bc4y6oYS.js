import{_ as V,u as N,a as D,r as d,m as M,b as n,o as q,c as B,d as e,f as r,t as i,w as u,k as j,j as A,E,g as K,x as T,y as L}from"./index-B4Kzr3cv.js";const I=c=>(T("data-v-a9e9f922"),c=c(),L(),c),O={class:"share"},P={class:"body-content"},U=I(()=>e("div",{class:"logo"},[e("span",{class:"iconfont icon-pan"}),e("span",{class:"name"},"My Pan")],-1)),$={class:"code-panel"},z={class:"file-info"},F={class:"avatar"},G={class:"share-info"},H={class:"user-info"},J={class:"nick-name"},Q={class:"share-time"},W={class:"file-name"},X={class:"code-body"},Y=I(()=>e("div",{class:"tips"},"请输入提取码",-1)),Z={class:"input-area"},ee={__name:"ShareCheck",setup(c){const{proxy:_}=A(),y=N(),h=D(),m={getShareInfo:"/showShare/getShareLoginInfo",checkShareCode:"/showShare/checkShareCode"},a=d({}),l=h.params.shareId.split(" ")[0],p=h.params.shareId.match(/提取码：(\S{5})/),s=d({}),f=d(),g={code:[{required:!0,message:"请输入提取码"},{min:5,message:"提取码为5位"},{max:5,message:"提取码为5位"}]};M(()=>{p!=null&&(s.value.code=p[1]),k()});const v=async()=>{f.value.validate(async o=>{!o||(Object.assign({},s.value),!await _.Request({url:m.checkShareCode,params:{shareId:l,code:s.value.code}}))||y.push(`/share/${l}`)})},k=async()=>{let o=await _.Request({url:m.getShareInfo,params:{shareId:l}});o&&(a.value=o)};return(o,t)=>{const S=n("Avatar"),w=n("el-input"),C=n("el-form-item"),b=n("el-button"),x=n("el-form");return q(),B("div",O,[e("div",P,[U,e("div",$,[e("div",z,[e("div",F,[r(S,{userId:a.value.userId,avatar:null,width:50},null,8,["userId"])]),e("div",G,[e("div",H,[e("span",J,i(a.value.nickName),1),e("span",Q,"分享于 "+i(a.value.shareTime),1)]),e("div",W,"分享文件："+i(a.value.fileName),1)])]),e("div",X,[Y,e("div",Z,[r(x,{model:s.value,rules:g,ref_key:"formDataRef",ref:f,onSubmit:t[1]||(t[1]=j(()=>{},["prevent"]))},{default:u(()=>[r(C,{prop:"code"},{default:u(()=>[r(w,{clearable:"",placeholder:"提取码",modelValue:s.value.code,"onUpdate:modelValue":t[0]||(t[0]=R=>s.value.code=R),modelModifiers:{trim:!0},onKeyup:E(v,["enter"])},null,8,["modelValue"])]),_:1}),r(b,{type:"primary",onClick:v},{default:u(()=>[K(" 提取文件 ")]),_:1})]),_:1},8,["model"])])])])])])}}},ae=V(ee,[["__scopeId","data-v-a9e9f922"]]);export{ae as default};