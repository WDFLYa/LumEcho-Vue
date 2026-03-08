<template>
  <div class="register-container">

    <!-- 返回主页 -->
    <div class="back-btn" @click="goHome">← Back</div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toastType">
        {{ toast }}
      </div>
    </transition>

    <!-- Logo -->
    <h1 class="logo">
      Lum<span>Echo!</span>
    </h1>

    <!-- 注册方式切换 -->
    <div class="tabs">
      <span :class="{active: mode==='account'}" @click="mode='account'">账号注册</span>
      <span :class="{active: mode==='phone'}" @click="mode='phone'">手机注册</span>
    </div>

    <!-- 切换动画 -->
    <transition name="fade-slide" mode="out-in">

      <!-- 账号注册 -->
      <div v-if="mode==='account'" key="account" class="form">

        <input
            type="text"
            placeholder="请输入账号"
            v-model="username"
            :class="{error: message}"
        />

        <input
            type="password"
            placeholder="请输入密码"
            v-model="password"
            :class="{error: message}"
        />

        <!-- 输入框错误提示 -->
        <p v-if="message" class="error-text">
          {{ message }}
        </p>

        <button class="register-btn" @click="handleAccountRegister">
          注册
        </button>

      </div>

      <!-- 手机注册 -->
      <div v-else key="phone" class="form">

        <input type="text" placeholder="请输入手机号" v-model="phone"/>

        <div class="code-box">
          <input type="text" placeholder="验证码" v-model="code"/>
          <button class="code-btn" @click="sendCode" :disabled="sending">{{ sending ? countdown + 's' : '发送验证码' }}</button>
        </div>

        <button class="register-btn" @click="handlePhoneRegister">
          注册
        </button>

      </div>

    </transition>

  </div>
</template>

<script>
import { registerByAccount, registerByPhone, sendCodeByPhone } from "@/api/auth";

export default {
  name: "RegisterPage",

  data() {
    return {
      mode: "account",
      username: "",
      password: "",
      phone: "",
      code: "",

      message: "",

      toast: "",
      toastType: "",

      sending: false,
      countdown: 0,
      timer: null
    };
  },

  methods: {



    goHome() {
      this.$router.push("/");
    },

    showToast(msg,type="success"){
      this.toast = msg;
      this.toastType = type;

      setTimeout(()=>{
        this.toast="";
      },2000)
    },



    async handleAccountRegister() {

      this.message="";

      try {

        const res = await registerByAccount({
          account:this.username,
          password:this.password
        });

        if(res.data.code === 200){

          this.showToast("注册成功，即将跳转登录","success");

          setTimeout(()=>{
            this.$router.push("/login")
          },1200)

        }else{

        const data = res.data;

        if(data.data){
          this.message = Object.values(data.data)[0];
        }else{
          this.message = data.message || "注册失败";
        }

        this.showToast(this.message,"error");

      }

      }catch(err){

        const data = err.response?.data;

        if(data){

          if(typeof data === "object"){
            this.message =
                data.data.account ||
                data.data.password ||
                data.message ||
                "注册失败";
          }
        }else{
          this.message="网络或服务器错误";
        }

        this.showToast(this.message,"error");
      }
    },

    async sendCode() {

      this.sending = true;

      try {
        const res = await sendCodeByPhone({ phone: this.phone });

        // 判断接口返回状态
        if (res.data.code === 200) {
          this.showToast("验证码已发送", "success");
          this.startCountdown(); // 成功才倒计时
        } else {
          // 接口返回非 200 错误
          const errMsg =
              Object.values(res.data.data || {})[0] || res.data.message || "发送失败";
          this.showToast(errMsg, "error");
          this.sending = false; // 失败立即可重新发送
        }

      } catch (err) {

        const data = err.response?.data;
        if(data){

          if(typeof data === "object"){
            this.message =
                data.data.phone ||
                data.message
          }

        }else{
          this.message="网络或服务器错误";
        }

        this.showToast(this.message,"error");
        this.sending = false; // 失败立即可重新发送
      }
    },

    // 倒计时方法
    startCountdown() {
      this.countdown = 60; // 秒数
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.sending = false; // 倒计时结束，按钮可点击
        }
      }, 1000);
    },

    async handlePhoneRegister() {
      if (!this.phone) {
        this.showToast("请输入手机号", "error");
        return;
      }
      if (!this.code) {
        this.showToast("请输入验证码", "error");
        return;
      }

      try {
        const res = await registerByPhone({
          phone: this.phone,
          code: this.code
        });

        // 判断接口返回
        if (res.data.code === 200) {
          this.showToast("注册成功，即将跳转登录", "success");
          setTimeout(() => {
            this.$router.push("/login");
          }, 1200);
        } else {
          // 接口返回非 200 错误
          const errMsg =
              Object.values(res.data.data || {})[0] ||
              res.data.message ||
              "注册失败";
          this.showToast(errMsg, "error");
        }

      } catch (err) {

        const data = err.response?.data;
        if(data){

          if(typeof data === "object"){
            this.message =
                data.data.phone ||
                data.data.code  ||
                data.message
          }

        }else{
          this.message="网络或服务器错误";
        }

        this.showToast(this.message,"error");
      }
    }

    }

  }

