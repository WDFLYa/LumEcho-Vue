<template>
  <div class="login-container">

    <!-- 返回主页 -->
    <div class="back-btn" @click="goHome">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back
    </div>

    <!-- toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toastType">
        {{ toast }}
      </div>
    </transition>

    <!-- Logo (动态渐变) -->
    <h1 class="logo" :style="logoStyle">
      Lum<span>Echo!</span>
    </h1>

    <!-- 登录卡片 -->
    <div class="login-card">

      <!-- 切换 -->
      <div class="tabs">
        <span :class="{active:mode==='account'}" @click="mode='account'">账号登录</span>
        <span :class="{active:mode==='phone'}" @click="mode='phone'">手机登录</span>
        <div class="tab-line" :style="{left: mode==='account' ? '0' : '100%', transform: mode==='account' ? 'translateX(0)' : 'translateX(-100%)'}"></div>
      </div>

      <transition name="fade-slide" mode="out-in">

        <!-- 账号登录 -->
        <div v-if="mode==='account'" key="account" class="form">

          <div class="input-group">
            <input type="text" placeholder=" " v-model="username" />
            <label>请输入账号</label>
          </div>

          <div class="input-group">
            <input type="password" placeholder=" " v-model="password" />
            <label>请输入密码</label>
          </div>

          <button class="login-btn" @click="handleAccountLogin">
            登 录
          </button>

        </div>

        <!-- 手机登录 -->
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
            <button
                class="code-btn"
                :disabled="sending"
                @click="sendCode"
            >
              {{ sending ? countdown+'s' : '发送' }}
            </button>
          </div>

          <button class="login-btn" @click="handlePhoneLogin">
            登 录
          </button>

        </div>

      </transition>

      <!-- 注册 -->
      <div class="extra">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>

    </div>

  </div>
</template>

<script>
import {loginByAccount, loginByPhone, sendLoginCode} from "@/api/auth";

export default {

  name:"LoginPage",

  data(){
    return{
      mode:"account",
      username:"",
      password:"",
      phone:"",
      code:"",
      toast:"",
      toastType:"",
      sending:false,
      countdown:0,
      timer:null,
      logoGradient: "" // 存储随机生成的渐变色
    }
  },

  computed: {
    // 计算属性：动态生成 Logo 样式
    logoStyle() {
      return {
        background: this.logoGradient || 'linear-gradient(135deg, #6c63ff, #8b86ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        // 添加一点发光效果
        filter: 'drop-shadow(0 4px 6px rgba(108, 99, 255, 0.2))'
      }
    }
  },

  mounted() {
    this.randomizeLogoColor();
  },

  methods:{
    // 随机生成 Logo 颜色
    randomizeLogoColor() {
      const colors = [
        'linear-gradient(135deg, #6c63ff, #4facfe)', // 蓝紫
        'linear-gradient(135deg, #ff9a9e, #fad0c4)', // 粉橙
        'linear-gradient(135deg, #a18cd1, #fbc2eb)', // 紫粉
        'linear-gradient(135deg, #84fab0, #8fd3f4)', // 青蓝
        'linear-gradient(135deg, #fccb90, #d57eeb)'  // 橙紫
      ];
      // 随机选一个
      this.logoGradient = colors[Math.floor(Math.random() * colors.length)];
    },

    goHome(){
      this.$router.push("/")
    },

    showToast(msg,type="success"){
      this.toast = msg
      this.toastType = type
      setTimeout(()=>{
        this.toast=""
      },2000)
    },

    async handleAccountLogin(){
      try{
        const res = await loginByAccount({
          account:this.username,
          password:this.password
        })
        if(res.data.code === 200){
          this.showToast("登录成功","success")
          const token = res.data.data.token;
          localStorage.setItem('user_token', token);
          setTimeout(()=>{ this.$router.push("/home") },1000)
        }else{
          const data = res.data;
          this.message = data.data ? Object.values(data.data)[0] : (data.message || "登录失败");
          this.showToast(this.message,"error")
        }
      }catch(err){
        const data = err.response?.data;
        if(data && typeof data === "object"){
          this.message = data.data.account || data.data.password || data.message || "登录失败";
        }else{
          this.message="网络或服务器错误";
        }
        this.showToast(this.message,"error")
      }
    },

    async handlePhoneLogin(){
      try{
        const res = await loginByPhone({
          phone:this.phone,
          code:this.code
        })
        if (res.data.code === 200) {
          this.showToast("登录成功，即将跳转主页", "success");
          const token = res.data.data.token;
          localStorage.setItem('user_token', token);
          setTimeout(() => { this.$router.push("/home"); }, 1200);
        } else {
          const errMsg = Object.values(res.data.data || {})[0] || res.data.message || "登录失败";
          this.showToast(errMsg, "error");
        }
      }catch (err) {
        const data = err.response?.data;
        if(data && typeof data === "object"){
          this.message = data.data.phone || data.data.code || data.message;
        }else{
          this.message="网络或服务器错误";
        }
        this.showToast(this.message,"error");
      }
    },

    async sendCode(){
      this.sending = true
      try{
        const res = await sendLoginCode({ phone:this.phone })
        if (res.data.code === 200) {
          this.showToast("验证码已发送", "success");
          this.startCountdown();
        } else {
          const errMsg = Object.values(res.data.data || {})[0] || res.data.message || "发送失败";
          this.showToast(errMsg, "error");
          this.sending = false;
        }
      }catch (err) {
        const data = err.response?.data;
        if(data && typeof data === "object"){
          this.message = data.data.phone || data.message;
        }else{
          this.message="网络或服务器错误";
        }
        this.showToast(this.message,"error");
        this.sending = false;
      }
    },

    startCountdown(){
      this.countdown = 60
      this.timer = setInterval(()=>{
        this.countdown--
        if(this.countdown <= 0){
          clearInterval(this.timer)
          this.sending=false
        }
      },1000)
    }
  }
}
</script>

