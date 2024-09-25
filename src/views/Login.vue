<template>
  <div class="login-body">
    <div class="bg"></div>
    <div class="login-panel">
      <el-form
        class="login-register"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
        <div class="login-title">My 云盘</div>
        <!-- email -->
        <el-form-item prop="email">
          <el-input
            size="large"
            type="email"
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            maxlength="150"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password" v-if="optype == 1">
          <el-input
            size="large"
            type="password"
            placeholder="请输入密码"
            v-model.trim="formData.password"
            maxlength="150"
            show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--  注册 -->
        <div v-if="optype == 0 || optype == 2">
          <el-form-item prop="emailCode">
            <div class="send-email-panel">
              <el-input
                size="large"
                placeholder="请输入邮箱验证码"
                v-model.trim="formData.emailCode"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button
                class="send-mail-btn"
                type="primary"
                size="large"
                @click="getEmailCode"
              >
                获取验证码
              </el-button>
            </div>
          </el-form-item>
          <el-popover placement="left" :width="500" trigger="click">
            <div>
              <p>请查看您的邮箱消息</p>
            </div>
            <template #reference>
              <span class="a-link" :style="{ 'font-size': '14px' }">
                未收到验证码？
              </span>
            </template>
          </el-popover>
          <!-- 昵称 -->
          <el-form-item prop="nickName" v-if="optype == 0">
            <el-input
              size="large"
              placeholder="请输入昵称"
              v-model.trim="formData.nickName"
              maxlength="20"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>
          <!-- 注册密码，找回密码 -->
          <el-form-item prop="registerPassword">
            <el-input
              clearable
              placeholder="请输入密码"
              v-model.trim="formData.registerPassword"
              type="password"
              size="large"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input
              clearable
              placeholder="请再次输入密码"
              v-model.trim="formData.reRegisterPassword"
              type="password"
              size="large"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 验证码 -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
              @keyup.enter="doSubmit"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)" />
          </div>
        </el-form-item>
        <el-form-item v-if="optype == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe"> 记住我 </el-checkbox>
          </div>
          <div class="no-account">
            <a
              v-if="optype == 1"
              href="javascript:void(0)"
              class="a-link"
              @click="showPanel(2)"
            >
              忘记密码
            </a>
            <a
              v-if="optype != 1"
              href="javascript:void(0)"
              class="a-link"
              @click="showPanel(1)"
            >
              返回登录
            </a>
            <a
              v-if="optype == 1"
              href="javascript:void(0)"
              class="a-link"
              @click="showPanel(0)"
            >
              没有账号？
            </a>
          </div>
        </el-form-item>
        <!-- 登录 -->
        <el-form-item>
          <el-button type="primary" class="op-btn" size="large" @click="doSubmit">
            <span v-if="optype == 1">登录</span>
            <span v-if="optype == 0">注册</span>
            <span v-if="optype == 2">重置密码</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <Dialog
      :show="dialogConfig4SendMailCode.show"
      :title="dialogConfig4SendMailCode.title"
      :buttons="dialogConfig4SendMailCode.buttons"
      @close="closeSendMailCodeDialog"
      width="500px"
      :showCancel="false"
      @show="dialogConfig4SendMailCode.show = false"
    >
      <el-form
        :model="formData4SendMailCode"
        :rules="rules"
        ref="formData4SendMailCodeRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>
        <el-form-item label="验证码" prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              placeholder="请输入验证码"
              v-model.trim="formData4SendMailCode.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl4SendMailCode"
              class="check-code"
              @click="changeCheckCode(1)"
            />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
    <div class="footer">
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=13012502000079"
        rel="noreferrer"
        target="_blank"
        >冀公网安备13012502000079</a
      >
    </div>
    
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import md5 from "js-md5";
//================================================================globolVar
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
//----------------------------------declare
// 校验密码
const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
//================================================================api
const api = {
  checkCode: "/api/checkCode",
  sendEmailCode: "/sendEmailCode",
  register: "/register",
  login: "/login",
  resetPwd: "/resetPwd",
};
//================================================================props

//================================================================var
//----------------------------------common
const formDataRef = ref();
const formData = ref({});
const checkCodeUrl = ref(api.checkCode);
const checkCodeUrl4SendMailCode = ref(api.checkCode);
// 操作类型0注册 1登录 2重置密码
const optype = ref(1);
const formData4SendMailCodeRef = ref();
const formData4SendMailCode = ref({});
// 邮箱验证码弹窗
const dialogConfig4SendMailCode = reactive({
  show: false,
  title: "发送邮箱验证码",
  buttons: [
    {
      type: "primary",
      text: "发送",
      click: (e) => {
        sendEmailCode(e);
      },
    },
  ],
});
//----------------------------------rules
// 验证规则
const rules = {
  email: [
    {
      required: true,
      message: "请输入邮箱",
    },
    {
      validator: proxy.Verify.email,
      message: "邮箱格式错误",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      validator: proxy.Verify.password,
      message: "请输入数字,字母,-,_,且长度在8-32之间的密码",
    },
  ],
  emailCode: [
    {
      required: true,
      message: "请输入邮箱验证码",
    },
  ],
  nickName: [
    {
      required: true,
      message: "请输入昵称",
    },
  ],
  registerPassword: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      validator: proxy.Verify.password,
      message: "请输入数字,字母,-,_,且长度在8-32之间的密码",
    },
  ],
  reRegisterPassword: [
    {
      required: true,
      message: "请再次输入密码",
    },
    {
      validator: checkRePassword,
      message: "两次密码不一致",
    },
  ],
  checkCode: [
    {
      required: true,
      message: "请输入图片验证码",
    },
  ],
  checkCode1: [
    {
      required: true,
      message: "请输入图片验证码",
    },
  ],
};
//----------------------------------computed

