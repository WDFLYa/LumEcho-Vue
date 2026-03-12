<template>
  <div id="app">
    <!--
      name="fade-slide": 定义动画名称，对应下方 CSS 的类名
      mode="out-in": 关键属性！让旧页面先退出，新页面再进入，避免两个页面重叠闪烁
    -->
    <transition name="fade-slide" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 全局样式，不需要 scoped，确保动画对所有页面生效 */

/* 1. 动画持续时间和缓动函数 (贝塞尔曲线让运动更自然) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 2. 【进入前】的状态：新页面初始状态
   - 透明度为 0 (不可见)
   - 向下偏移 20px
   - 轻微缩小 (0.98倍)
*/
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* 3. 【离开后】的状态：旧页面结束状态
   - 透明度为 0
   - 向上偏移 10px (制造一种推开的感觉)
   - 轻微缩小
*/
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 可选：确保 html 和 body 高度占满，防止动画期间出现滚动条闪烁 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>