<style scoped>

/* 全局变量 */
.login-container {
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
  /* 更细腻的浅色背景 */
  background: radial-gradient(circle at 50% 10%, #f8f9ff 0%, #ffffff 100%);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
}

/* 背景装饰圆圈，增加层次感 */
.login-container::before {
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
  font-size: 4rem; /* 更大一点 */
  font-weight: 900;
  margin-bottom: 40px;
  letter-spacing: -2px;
  z-index: 1;
  /* 渐变由 style 动态控制 */
  transition: filter 0.5s ease;
}

.logo span {
  /* span 不需要单独颜色了，继承整体渐变，或者可以单独加个动画 */
  font-style: italic;
}

/* 登录卡片 - 极简白 */
.login-card {
  width: 400px;
  padding: 50px 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(20px);

  /* 多层阴影，营造悬浮感 */
  box-shadow:
      0 20px 40px -10px rgba(108, 99, 255, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.5);

  z-index: 10;
  position: relative;
}

/* Tabs 切换优化 */
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
  width: 50%; /* 假设两个 tab 宽度一致，这里简化处理，实际可用 JS 计算宽度 */
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /* 初始位置修正，因为 absolute 是相对于 .tabs 的，left 0 就是第一个 tab 下面 */
  left: 0;
  /* 注意：这里为了简化 CSS，假设两个 tab 宽度一样。如果不一样，建议用 JS 动态算 left 和 width */
  /* 为了更精准，我们可以用 transform 移动整个线 */
  transform: translateX(0);
}
/* 修正 tab-line 逻辑，因为两个 span 宽度可能不同，这里用简单的 CSS 模拟 */
.tabs span:first-child.active ~ .tab-line { transform: translateX(0); }
.tabs span:last-child.active ~ .tab-line { transform: translateX(100%); }
/* 上面的 CSS 选择器比较复杂，为了稳妥，我们在 HTML 里用 style 动态控制 left 百分比更准，
   或者保持原样，用简单的下边框。这里为了美观，我保留原样简单的下边框逻辑，
   但把下边框做成圆角的滑块。

   修正方案：直接用 JS 控制 style 里的 left 和 transform 是最稳的，上面 template 里已经加了 style 绑定。
*/

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
  padding-top: 24px; /* 给 label 腾出空间 */
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
  background: #fff; /* 遮挡边框线 */
  font-weight: 600;
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
}

.code-btn:hover:not(:disabled) {
  background: #e0dfff;
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #ccc;
}

/* 登录按钮 - 高级感 */
.login-btn {
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

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(108, 99, 255, 0.5);
  filter: brightness(1.05);
}

.login-btn:active {
  transform: translateY(0);
}

.extra {
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: var(--text-gray);
}

.extra a {
  color: var(--primary-color);
  margin-left: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.extra a:hover {
  color: #5548c7;
  text-decoration: underline;
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
