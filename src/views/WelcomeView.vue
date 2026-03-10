<template>
  <div class="logo-container">

    <!-- 右上角按钮 -->
    <div class="top-buttons">
      <button class="login-btn" @click="goLogin">Sign in</button>
      <button class="register-btn" @click="goRegister">Sign up</button>
    </div>

    <!-- Logo -->
    <h1 class="lumecho-logo">
      Lum<span>Echo!</span>
    </h1>

  </div>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    goLogin() {
      this.$router.push("/login")
    },
    goRegister() {
      this.$router.push("/register")
    }
  }
}
</script>

<style scoped>

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: radial-gradient(circle at center, #f5f5ff 0%, #ffffff 60%);
  margin: 0;
  overflow: hidden;
  position: relative;
}

/* 右上角按钮容器 */
.top-buttons{
  position:absolute;
  top:30px;
  right:40px;
  display:flex;
  gap:15px;
}

/* 登录按钮 */
.login-btn{
  padding:8px 20px;
  border-radius:20px;
  border:2px solid #6c63ff;
  background:transparent;
  color:#6c63ff;
  font-weight:600;
  cursor:pointer;
  transition: all 0.3s;
}

.login-btn:hover{
  background:#6c63ff;
  color:#ffffff;
  transform: translateY(-3px) scale(1.05);
  box-shadow:0 6px 20px rgba(108,99,255,0.4);
}

/* 注册按钮 */
.register-btn{
  padding:8px 20px;
  border-radius:20px;
  border:2px solid #6c63ff;
  background: #6c63ff;
  color: #ffffff;
  font-weight:600;
  cursor:pointer;
  transition: all 0.3s;
}

.register-btn:hover{
  background:#ffffff;
  color:#6c63ff;
  transform: translateY(-3px) scale(1.05);
  box-shadow:0 6px 20px rgba(108,99,255,0.4);
}

/* Logo */
.lumecho-logo {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #222;
  text-align: center;
  line-height: 1;

  animation: fadeIn 2.5s ease;
}

.lumecho-logo span {
  background: linear-gradient(90deg, #6c63ff, #9f8cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 手机适配 */
@media (max-width: 768px) {

  .top-buttons{
    top:20px;
    right:20px;
    gap:10px;
  }

  .login-btn,
  .register-btn{
    padding:6px 16px;
    font-size:14px;
  }

  .lumecho-logo{
    font-size: clamp(2.5rem, 12vw, 4rem);
  }

}
</style>