<template>
  <div class="admin-container">
    <!-- 1. 管理员专用导航栏 -->
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
    />

    <main class="content-wrapper">
      <!-- 2. 顶部欢迎与操作 -->
      <header class="page-header">
        <div class="welcome-text">
          <h1>🛡️ 管理控制台</h1>
          <p>欢迎回来，{{ currentUserName }}。当前系统运行平稳，共 <span class="highlight">{{ modules.length }}</span> 个管理模块。</p>
        </div>
        <div class="date-badge">
          📅 {{ currentDate }}
        </div>
      </header>

      <!-- 3. 模块卡片网格 -->
      <section class="modules-grid">
        <div
            v-for="mod in modules"
            :key="mod.id"
            class="module-card"
            @click="navigateTo(mod.route)"
        >
          <div class="module-icon-wrapper" :style="{ background: mod.gradient }">
            {{ mod.icon }}
          </div>

          <div class="module-content">
            <h3>{{ mod.name }}</h3>
            <p>{{ mod.desc }}</p>
            <div class="module-stat">
              <span class="stat-value">{{ mod.count }}</span>
              <span class="stat-label">{{ statLabel }}</span>
            </div>
          </div>

          <div class="module-arrow">→</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";

export default {
  name: "AdminHome",
  components: { AdminNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: 'Admin',
      currentDate: new Date().toLocaleDateString('zh-CN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      // 可视化分析已放到最后一位
      modules: [
        { id: 1, name: '用户管理', desc: '管理注册用户、权限分配与状态监控', icon: '👥', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', count: 1248, statLabel: '活跃用户', route: '/admin/users' },
        { id: 2, name: '摄影师认证管理', desc: '审核资质、管理认证状态与作品集', icon: '📸', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', count: 15, statLabel: '待审核', route: '/admin/photographers' },
        { id: 3, name: '活动管理', desc: '发布线下活动、报名管理与签到统计', icon: '🎉', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', count: 6, statLabel: '已发布', route: '/admin/events' },
        { id: 4, name: '比赛管理', desc: '摄影赛事发布、作品征集与评审', icon: '🏆', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', count: 3, statLabel: '进行中', route: '/admin/competitions' },
        { id: 5, name: '咨询管理', desc: '处理用户留言、工单分配与回复跟踪', icon: '💬', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', count: 42, statLabel: '待处理', route: '/admin/inquiries' },
        { id: 6, name: '帖子管理', desc: '审核用户发帖、内容管理与违规处理', icon: '📝', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', count: 326, statLabel: '总帖子', route: '/admin/posts' },
        { id: 7, name: '申请管理', desc: '各类入驻、合作与权限申请审核', icon: '📨', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', count: 28, statLabel: '待处理', route: '/admin/applies' },
        { id: 8, name: '可视化分析', desc: '平台数据看板、用户行为与业务报表', icon: '📊', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', count: '—', statLabel: '数据洞察', route: '/admin/analytics' }
      ]
    };
  },
  methods: {
    handleSearch(query) {
      console.log("全局搜索:", query);
    },
    navigateTo(route) {
      if (route) {
        this.$router.push(route);
      }
    }
  }
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #F7FAFC;
  background-image: radial-gradient(#E3F2FD 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #455A64;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  flex-wrap: wrap;
  gap: 15px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 800;
  color: #37474F;
  margin: 0 0 6px 0;
}

.welcome-text p {
  margin: 0;
  color: #78909C;
  font-size: 15px;
}

.highlight {
  color: #0288D1;
  font-weight: 700;
}

.date-badge {
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #0277BD;
  box-shadow: 0 4px 10px rgba(129, 212, 250, 0.15);
  border: 1px solid #E1F5FE;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.module-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  border: 1px solid #F0F4F8;
  box-shadow: 0 5px 15px rgba(100, 181, 246, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 15px 30px rgba(129, 212, 250, 0.18);
  border-color: #B3E5FC;
}

.module-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
  box-shadow: inset 0 0 20px rgba(255,255,255,0.4);
}

.module-content {
  flex: 1;
}

.module-content h3 {
  font-size: 17px;
  font-weight: 800;
  color: #37474F;
  margin: 0 0 4px 0;
}

.module-content p {
  font-size: 13px;
  color: #90A4AE;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.module-stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #0277BD;
}

.stat-label {
  font-size: 12px;
  color: #90A4AE;
  font-weight: 600;
}

.module-arrow {
  font-size: 20px;
  color: #B0BEC5;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.module-card:hover .module-arrow {
  color: #0288D1;
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .content-wrapper { padding: 20px; }
  .modules-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
}

@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .modules-grid { grid-template-columns: 1fr; }
}
</style>