import{_ as A,r as h,h as G,l as H,c as _,d as t,f as a,w as o,k as L,j as J,b as w,o as m,i as S,e as p,g as P,D as Q,t as W,v as X,x as Y,u as Z,a as ee,n as oe}from"./index-CWrL55Oj.js";import{m as N}from"./md5-BLj29XsB.js";const c=V=>(X("data-v-cb4796c2"),V=V(),Y(),V),se={class:"login-body"},le=c(()=>t("div",{class:"bg"},null,-1)),ae={class:"login-panel"},te=c(()=>t("div",{class:"login-title"},"My 云盘",-1)),re=c(()=>t("span",{class:"iconfont icon-account"},null,-1)),ie=c(()=>t("span",{class:"iconfont icon-password"},null,-1)),ne={key:1},de={class:"send-email-panel"},ue=c(()=>t("span",{class:"iconfont icon-checkcode"},null,-1)),ce=c(()=>t("div",null,[t("p",null,"请查看您的邮箱消息")],-1)),me=c(()=>t("span",{class:"a-link",style:{"font-size":"14px"}}," 未收到验证码？ ",-1)),pe=c(()=>t("span",{class:"iconfont icon-account"},null,-1)),fe=c(()=>t("span",{class:"iconfont icon-password"},null,-1)),ve=c(()=>t("span",{class:"iconfont icon-password"},null,-1)),ge={class:"check-code-panel"},_e=c(()=>t("span",{class:"iconfont icon-checkcode"},null,-1)),ke=["src"],he={class:"rememberme-panel"},we={class:"no-account"},Ce={key:0},ye={key:1},be={key:2},Ve={class:"check-code-panel"},Me=c(()=>t("span",{class:"iconfont icon-checkcode"},null,-1)),xe=["src"],Se=c(()=>t("div",{class:"footer"},[t("a",{href:"https://beian.mps.gov.cn/#/query/webSearch?code=13012502000079",rel:"noreferrer",target:"_blank"},"冀公网安备13012502000079")],-1)),Pe={__name:"Login",setup(V){const E=Z(),R=ee(),{proxy:u}=J(),j=(n,e,i)=>{e!==s.value.registerPassword?i(new Error(n.message)):i()},f={checkCode:"/api/checkCode",sendEmailCode:"/sendEmailCode",register:"/register",login:"/login",resetPwd:"/resetPwd"},M=h(),s=h({}),U=h(f.checkCode),q=h(f.checkCode),r=h(1),x=h(),C=h({}),k=G({show:!1,title:"发送邮箱验证码",buttons:[{type:"primary",text:"发送",click:n=>{T()}}]}),D={email:[{required:!0,message:"请输入邮箱"},{validator:u.Verify.email,message:"邮箱格式错误"}],password:[{required:!0,message:"请输入密码"},{validator:u.Verify.password,message:"请输入数字,字母,-,_,且长度在8-32之间的密码"}],emailCode:[{required:!0,message:"请输入邮箱验证码"}],nickName:[{required:!0,message:"请输入昵称"}],registerPassword:[{required:!0,message:"请输入密码"},{validator:u.Verify.password,message:"请输入数字,字母,-,_,且长度在8-32之间的密码"}],reRegisterPassword:[{required:!0,message:"请再次输入密码"},{validator:j,message:"两次密码不一致"}],checkCode:[{required:!0,message:"请输入图片验证码"}],checkCode1:[{required:!0,message:"请输入图片验证码"}]},y=n=>{r.value=n,F()},$=()=>{k.show=!1,v(0)},B=()=>{M.value.validateField("email",n=>{n&&(k.show=!0,oe(()=>{v(1),x.value.resetFields(),C.value={email:s.value.email}}))})},F=()=>{if(v(0),M.value.resetFields(),s.value={},r.value==1){const n=u.LocalStorage.get("loginInfo");n&&(s.value=n)}};H(()=>{y(1)});const v=n=>{n==0?U.value=f.checkCode+"?type="+n+"&time="+new Date().getTime():n==1&&(q.value=f.checkCode+"?type="+n+"&time="+new Date().getTime())},I=()=>{M.value.validate(async n=>{if(!n)return;let e=Object.assign({},s.value);if((r.value==0||r.value==2)&&(e.password=N(e.registerPassword),delete e.registerPassword,delete e.reRegisterPassword),r.value==1){let g=u.LocalStorage.get("loginInfo"),b=g==null?null:g.password;e.password!==b&&(e.password=N(e.password))}let i=null;r.value==0?i=f.register:r.value==1?i=f.login:r.value==2&&(i=f.resetPwd);let d=await u.Request({url:i,params:e,errorCallback:()=>{s.value.checkCode="",v(0)}});if(d)if(r.value==0)u.Message.success("注册成功,请重新登录"),y(1);else if(r.value==1){if(e.rememberMe){const b={email:e.email,password:e.password,rememberMe:e.rememberMe};u.LocalStorage.set("loginInfo",b,7*24*60*60)}else u.LocalStorage.remove("loginInfo");u.Message.success("登录成功"),sessionStorage.setItem("authorization",d);const g=R.query.redirectUrl||"/";console.log(g,R.query.redirectUrl),E.push(g)}else r.value==2&&(u.Message.success("密码重置成功"),y(1))})},T=n=>{x.value.validate(async e=>{if(!e)return;const i=Object.assign({},C.value);i.type=0,await u.Request({url:f.sendEmailCode,params:i,errorCallback:()=>{C.value.checkCode="",v(1)}})&&(u.Message.success("验证码发送成功，请登录邮箱查看"),k.show=!1,v(0))})};return(n,e)=>{const i=w("el-input"),d=w("el-form-item"),g=w("el-button"),b=w("el-popover"),K=w("el-checkbox"),z=w("el-form"),O=w("Dialog");return m(),_("div",se,[le,t("div",ae,[a(z,{class:"login-register",model:s.value,rules:D,ref_key:"formDataRef",ref:M,onSubmit:e[12]||(e[12]=L(()=>{},["prevent"]))},{default:o(()=>[te,a(d,{prop:"email"},{default:o(()=>[a(i,{size:"large",type:"email",placeholder:"请输入邮箱",modelValue:s.value.email,"onUpdate:modelValue":e[0]||(e[0]=l=>s.value.email=l),modelModifiers:{trim:!0},maxlength:"150"},{prefix:o(()=>[re]),_:1},8,["modelValue"])]),_:1}),r.value==1?(m(),S(d,{key:0,prop:"password"},{default:o(()=>[a(i,{size:"large",type:"password",placeholder:"请输入密码",modelValue:s.value.password,"onUpdate:modelValue":e[1]||(e[1]=l=>s.value.password=l),modelModifiers:{trim:!0},maxlength:"150","show-password":""},{prefix:o(()=>[ie]),_:1},8,["modelValue"])]),_:1})):p("",!0),r.value==0||r.value==2?(m(),_("div",ne,[a(d,{prop:"emailCode"},{default:o(()=>[t("div",de,[a(i,{size:"large",placeholder:"请输入邮箱验证码",modelValue:s.value.emailCode,"onUpdate:modelValue":e[2]||(e[2]=l=>s.value.emailCode=l),modelModifiers:{trim:!0}},{prefix:o(()=>[ue]),_:1},8,["modelValue"]),a(g,{class:"send-mail-btn",type:"primary",size:"large",onClick:B},{default:o(()=>[P(" 获取验证码 ")]),_:1})])]),_:1}),a(b,{placement:"left",width:500,trigger:"click"},{reference:o(()=>[me]),default:o(()=>[ce]),_:1}),r.value==0?(m(),S(d,{key:0,prop:"nickName"},{default:o(()=>[a(i,{size:"large",placeholder:"请输入昵称",modelValue:s.value.nickName,"onUpdate:modelValue":e[3]||(e[3]=l=>s.value.nickName=l),modelModifiers:{trim:!0},maxlength:"20"},{prefix:o(()=>[pe]),_:1},8,["modelValue"])]),_:1})):p("",!0),a(d,{prop:"registerPassword"},{default:o(()=>[a(i,{clearable:"",placeholder:"请输入密码",modelValue:s.value.registerPassword,"onUpdate:modelValue":e[4]||(e[4]=l=>s.value.registerPassword=l),modelModifiers:{trim:!0},type:"password",size:"large"},{prefix:o(()=>[fe]),_:1},8,["modelValue"])]),_:1}),a(d,{prop:"reRegisterPassword"},{default:o(()=>[a(i,{clearable:"",placeholder:"请再次输入密码",modelValue:s.value.reRegisterPassword,"onUpdate:modelValue":e[5]||(e[5]=l=>s.value.reRegisterPassword=l),modelModifiers:{trim:!0},type:"password",size:"large"},{prefix:o(()=>[ve]),_:1},8,["modelValue"])]),_:1})])):p("",!0),a(d,{prop:"checkCode"},{default:o(()=>[t("div",ge,[a(i,{size:"large",placeholder:"请输入验证码",modelValue:s.value.checkCode,"onUpdate:modelValue":e[6]||(e[6]=l=>s.value.checkCode=l),modelModifiers:{trim:!0},onKeyup:Q(I,["enter"])},{prefix:o(()=>[_e]),_:1},8,["modelValue"]),t("img",{src:U.value,class:"check-code",onClick:e[7]||(e[7]=l=>v(0))},null,8,ke)])]),_:1}),r.value==1?(m(),S(d,{key:2},{default:o(()=>[t("div",he,[a(K,{modelValue:s.value.rememberMe,"onUpdate:modelValue":e[8]||(e[8]=l=>s.value.rememberMe=l)},{default:o(()=>[P(" 记住我 ")]),_:1},8,["modelValue"])]),t("div",we,[r.value==1?(m(),_("a",{key:0,href:"javascript:void(0)",class:"a-link",onClick:e[9]||(e[9]=l=>y(2))}," 忘记密码 ")):p("",!0),r.value!=1?(m(),_("a",{key:1,href:"javascript:void(0)",class:"a-link",onClick:e[10]||(e[10]=l=>y(1))}," 返回登录 ")):p("",!0),r.value==1?(m(),_("a",{key:2,href:"javascript:void(0)",class:"a-link",onClick:e[11]||(e[11]=l=>y(0))}," 没有账号？ ")):p("",!0)])]),_:1})):p("",!0),a(d,null,{default:o(()=>[a(g,{type:"primary",class:"op-btn",size:"large",onClick:I},{default:o(()=>[r.value==1?(m(),_("span",Ce,"登录")):p("",!0),r.value==0?(m(),_("span",ye,"注册")):p("",!0),r.value==2?(m(),_("span",be,"重置密码")):p("",!0)]),_:1})]),_:1})]),_:1},8,["model"])]),a(O,{show:k.show,title:k.title,buttons:k.buttons,onClose:$,width:"500px",showCancel:!1,onShow:e[16]||(e[16]=l=>k.show=!1)},{default:o(()=>[a(z,{model:C.value,rules:D,ref_key:"formData4SendMailCodeRef",ref:x,"label-width":"80px",onSubmit:e[15]||(e[15]=L(()=>{},["prevent"]))},{default:o(()=>[a(d,{label:"邮箱"},{default:o(()=>[P(W(s.value.email),1)]),_:1}),a(d,{label:"验证码",prop:"checkCode"},{default:o(()=>[t("div",Ve,[a(i,{size:"large",placeholder:"请输入验证码",modelValue:C.value.checkCode,"onUpdate:modelValue":e[13]||(e[13]=l=>C.value.checkCode=l),modelModifiers:{trim:!0}},{prefix:o(()=>[Me]),_:1},8,["modelValue"]),t("img",{src:q.value,class:"check-code",onClick:e[14]||(e[14]=l=>v(1))},null,8,xe)])]),_:1})]),_:1},8,["model"])]),_:1},8,["show","title","buttons"]),Se])}}},qe=A(Pe,[["__scopeId","data-v-cb4796c2"]]);export{qe as default};