//================================================================methods
//----------------------------------common
const showPanel = (type) => {
  optype.value = type;
  resetForm();
};

// 关闭发送邮箱验证码弹窗
const closeSendMailCodeDialog = () => {
  dialogConfig4SendMailCode.show = false;
  changeCheckCode(0);
};
// 获取邮箱验证码
const getEmailCode = () => {
  formDataRef.value.validateField("email", (valid) => {
    // console.log(valid);
    // console.log(dialogConfig4SendMailCode.show);
    if (!valid) {
      return;
    }
    dialogConfig4SendMailCode.show = true;
    nextTick(() => {
      changeCheckCode(1);
      formData4SendMailCodeRef.value.resetFields();
      formData4SendMailCode.value = {
        email: formData.value.email,
      };
    });
  });
};
// 重置表单
const resetForm = () => {
  changeCheckCode(0); // 刷新验证码
  formDataRef.value.resetFields();
  formData.value = {};
  //登录
  if (optype.value == 1) {
    const cookieLoginInfo = proxy.LocalStorage.get("loginInfo");
    if (cookieLoginInfo) {
      formData.value = cookieLoginInfo;
    }
  }
};
//----------------------------------watch

//----------------------------------onMounted
onMounted(() => {
  showPanel(1);
});
//================================================================emits

//================================================================expose

//================================================================request
// 刷新图片验证码
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  } else if (type == 1) {
    checkCodeUrl4SendMailCode.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  }
};
// 提交表单
const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = Object.assign({}, formData.value);
    // 注册 找回密码
    if (optype.value == 0 || optype.value == 2) {
      params.password = md5(params.registerPassword);
      delete params.registerPassword;
      delete params.reRegisterPassword;
    }
    // 登录
    if (optype.value == 1) {
      let cookieLoginInfo = proxy.LocalStorage.get("loginInfo");
      let cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password;
      if (params.password !== cookiePassword) {
        params.password = md5(params.password);
      }
    }

    let url = null;
    if (optype.value == 0) {
      url = api.register;
    } else if (optype.value == 1) {
      url = api.login;
    } else if (optype.value == 2) {
      url = api.resetPwd;
    }
    let res = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        // 出错后刷新验证码
        formData.value.checkCode = "";
        changeCheckCode(0);
      },
    });
    if (!res) {
      return;
    }
    // 注册返回
    if (optype.value == 0) {
      proxy.Message.success("注册成功,请重新登录");
      showPanel(1);
    } else if (optype.value == 1) {
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        };
        proxy.LocalStorage.set("loginInfo", loginInfo, 7 * 24 * 60 * 60);
      } else {
        proxy.LocalStorage.remove("loginInfo");
      }
      proxy.Message.success("登录成功");
      // 保存凭证信息
      sessionStorage.setItem("authorization", res);
      // 重定向到原始页面
      const redirectUrl = route.query.redirectUrl || "/";
      console.log(redirectUrl, route.query.redirectUrl);
      router.push(redirectUrl);
    } else if (optype.value == 2) {
      // 重置密码
      proxy.Message.success("密码重置成功");
      showPanel(1);
    }
  });
};
// 发送邮箱验证码
const sendEmailCode = (e) => {
  formData4SendMailCodeRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const params = Object.assign({}, formData4SendMailCode.value);
    params.type = 0;

    const res = await proxy.Request({
      url: api.sendEmailCode,
      params,
      errorCallback: () => {
        // 出错后刷新发送邮件验证码
        formData4SendMailCode.value.checkCode = "";
        changeCheckCode(1);
      },
    });
    if (!res) {
      return;
    }
    proxy.Message.success("验证码发送成功，请登录邮箱查看");
    dialogConfig4SendMailCode.show = false;
    // 成功更新登录注册的验证码
    changeCheckCode(0);
  });
};
</script>

<style lang="scss" scoped>
.login-body {
  height: calc(100vh);
  background: skyblue center center / cover no-repeat;
  background-size: 800px;
  display: flex;
  .footer {
    position: absolute;
    align-self: end;
    margin-bottom: 10px;
    margin-left: 50%;
    a {
      color: aliceblue;
      text-decoration: none;
    }
  }
  .bg {
    z-index:9;
    flex: 1;
    background: url("../assets/login-bg0.png");
    background-position: center;
    background-size: cover;
    background-size: 600px;
    background-repeat: no-repeat;
  }
  .login-panel {
    z-index:10;
    width: 430px;
    margin-right: 15%;
    align-self: center;
    .login-register {
      z-index: 10;
      background: linear-gradient(180deg, rgb(193, 221, 244) 0%, #ffffff 30.21%);
      padding: 25px;
      box-shadow: 0px 187px 75px rgba(0, 0, 0, 0.01), 0px 105px 63px rgba(0, 0, 0, 0.05),
        0px 47px 47px rgba(0, 0, 0, 0.09), 0px 12px 26px rgba(0, 0, 0, 0.1),
        0px 0px 0px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      .login-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .send-email-panel {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .send-mail-btn {
          margin-left: 5px;
        }
      }
      .rememberme-panel {
        width: 100%;
      }
      .no-account {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .op-btn {
        width: 100%;
      }
    }
  }
  .check-code-panel {
    width: 100%;
    display: flex;
    .check-code {
      height: 40px;
      margin-left: 5px;
      cursor: pointer;
    }
  }
  .login-btn-qq {
    margin-top: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      cursor: pointer;
      margin-left: 10px;
      width: 20px;
    }
  }
}
</style>
