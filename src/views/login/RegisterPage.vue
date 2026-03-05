<template>
  <div class="register-container">

    <!-- 返回主页 -->
    <div class="back-btn" @click="goHome">← Back</div>

    <!-- Logo -->
    <h1 class="logo">
      Lum<span>Echo!</span>
    </h1>

    <!-- 注册方式切换 -->
    <div class="tabs">
      <span :class="{active: mode==='account'}" @click="mode='account'">账号注册</span>
      <span :class="{active: mode==='phone'}" @click="mode='phone'">手机注册</span>
    </div>

    <!-- 提示信息 -->
    <div v-if="message" class="message-box" :class="messageType">{{ message }}</div>

    <!-- 切换动画 -->
    <transition name="fade-slide" mode="out-in">

      <!-- 账号注册 -->
      <div v-if="mode==='account'" key="account" class="form">
        <input type="text" placeholder="请输入账号" v-model="username"/>
        <input type="password" placeholder="请输入密码" v-model="password"/>
        <button class="register-btn" @click="handleAccountRegister">注册</button>
      </div>

      <!-- 手机注册 -->
      <div v-else key="phone" class="form">
        <input type="text" placeholder="请输入手机号" v-model="phone"/>
        <div class="code-box">
          <input type="text" placeholder="验证码" v-model="code"/>
          <button class="code-btn" @click="sendCode">发送验证码</button>
        </div>
        <button class="register-btn">注册</button>
      </div>

    </transition>

  </div>
</template>

<script>
import { registerByAccount } from "@/api/auth";

export default {
  name: "RegisterPage",

  data() {
    return {
      mode: "account",
      username: "",
      password: "",
      phone: "",
      code: "",
      message: "",        // 提示信息
      messageType: ""     // success / error
    };
  },

  methods: {
    goHome() {
      this.$router.push("/");
    },

    // 账号注册
    async handleAccountRegister() {
      this.message = "";
      try {
        const res = await registerByAccount({
          account: this.username,
          password: this.password
        });

        // 假设后端返回 { code: 200, message: '注册成功' }
        if(res.data.code === 200){
          this.message = "注册成功！即将跳转登录页...";
          this.messageType = "success";
          setTimeout(() => this.$router.push("/login"), 1200);
        } else {
          // 后端业务错误，比如账号已存在
          this.message = res.data.message || "注册失败";
          this.messageType = "error";
        }

      } catch(err) {
        // 校验异常或网络错误
        const data = err.response?.data;
        if(data){
          // DTO校验错误，可能返回字段级别
          if(typeof data === "object"){
            this.message = data.account || data.password || data.message || "注册失败";
          } else {
            this.message = data.message || "注册失败";
          }
        } else {
          this.message = "注册失败，网络或服务器错误";
        }
        this.messageType = "error";
      }
    },

    // TODO: 手机验证码逻辑
    sendCode() {
      alert("这里可以调用发送验证码接口");
    }
  }
}
</script>

<style scoped>
/* 页面背景 */
.register-container{
  height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  background: radial-gradient(circle at center,#f5f5ff,#ffffff);
  animation: fadePage 0.8s ease;
  position: relative;
}

/* 页面动画 */
@keyframes fadePage{
  from{opacity:0; transform: translateY(20px);}
  to{opacity:1; transform: translateY(0);}
}

/* 返回按钮 */
.back-btn{
  position:absolute;
  top:30px;
  left:40px;
  font-weight:600;
  color:#6c63ff;
  cursor:pointer;
  transition:0.25s;
}
.back-btn:hover{transform: translateX(-4px);}

/* Logo */
.logo{
  font-size: clamp(3.5rem,8vw,5rem);
  font-weight:800;
  margin-bottom:40px;
}
.logo span{color:#6c63ff;}

/* Tabs */
.tabs{
  display:flex;
  gap:50px;
  margin-bottom:20px;
}
.tabs span{
  font-size:18px;
  cursor:pointer;
  padding-bottom:6px;
  transition:0.25s;
}
.tabs span:hover{color:#6c63ff;}
.tabs .active{
  color:#6c63ff;
  border-bottom:3px solid #6c63ff;
}

/* 消息提示框 */
.message-box{
  margin-bottom:20px;
  padding:10px 20px;
  border-radius:12px;
  font-weight:600;
  width:360px;
  text-align:center;
}
.message-box.success{background:#d4edda; color:#155724;}
.message-box.error{background:#f8d7da; color:#721c24;}

/* 表单 */
.form{
  width:360px;
  display:flex;
  flex-direction:column;
  gap:20px;
}

/* 输入框 */
input{
  padding:14px 16px;
  border-radius:10px;
  border:1px solid #ddd;
  font-size:16px;
  outline:none;
  transition: all 0.25s ease;
}
input:focus{
  border-color:#6c63ff;
  box-shadow:0 0 0 3px rgba(108,99,255,0.15);
}

/* 验证码区域 */
.code-box{
  display:flex;
  gap:10px;
}
.code-btn{
  padding:12px 16px;
  border:none;
  background:#6c63ff;
  color:white;
  border-radius:8px;
  cursor:pointer;
  transition:0.25s;
}
.code-btn:hover{background:#574fff;}

/* 注册按钮 */
.register-btn{
  margin-top:10px;
  padding:14px;
  border:none;
  border-radius:30px;
  background:linear-gradient(135deg,#ff7a18,#ffb347);
  color:white;
  font-weight:600;
  font-size:16px;
  cursor:pointer;
  transition: all 0.3s ease;
}
.register-btn:hover{
  transform: translateY(-3px) scale(1.03);
  box-shadow:0 8px 25px rgba(255,122,24,0.35);
}

/* 切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active{transition: all 0.35s ease;}
.fade-slide-enter-from{opacity:0; transform: translateY(20px);}
.fade-slide-leave-to{opacity:0; transform: translateY(-20px);}

/* 手机适配 */
@media (max-width:768px){
  .form{width:80%;}
  .tabs{gap:30px;}
  .logo{font-size: clamp(3rem,12vw,4rem);}
  .message-box{width:80%;}
}
</style>