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
          <h1>📸 摄影师审核中心</h1>
          <p>管理 Lumecho 平台摄影师资质，当前有 <span class="highlight">{{ pendingCount }}</span> 个待处理申请。</p>
        </div>
        <div class="date-badge">
          📅 {{ currentDate }}
        </div>
      </header>

      <!-- 3. 筛选与统计 (模仿 Stats Grid) -->
      <section class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card" style="cursor: pointer;" @click="filterStatus = null">
          <div class="stat-icon" style="background: #E3F2FD;">
            📊
          </div>
          <div class="stat-info">
            <span class="stat-label">全部申请</span>
            <span class="stat-value">{{ stats.all }}</span>
          </div>
        </div>
        <div class="stat-card" style="cursor: pointer;" @click="filterStatus = 0">
          <div class="stat-icon" style="background: #FFF3E0;">
            ⏳
          </div>
          <div class="stat-info">
            <span class="stat-label">待处理</span>
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-trend down" v-if="stats.trend < 0">↓ {{ Math.abs(stats.trend) }}%</span>
          </div>
        </div>
        <div class="stat-card" style="cursor: pointer;" @click="filterStatus = 1">
          <div class="stat-icon" style="background: #F3E5F5;">
            ✅
          </div>
          <div class="stat-info">
            <span class="stat-label">已通过</span>
            <span class="stat-value">{{ stats.approved }}</span>
          </div>
        </div>
        <div class="stat-card" style="cursor: pointer;" @click="filterStatus = 2">
          <div class="stat-icon" style="background: #FFEBEE;">
            ❌
          </div>
          <div class="stat-info">
            <span class="stat-label">已拒绝</span>
            <span class="stat-value">{{ stats.rejected }}</span>
          </div>
        </div>
      </section>

      <!-- 4. 审核列表 (模仿 Modules Grid 风格) -->
      <section class="modules-section">
        <h2 class="section-title">📋 待审核列表</h2>

        <!-- 列表为空 -->
        <div v-if="loading" class="module-card" style="justify-content: center; opacity: 0.6;">
          <span>🚀</span>
          <div class="module-content">
            <h3>加载中...</h3>
            <p>正在获取最新的摄影师申请</p>
          </div>
        </div>

        <div v-else-if="filteredApplications.length === 0" class="module-card" style="justify-content: center; opacity: 0.6;">
          <span>🎉</span>
          <div class="module-content">
            <h3>暂无数据</h3>
            <p>当前没有符合筛选条件的申请</p>
          </div>
        </div>

        <!-- 审核卡片列表 -->
        <div
            v-for="app in filteredApplications"
            :key="app.id"
            class="module-card"
            style="flex-direction: row; padding: 25px;"
        >
          <!-- 左侧信息 -->
          <div class="module-icon-wrapper" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); width: 60px; height: 60px;">
            {{ app.realName?.charAt(0) || 'P' }}
          </div>

          <div class="module-content" style="flex: 1; margin-right: 20px;">
            <h3>{{ app.realName || '匿名用户' }}</h3>
            <p style="margin: 5px 0; color: #555;">账号: {{ app.account }} | 手机: {{ app.phone }}</p>
            <p style="margin: 5px 0; color: #666; font-size: 13px;">
              <el-tag :type="app.status === 0 ? 'warning' : app.status === 1 ? 'success' : 'danger'" size="small">
                {{ getStatusText(app.status) }}
              </el-tag>
              提交于: {{ formatDate(app.createTime) }}
            </p>
          </div>

          <!-- 右侧操作 -->
          <div v-if="app.status === 0" class="action-group" style="display: flex; gap: 10px; align-items: center;">
            <button class="action-btn-small" @click.stop="handleReview(app.id, 1)" style="background: #C8E6C9; color: #2E7D32;">
              通过
            </button>
            <button class="action-btn-small" @click.stop="openRejectDialog(app.id)" style="background: #FFCDD2; color: #C62828;">
              拒绝
            </button>
          </div>
          <div v-else class="reason-box" style="color: #777; font-size: 13px;">
            {{ app.status === 1 ? '已通过' : '已拒绝' }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getPhotographerList, reviewPhotographer } from "@/api/photographer";
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "UniformAdminReview",
  components: { AdminNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: 'Admin',
      currentDate: new Date().toLocaleDateString('zh-CN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      loading: false,
      filterStatus: 0, // 默认只看待处理
      applicationList: [],
      // 模拟统计数据
      stats: {
        all: 0,
        pending: 8,
        approved: 120,
        rejected: 15,
        trend: -2
      }
    };
  },
  computed: {
    pendingCount() {
      return this.applicationList.filter(app => app.status === 0).length;
    },
    filteredApplications() {
      return this.applicationList.filter(app => {
        return this.filterStatus === null || app.status === this.filterStatus;
      });
    }
  },
  mounted() {
    this.fetchApplications();
  },
  methods: {
    handleSearch(query) {
      console.log("Search:", query);
    },
    async fetchApplications() {
      this.loading = true;
      try {
        const res = await getPhotographerList();
        if (res.data && res.data.code === 200) {
          this.applicationList = res.data.data || [];
          // 更新统计数据
          const list = this.applicationList;
          this.stats.all = list.length;
          this.stats.pending = list.filter(i => i.status === 0).length;
          this.stats.approved = list.filter(i => i.status === 1).length;
          this.stats.rejected = list.filter(i => i.status === 2).length;
        }
      } catch (error) {
        ElMessage.error('数据加载失败');
      } finally {
        this.loading = false;
      }
    },
    openRejectDialog(id) {
      ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
        inputPlaceholder: '请输入拒绝原因',
        inputPattern: /.{5,}/,
        inputErrorMessage: '理由至少5个字',
        type: 'warning'
      }).then(({ value }) => {
        this.submitReview(id, 2, value);
      }).catch(() => {
        // 用户取消
      });
    },
    async submitReview(id, status, reason = null) {
      try {
        await reviewPhotographer(id, status, reason);
        ElMessage.success(status === 1 ? '审核通过' : '已拒绝');
        this.fetchApplications(); // 刷新列表
      } catch (error) {
        ElMessage.error('操作失败');
      }
    },
    getStatusText(status) {
      return { 0: '待审核', 1: '已通过', 2: '已拒绝' }[status] || '未知';
    },
    formatDate(dateStr) {
      return dateStr ? new Date(dateStr).toLocaleString() : '—';
    }
  }
};
</script>

<style scoped>
/* --- 基础继承 (完全复刻 Dashboard) --- */
.admin-container {
  min-height: 100vh;
  background-color: #F7FAFC; /* 淡雅背景 */
  background-image: radial-gradient(#E3F2FD 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  color: #455A64;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 40px;
}

/* --- 头部 (完全复刻) --- */
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

/* --- 统计卡片 (完全复刻) --- */
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

.stat-trend.up {
  color: #4CAF50;
}

.stat-trend.down {
  color: #F44336;
}

/* --- 模块网格 (完全复刻) --- */
.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #37474F;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modules-section {
  margin-bottom: 40px;
}

.modules-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  transform: translateY(-5px) scale(1.01);
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

/* --- 通用按钮样式 --- */
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
  border: 0;
  outline: 0;
}

.action-btn-small:hover {
  background: #B3E5FC;
  transform: scale(1.05);
}

/* --- 响应式 --- */
@media (max-width: 900px) {
  .content-wrapper {
    padding: 20px;
  }
}
</style>