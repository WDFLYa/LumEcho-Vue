<template>
  <div class="logo-container">
    <h1 class="lumecho-logo">Lum<span>Echo!</span></h1>
  </div>
</template>

<style scoped>
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #ffffff;
  margin: 0;
}

.lumecho-logo {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: clamp(2.5rem, 8vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #222222;
  text-align: center;
  line-height: 1;
}

.lumecho-logo span {
  color: #6c63ff; /* 主色：科技紫 */
}
</style>