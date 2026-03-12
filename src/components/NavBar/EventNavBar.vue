<template>
  <BaseNavBar theme="event" :show-search="false" :show-upload="false" left-action="home">
    <template #logo>
      <h1 class="event-logo">🏆 LumEcho 活动</h1>
    </template>

    <template #right>
      <button class="event-btn">我的报名</button>
      <div class="user-avatar">
        <img :src="userAvatar" alt="Avatar" />
      </div>
    </template>
  </BaseNavBar>
</template>

<script>
import BaseNavBar from './BaseNavBar.vue';
export default {
  name: "EventNavBar",
  components: { BaseNavBar },
  props: { userAvatar: String }
}
</script>

<style scoped>
.event-logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
}
.event-btn {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.5);
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}
</style>
