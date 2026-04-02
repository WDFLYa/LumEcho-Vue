<template>
  <div class="admin-container">
    <!-- 1. 管理员专用导航栏 -->
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @profile="goProfile"
        @refresh="fetchStats"
    />

    <main class="content-wrapper">
      <!-- 2. 顶部欢迎与时间 -->
      <header class="page-header">
        <div class="welcome-text">
          <h1>👋 早安, {{ currentUserName }}</h1>
          <p>这里是 Lumecho 摄影平台管理中心，今日有 <span class="highlight">{{ pendingCount }}</span> 条待办事项。</p>
        </div>
        <div class="date-badge">
          📅 {{ currentDate }}
        </div>
      </header>

      <!-- 3. 核心数据概览 (Key Metrics) -->
      <section class="stats-grid">
        <div
            class="stat-card"
            v-for="(stat, index) in statsData"
            :key="index"
            :style="{ borderLeftColor: stat.color }"
        >
          <div class="stat-icon" :style="{ background: stat.bgColor }">
            {{ stat.icon }}
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
            </span>
          </div>
        </div>
      </section>

      <!-- 4. 功能模块入口 (Function Modules) -->
      <section class="modules-section">
        <h2 class="section-title">⚡ 快捷管理</h2>
        <div class="modules-grid">
          <div
              class="module-card"
              v-for="mod in modules"
              :key="mod.id"
              @click="navigateTo(mod.path)"
          >
            <div class="module-icon-wrapper" :style="{ background: mod.gradient }">
              <span class="module-icon">{{ mod.icon }}</span>
            </div>
            <div class="module-content">
              <h3>{{ mod.name }}</h3>
              <p>{{ mod.desc }}</p>
            </div>
            <div class="module-arrow">➜</div>
          </div>
        </div>
      </section>

      <!-- 5. 数据分析与待办 (Split View) -->
      <div class="dashboard-split">

        <!-- 左侧：可视化分析预览 -->
        <div class="panel chart-panel">
          <div class="panel-header">
            <h3>📊 流量趋势分析</h3>
            <button class="view-all-btn" @click="navigateTo('/admin/analysis')">查看详情</button>
          </div>
          <div class="chart-placeholder">
            <!-- 纯CSS模拟柱状图，实际项目中请替换为 ECharts -->
            <div class="mock-chart">
              <div class="bar" style="height: 40%" title="周一"></div>
              <div class="bar" style="height: 70%" title="周二"></div>
              <div class="bar" style="height: 50%" title="周三"></div>
              <div class="bar" style="height: 90%" title="周四"></div>
              <div class="bar" style="height: 60%" title="周五"></div>
              <div class="bar" style="height: 85%" title="周六"></div>
              <div class="bar" style="height: 75%" title="周日"></div>
            </div>
            <p class="chart-tip">本周访问量较上周增长 12%</p>
          </div>
        </div>

        <!-- 右侧：最新动态/待办 -->
        <div class="panel todo-panel">
          <div class="panel-header">
            <h3>🔔 待处理事项</h3>
          </div>
          <ul class="todo-list">
            <li class="todo-item" v-for="todo in recentTodos" :key="todo.id">
              <div class="todo-left">
                <span class="todo-dot" :class="todo.type"></span>
                <div class="todo-text">
                  <strong>{{ todo.title }}</strong>
                  <span>{{ todo.time }}</span>
                </div>
              </div>
              <button class="action-btn-small" @click="navigateTo(todo.link)">处理</button>
            </li>
          </ul>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
// 请确保路径正确，如果刚才新建了 AdminNavBar.vue
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";