</script>

<style scoped>

/* 页面 */
.register-container{
  height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  background: radial-gradient(circle,#f7f7ff,#ffffff);
  position:relative;
}

/* 返回 */
.back-btn{
  position:absolute;
  top:30px;
  left:40px;
  cursor:pointer;
  color:#6c63ff;
  font-weight:600;
}

/* logo */
.logo{
  font-size:4rem;
  font-weight:800;
  margin-bottom:40px;
}
.logo span{
  color:#6c63ff;
}

/* tabs */
.tabs{
  display:flex;
  gap:40px;
  margin-bottom:30px;
}
.tabs span{
  cursor:pointer;
  font-size:18px;
}
.tabs .active{
  color:#6c63ff;
  border-bottom:3px solid #6c63ff;
}

/* 表单 */
.form{
  width:360px;
  display:flex;
  flex-direction:column;
  gap:18px;
}

/* 输入框 */
input{
  padding:14px 16px;
  border-radius:10px;
  border:1px solid #ddd;
  font-size:16px;
  transition:all .25s;
}

input:focus{
  border-color:#6c63ff;
  box-shadow:0 0 0 3px rgba(108,99,255,0.15);
  outline:none;
}

/* 输入错误 */
input.error{
  border-color:#ff4d4f;
  animation:shake .25s;
}

/* 错误文字 */
.error-text{
  font-size:14px;
  color:#ff4d4f;
  margin-top:-8px;
}

/* 抖动动画 */
@keyframes shake{
  0%{transform:translateX(0)}
  25%{transform:translateX(-4px)}
  50%{transform:translateX(4px)}
  75%{transform:translateX(-4px)}
  100%{transform:translateX(0)}
}

/* 验证码 */
.code-box{
  display:flex;
  gap:10px;
}

.code-btn {
  padding: 12px 16px;
  border: none;
  background: #6c63ff;
  color: white;
  border-radius: 8px;
  cursor: pointer;

  /* 新增 */
  min-width: 100px; /* 根据你的设计调整 */
  text-align: center; /* 保持文字居中 */
}

/* 注册按钮 */
.register-btn{
  margin-top:10px;
  padding:14px;
  border:none;
  border-radius:30px;
  background:linear-gradient(135deg,#ff7a18,#ffb347);
  color:white;
  font-size:16px;
  font-weight:600;
  cursor:pointer;
  transition:all .3s;
}

.register-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(255,122,24,.35);
}

/* toast */
.toast{
  position:fixed;
  top:80px;
  left:50%;
  transform:translateX(-50%);
  padding:12px 28px;
  border-radius:30px;
  font-size:14px;
  font-weight:600;
  box-shadow:0 6px 18px rgba(0,0,0,0.15);
}

.toast.success{
  background:#e8f8f0;
  color:#1c8f55;
}

.toast.error{
  background:#ffecec;
  color:#d93025;
}

/* toast动画 */
.toast-enter-active,
.toast-leave-active{
  transition:all .35s;
}

.toast-enter-from{
  opacity:0;
  transform:translate(-50%,-20px);
}

.toast-leave-to{
  opacity:0;
}

/* 页面切换 */
.fade-slide-enter-active,
.fade-slide-leave-active{
  transition:all .35s;
}

.fade-slide-enter-from{
  opacity:0;
  transform:translateY(20px);
}

.fade-slide-leave-to{
  opacity:0;
  transform:translateY(-20px);
}

</style>