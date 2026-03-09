<template>
  <div class="register-container">

    <!-- 返回主页 -->
    <div class="back-btn" @click="goHome">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back
    </div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toastType">
        {{ toast }}
      </div>
    </transition>

    <!-- Logo (动态渐变) -->
    <h1 class="logo" :style="logoStyle">
      Lum<span>Echo!</span>
    </h1>

    <!-- 注册卡片 -->
    <div class="register-card">

      <!-- 注册方式切换 -->
      <div class="tabs">
        <span :class="{active: mode==='account'}" @click="mode='account'">账号注册</span>
        <span :class="{active: mode==='phone'}" @click="mode='phone'">手机注册</span>
        <div class="tab-line" :style="{left: mode==='account' ? '0' : '100%', transform: mode==='account' ? 'translateX(0)' : 'translateX(-100%)'}"></div>
      </div>

      <!-- 切换动画 -->
      <transition name="fade-slide" mode="out-in">

        <!-- 账号注册 -->
        <div v-if="mode==='account'" key="account" class="form">

          <div class="input-group">
            <input type="text" placeholder=" " v-model="username" :class="{error: message}" />
            <label>请输入账号</label>
          </div>

          <div class="input-group">
            <input type="password" placeholder=" " v-model="password" :class="{error: message}" />
            <label>请输入密码</label>
          </div>

          <!-- 输入框错误提示 -->
          <p v-if="message" class="error-text">
            {{ message }}
          </p>

          <button class="register-btn" @click="handleAccountRegister">
            注 册
          </button>

        </div>

        <!-- 手机注册 -->
        <div v-else key="phone" class="form">

          <div class="input-group">
            <input type="text" placeholder=" " v-model="phone"/>
            <label>请输入手机号</label>
          </div>

          <div class="code-box">
            <div class="input-group" style="flex:1">
              <input type="text" placeholder=" " v-model="code"/>
              <label>验证码</label>
            </div>
            <button class="code-btn" @click="sendCode" :disabled="sending">
              {{ sending ? countdown + 's' : '获取' }}
            </button>
          </div>

          <button class="register-btn" @click="handlePhoneRegister">
            注 册
          </button>

        </div>

      </transition>

    </div>

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
      timer: null,

      logoGradient: ""
    };
  },

  computed: {
    logoStyle() {
      return {
        background: this.logoGradient || 'linear-gradient(135deg, #6c63ff, #8b86ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 4px 6px rgba(108, 99, 255, 0.2))'
      }
    }
  },

  mounted() {
    this.randomizeLogoColor();
  },

  methods: {
    randomizeLogoColor() {
      const colors = [
        'linear-gradient(135deg, #6c63ff, #4facfe)',
        'linear-gradient(135deg, #ff9a9e, #fad0c4)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        'linear-gradient(135deg, #84fab0, #8fd3f4)',
        'linear-gradient(135deg, #fccb90, #d57eeb)'
      ];
      this.logoGradient = colors[Math.floor(Math.random() * colors.length)];
    },

    goHome() {
      this.$router.push("/");
    },

    showToast(msg, type="success"){
      this.toast = msg;
      this.toastType = type;
      setTimeout(()=>{
        this.toast="";
      }, 2000)
    },

    async handleAccountRegister() {
      this.message="";
      try {
        const res = await registerByAccount({
          account: this.username,
          password: this.password
        });

        if(res.data.code === 200){
          this.showToast("注册成功，即将跳转登录", "success");
          setTimeout(()=>{
            this.$router.push("/login")
          }, 1200)
        }else{
          const data = res.data;
          if(data.data){
            this.message = Object.values(data.data)[0];
          }else{
            this.message = data.message || "注册失败";
          }
          this.showToast(this.message, "error");
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
        this.showToast(this.message, "error");
      }
    },

    async sendCode() {
      this.sending = true;
      try {
        const res = await sendCodeByPhone({ phone: this.phone });

        if (res.data.code === 200) {
          this.showToast("验证码已发送", "success");
          this.startCountdown();
        } else {
          const errMsg =
              Object.values(res.data.data || {})[0] || res.data.message || "发送失败";
          this.showToast(errMsg, "error");
          this.sending = false;
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
        this.showToast(this.message, "error");
        this.sending = false;
      }
    },

    startCountdown() {
      this.countdown = 60;
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.sending = false;
        }
      }, 1000);
    },

    async handlePhoneRegister() {
      try {
        const res = await registerByPhone({
          phone: this.phone,
          code: this.code
        });

        if (res.data.code === 200) {
          this.showToast("注册成功，即将跳转登录", "success");
          setTimeout(() => {
            this.$router.push("/login");
          }, 1200);
        } else {
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
        this.showToast(this.message, "error");
      }
    }
  }
}
</script>