export default {
  name: "AdminDashboard",
  components: { AdminNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: 'Admin',
      // 动态日期
      currentDate: new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),

      // 统计数据
      pendingCount: 12,
      statsData: [
        { label: '待审核摄影师', value: '8', trend: 2, icon: '📸', color: '#FF9800', bgColor: '#FFF3E0' },
        { label: '今日新增预约', value: '24', trend: 15, icon: '📅', color: '#2196F3', bgColor: '#E3F2FD' },
        { label: '进行中活动', value: '3', trend: 0, icon: '🎉', color: '#9C27B0', bgColor: '#F3E5F5' },
        { label: '未读咨询', value: '5', trend: -5, icon: '💬', color: '#F44336', bgColor: '#FFEBEE' },
      ],

      // 8大功能模块配置
      modules: [
        { id: 1, name: '用户管理', desc: '会员列表、封禁管理', icon: '👥', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', path: '/admin/users' },
        { id: 2, name: '摄影师认证', desc: '资质审核、等级调整', icon: '🎖️', gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', path: '/admin/photographers' },
        { id: 3, name: '预约管理', desc: '订单查看、状态调度', icon: '🗓️', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', path: '/admin/bookings' },
        { id: 4, name: '活动易管理', desc: '线上活动发布与配置', icon: '🎈', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', path: '/admin/activities' },
        { id: 5, name: '比赛管理', desc: '赛事流程、作品评审', icon: '🏆', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', path: '/admin/contests' },
        { id: 6, name: '咨询管理', desc: '客服消息、反馈处理', icon: '📨', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', path: '/admin/messages' },
        { id: 7, name: '视频管理', desc: '教程审核、首页推荐', icon: '🎬', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', path: '/admin/videos' },
        { id: 8, name: '可视化分析', desc: '全平台数据大屏', icon: '📈', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', path: '/admin/analysis' },
      ],

      // 模拟待办数据
      recentTodos: [
        { id: 1, title: '用户 "PhotoMaster" 申请认证', time: '10分钟前', type: 'warning', link: '/admin/photographers' },
        { id: 2, title: '活动 "秋日扫街" 报名异常', time: '1小时前', type: 'danger', link: '/admin/activities' },
        { id: 3, title: '新上传视频待审核 (ID: 992)', time: '2小时前', type: 'info', link: '/admin/videos' },
        { id: 4, title: '系统周报已生成', time: '昨天', type: 'success', link: '/admin/analysis' },
      ]
    };
  },
  methods: {
    goProfile() {
      this.$router.push("/admin/profile");
    },
    handleSearch(query) {
      console.log("Admin search:", query);
      // 这里可以跳转到全局搜索结果页
    },
    navigateTo(path) {
      // 防止重复点击同一路由报错
      this.$router.push(path).catch(err => err);
    },
    fetchStats() {
      console.log("刷新数据...");
      // 这里调用 API 刷新 statsData
    }
  }
};
</script>

<style scoped>
/* --- 基础继承 --- */
.admin-container {
  min-height: 100vh;
  background-color: #F7FAFC;
  /* 保持原有的背景纹理，但颜色更淡一点，显得更干净 */
  background-image: radial-gradient(#E3F2FD 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  color: #455A64;
}

.content-wrapper {
  max-width: 1400px; /* 比前台更宽一点，适合表格和图表 */
  margin: 0 auto;
  padding: 30px 40px;
}

/* --- 头部 --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 800;
  color: #37474F;
  margin: 0 0 5px 0;
}

.welcome-text p {
  margin: 0;
  color: #78909C;
  font-size: 15px;
}

.highlight {
  color: #F44336;
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

/* --- 统计卡片 Stats Grid --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #F0F4F8;
  box-shadow: 0 10px 20px rgba(100, 181, 246, 0.05);
  transition: transform 0.3s ease;
  border-left: 5px solid transparent; /* 动态颜色 */
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #90A4AE;
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #37474F;
  line-height: 1.2;
}

.stat-trend {
  font-size: 12px;
  font-weight: 700;
}
.stat-trend.up { color: #4CAF50; }
.stat-trend.down { color: #F44336; }

/* --- 模块网格 Modules Grid --- */
.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #37474F;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.module-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  border: 1px solid #F0F4F8;
  box-shadow: 0 5px 15px rgba(100, 181, 246, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(129, 212, 250, 0.2);
  border-color: #B3E5FC;
}

.module-icon-wrapper {
  width: 55px;
  height: 55px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
  box-shadow: inset 0 0 20px rgba(255,255,255,0.3);
}

.module-content h3 {
  font-size: 16px;
  font-weight: 800;
  color: #37474F;
  margin: 0 0 4px 0;
}

.module-content p {
  font-size: 12px;
  color: #90A4AE;
  margin: 0;
}

.module-arrow {
  margin-left: auto;
  color: #CFD8DC;
  font-weight: 900;
  transition: all 0.3s;
  opacity: 0;
  transform: translateX(-10px);
}

.module-card:hover .module-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #81D4FA;
}

/* --- 分割视图 Split View --- */
.dashboard-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

.panel {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 25px;
  border: 1px solid #F0F4F8;
  box-shadow: 0 10px 20px rgba(100, 181, 246, 0.05);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: #37474F;
  margin: 0;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: #0277BD;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

/* 模拟图表 */
.chart-placeholder {
  flex: 1;
  background: #FAFCFE;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  min-height: 250px;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  height: 150px;
  width: 100%;
  justify-content: space-around;
  padding-bottom: 10px;
  border-bottom: 2px solid #ECEFF1;
}

.bar {
  width: 12%;
  background: linear-gradient(to top, #81D4FA, #4FC3F7);
  border-radius: 8px 8px 0 0;
  transition: height 1s ease;
  opacity: 0.8;
}
.bar:hover { opacity: 1; transform: scaleY(1.05); }

.chart-tip {
  margin-top: 15px;
  font-size: 13px;
  color: #78909C;
  font-weight: 600;
}

/* 待办列表 */
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F0F4F8;
}

.todo-item:last-child { border-bottom: none; }

.todo-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.todo-dot.warning { background: #FF9800; box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1); }
.todo-dot.danger { background: #F44336; box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1); }
.todo-dot.info { background: #2196F3; box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1); }
.todo-dot.success { background: #4CAF50; box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1); }

.todo-text {
  display: flex;
  flex-direction: column;
}

.todo-text strong {
  font-size: 14px;
  color: #455A64;
}

.todo-text span {
  font-size: 11px;
  color: #B0BEC5;
  margin-top: 2px;
}

.action-btn-small {
  background: #E1F5FE;
  color: #0277BD;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-small:hover {
  background: #B3E5FC;
  transform: scale(1.05);
}

/* 移动端适配 */
@media (max-width: 900px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
  .content-wrapper {
    padding: 20px;
  }
  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
