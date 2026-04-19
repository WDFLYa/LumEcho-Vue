<template>
  <div class="admin-container">
    <!-- 顶部导航 -->
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
    />

    <main class="content-wrapper">
      <!-- 头部区域 -->
      <header class="page-header">
        <div class="header-left">
          <h1>摄影活动管理</h1>
          <p class="subtitle">监控线下活动状态、报名数据及紧急干预</p>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="fetchList" :disabled="loading">
            <span v-if="!loading">🔄 刷新数据</span>
            <span v-else>加载中...</span>
          </button>
        </div>
      </header>

      <!-- ✅ 新增：状态筛选栏 -->
      <div class="filter-bar">
        <div
            v-for="s in statusList"
            :key="s.value"
            class="filter-chip"
            :class="{ active: filterStatus === s.value }"
            @click="filterStatus = s.value"
        >
          {{ s.label }}
        </div>
      </div>

      <!-- 数据列表 -->
      <div v-if="loading" class="grid">
        <!-- 骨架屏 Loading -->
        <div v-for="n in 6" :key="n" class="card skeleton-card">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-meta"></div>
          <div class="sk-line sk-time"></div>
        </div>
      </div>

      <!-- ✅ 修改：使用 filteredList 进行渲染 -->
      <div v-else-if="filteredList.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无相关活动数据</p>
      </div>

      <div v-else class="grid">
        <div class="card" v-for="item in filteredList" :key="item.id">

          <!-- 卡片头部：状态与标题 -->
          <div class="card-header">
            <h3 class="card-title" :title="item.title">{{ item.title }}</h3>
            <span class="status-tag" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </span>
          </div>

          <!-- 核心信息网格 -->
          <div class="card-info-grid">
            <!-- 地点 -->
            <div class="info-item">
              <span class="icon">📍</span>
              <span class="text">{{ item.location || '未知地点' }}</span>
            </div>

            <!-- 审核标识 -->
            <div v-if="item.requireAudit === 1" class="info-item audit">
              <span class="icon">🛡️</span>
              <span class="text">需审核作品</span>
            </div>
          </div>

          <!-- 人数与进度 -->
          <div class="card-stats">
            <div class="stat-row">
              <span class="label">参与人数</span>
              <span class="value">
                {{ item.currentParticipants }}
                <span class="unit">/ {{ item.maxParticipants === -1 ? '∞' : item.maxParticipants }}</span>
              </span>
            </div>
            <div class="progress-track">
              <div
                  class="progress-fill"
                  :style="{ width: getProgressPercent(item) + '%' }"
              ></div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="card-dates">
            <div class="date-row">
              <span class="label">开始</span>
              <span class="value">{{ formatDate(item.startTime) }}</span>
            </div>
            <div class="date-row">
              <span class="label">结束</span>
              <span class="value">{{ formatDate(item.endTime) }}</span>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="card-footer">
            <template v-if="item.status === 3">
              <span class="status-text cancelled">已取消</span>
            </template>
            <template v-else-if="item.status === 2">
              <span class="status-text ended">已结束</span>
            </template>
            <template v-else>
              <button class="btn-cancel" @click="handleCancel(item.id)">
                取消活动
              </button>
            </template>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getActivityList, cancelActivity } from "@/api/activity";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "AdminActivityManage",
  components: { AdminNavBar },

  data() {
    return {
      currentUserAvatar: "http://localhost:9000/lumecho/avatar.png",
      currentUserName: "Admin",
      list: [],
      loading: false,

      // ✅ 新增：当前选中的状态筛选值 (null 表示全部)
      filterStatus: null,

      // ✅ 新增：状态列表定义
      statusList: [
        { label: "全部", value: null },
        { label: "未开始", value: 0 },
        { label: "进行中", value: 1 },
        { label: "已结束", value: 2 },
        { label: "已取消", value: 3 }
      ]
    };
  },

  // ✅ 新增：计算属性，根据筛选条件过滤列表
  computed: {
    filteredList() {
      if (this.filterStatus === null) {
        return this.list;
      }
      return this.list.filter(item => item.status === this.filterStatus);
    }
  },

  mounted() {
    this.fetchList();
  },

  methods: {
    async fetchList() {
      this.loading = true;
      try {
        const res = await getActivityList();
        if (res.data.code === 200) {
          this.list = res.data.data || [];
        } else {
          ElMessage.warning(res.data.message || "获取失败");
        }
      } catch (error) {
        ElMessage.error("网络请求异常");
      } finally {
        this.loading = false;
      }
    },

    async handleCancel(id) {
      ElMessageBox.confirm("确定要强制取消该活动吗？此操作不可逆，将通知所有报名用户。", "高风险操作", {
        confirmButtonText: "确认取消",
        cancelButtonText: "再想想",
        type: "warning"
      }).then(async () => {
        try {
          await cancelActivity(id);
          ElMessage.success("活动已取消");
          this.fetchList();
        } catch (e) {
          ElMessage.error("操作失败");
        }
      }).catch(() => {});
    },

    getProgressPercent(item) {
      if (!item.maxParticipants || item.maxParticipants === -1) return 0;
      const percent = (item.currentParticipants / item.maxParticipants) * 100;
      return Math.min(percent, 100);
    },

    formatDate(t) {
      if (!t) return "-";
      const d = new Date(t);
      const Y = d.getFullYear();
      const M = String(d.getMonth() + 1).padStart(2, '0');
      const D = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${Y}-${M}-${D} ${h}:${m}`;
    },

    getStatusText(s) {
      const map = {
        0: "未开始",
        1: "进行中",
        2: "已结束",
        3: "已取消"
      };
      return map[s] || "未知";
    },

    getStatusClass(s) {
      const map = {
        0: "status-pending",
        1: "status-active",
        2: "status-ended",
        3: "status-cancelled"
      };
      return map[s] || "";
    }
  }
};
</script>

<style scoped>
/* 变量定义 */
:root {
  --primary: #4F46E5;
  --danger: #EF4444;
  --text-main: #1E293B;
  --text-sub: #64748B;
}

.admin-container {
  min-height: 100vh;
  background-color: #F8FAFC;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

/* 头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #64748B;
  font-size: 14px;
  margin: 0;
}

.refresh-btn {
  background: #fff;
  border: 1px solid #CBD5E1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #F1F5F9;
  border-color: #94A3B8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ✅ 新增：筛选栏样式 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  font-size: 13px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: #CBD5E1;
  color: #334155;
}

.filter-chip.active {
  background: #1E293B;
  color: #fff;
  border-color: #1E293B;
}

/* 网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* 卡片主体 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #CBD5E1;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 状态标签 */
.status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.status-pending { background: #F1F5F9; color: #64748B; }
.status-active { background: #DCFCE7; color: #166534; }
.status-ended { background: #F1F5F9; color: #94A3B8; }
.status-cancelled { background: #FEF2F2; color: #991B1B; }

/* 信息网格 */
.card-info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #64748B;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-item.audit {
  color: #D97706;
  font-weight: 500;
}

/* 统计区域 */
.card-stats {
  margin-bottom: 16px;
  background: #F8FAFC;
  padding: 12px;
  border-radius: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-row .label { color: #64748B; }
.stat-row .value { font-weight: 600; color: #334155; }
.stat-row .unit { font-weight: 400; color: #94A3B8; font-size: 12px; }

/* 进度条 */
.progress-track {
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4F46E5;
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* 时间区域 */
.card-dates {
  font-size: 12px;
  color: #64748B;
  margin-bottom: 20px;
  flex: 1;
}

.date-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.date-row .label { color: #94A3B8; width: 40px; }
.date-row .value { color: #334155; font-weight: 500; text-align: right; flex: 1; }

/* 底部操作区 */
.card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: center;
}

.btn-cancel {
  width: 100%;
  padding: 8px 0;
  background: transparent;
  border: 1px solid #FECACA;
  color: #EF4444;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #FEF2F2;
  border-color: #EF4444;
}

.status-text {
  font-size: 13px;
  font-weight: 500;
}

.status-text.cancelled {
  color: #EF4444;
}

.status-text.ended {
  color: #94A3B8;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #94A3B8;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

/* 骨架屏 */
.skeleton-card { pointer-events: none; }
.sk-line { background: #F1F5F9; border-radius: 4px; margin-bottom: 12px; animation: pulse 1.5s infinite; }
.sk-title { height: 20px; width: 70%; }
.sk-meta { height: 16px; width: 50%; }
.sk-time { height: 16px; width: 90%; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
</style>