<style scoped>

/* 全局变量 */
.register-container {
  --primary-color: #6c63ff;
  --primary-light: #f0efff;
  --text-dark: #333;
  --text-gray: #999;
  --border-color: #e0e0e0;

  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 10%, #f8f9ff 0%, #ffffff 100%);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
}

/* 背景装饰圆圈，增加层次感 */
.register-container::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.03) 0%, transparent 70%);
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  pointer-events: none;
}

.back-btn {
  position: absolute;
  top: 40px;
  left: 40px;
  color: var(--text-gray);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  z-index: 10;
}

.back-btn:hover {
  color: var(--primary-color);
  transform: translateX(-5px);
}

/* Logo 样式优化 */
.logo {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 40px;
  letter-spacing: -2px;
  z-index: 1;
  transition: filter 0.5s ease;
}

.logo span {
  font-style: italic;
}

/* 注册卡片 - 极简白 */
.register-card {
  width: 400px;
  padding: 50px 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* 多层阴影，营造悬浮感 */
  box-shadow:
      0 20px 40px -10px rgba(108, 99, 255, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.5);

  z-index: 10;
  position: relative;
}

/* Tabs 切换优化 - 横线样式 */
.tabs {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  position: relative;
}

.tabs span {
  flex: 1;
  text-align: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-gray);
  transition: color 0.3s;
  z-index: 2;
}

.tabs .active {
  color: var(--text-dark);
}

/* 底部滑动线条 */
.tab-line {
  position: absolute;
  bottom: -8px;
  width: 50%;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  transform: translateX(0);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 输入框组 - Floating Label 核心 */
.input-group {
  position: relative;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 16px 16px 16px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: #fafafa;
  font-size: 15px;
  color: var(--text-dark);
  transition: all 0.3s;
  box-sizing: border-box;
}

/* 关键：输入框聚焦 或 有内容时 (placeholder 不为空) */
.input-group input:focus,
.input-group input:not(:placeholder-shown) {
  border-color: var(--primary-color);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.08);
  padding-top: 24px;
  padding-bottom: 8px;
}

/* Label 样式 */
.input-group label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-gray);
  font-size: 15px;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  padding: 0 4px;
}

/* 当输入框聚焦 或 有内容时，Label 飞到左上角 */
.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 12px;
  color: var(--primary-color);
  background: #fff;
  font-weight: 600;
}

/* 错误文字 */
.error-text {
  font-size: 13px;
  color: #999;
  margin-top: -10px;
  margin-left: 4px;
  font-weight: 500;
}

.code-box {
  display: flex;
  gap: 12px;
}

.code-btn {
  border: none;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 12px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 80px;
  border: 1px solid var(--border-color);
}

.code-btn:hover:not(:disabled) {
  background: #e0dfff;
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #ccc;
  border-color: transparent;
}

/* 注册按钮 - 高级感 */
.register-btn {
  margin-top: 10px;
  padding: 16px;
  border: none;
  border-radius: 12px;

  /* 渐变背景 */
  background: linear-gradient(135deg, #6c63ff 0%, #8b86ff 100%);
  color: white;

  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;

  /* 阴影 */
  box-shadow: 0 10px 20px -5px rgba(108, 99, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(108, 99, 255, 0.5);
  filter: brightness(1.05);
}

.register-btn:active {
  transform: translateY(0);
}

/* Toast 美化 */
.toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.toast.success {
  background: rgba(255, 255, 255, 0.9);
  color: #1c8f55;
  border: 1px solid #e0f7ea;
}

.toast.error {
  background: rgba(255, 255, 255, 0.9);
  color: #d93025;
  border: 1px solid #ffecec;
}

/* 动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -40px);
}

</style>
