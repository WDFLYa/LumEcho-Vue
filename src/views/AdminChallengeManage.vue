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
          <h1>挑战赛管理</h1>
          <p class="subtitle">监控挑战赛状态、报名数据及紧急干预</p>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="fetchList" :disabled="loading">
            <span v-if="!loading">🔄 刷新数据</span>
            <span v-else>加载中...</span>
          </button>
        </div>
      </header>

      <!-- 筛选栏 -->
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

      <div v-else-if="filteredList.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无相关挑战赛数据</p>
      </div>

      <div v-else class="grid">
        <div class="card" v-for="item in filteredList" :key="item.id">

          <!-- 卡片头部：状态与标题 -->
          <div class="card-top">
            <span class="status-tag" :class="getStatusClass(item.statusCode)">
              {{ item.statusText }}
            </span>
            <h3 class="card-title" :title="item.title">{{ item.title }}</h3>
          </div>

          <!-- 核心数据：人数与进度 -->
          <div class="card-stats">
            <div class="stat-row">
              <span class="label">参与人数</span>
              <span class="value">
                {{ item.participantCount }}
                <span class="unit">/ {{ item.maxParticipants === -1 ? '∞' : item.maxParticipants }}</span>
              </span>
            </div>
            <!-- 进度条可视化 -->
            <div class="progress-track">
              <div
                  class="progress-fill"
                  :style="{ width: Math.min(item.progressPercent || 0, 100) + '%' }"
              ></div>
            </div>
          </div>

          <!-- 时间信息：紧凑排列 -->
          <div class="card-dates">
            <div class="date-item">
              <span class="icon">📅</span>
              <span>{{ formatDate(item.startTime) }}</span>
            </div>
            <div class="date-separator">→</div>
            <div class="date-item">
              <span class="icon">🏁</span>
              <span>{{ formatDate(item.endTime) }}</span>
            </div>
          </div>

          <!-- 底部操作：仅保留必要的终止操作 -->
          <div class="card-footer">
            <!-- 只有未开始(0)、进行中(1)、评审中(2)可以取消 -->
            <!-- 已结束(3) 和 已取消(4) 显示归档/已取消状态 -->
            <button
                v-if="[0, 1, 2].includes(item.statusCode)"
                class="btn-cancel"
                @click="handleCancel(item.id)"
            >
              终止比赛
            </button>
            <span v-else class="status-closed">
              {{ item.statusCode === 4 ? '已取消' : '已归档' }}
            </span>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getChallengeList, cancelChallenge } from "@/api/challenge";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCurrentUserInfo } from "@/api/auth";  // 👈 加这行

export default {
  name: "AdminChallengeManage",
  components: { AdminNavBar },

  data() {
    return {
      currentUserAvatar: "http://47.116.108.205:9000/lumecho/avatar.png",
      currentUserName: "Admin",
      loading: false,
      list: [],
      filterStatus: null,

      statusList: [
        { label: "全部", value: null },
        { label: "未开始", value: 0 },
        { label: "报名中", value: 1 },
        { label: "评审中", value: 2 },
        { label: "已结束", value: 3 },
        { label: "已取消", value: 4 }
      ]
    };
  },

  computed: {
    filteredList() {
      if (this.filterStatus === null) return this.list;
      return this.list.filter(i => i.statusCode === this.filterStatus);
    }
  },

  mounted() {
    this.fetchList();
    this.fetchUserInfo();  // 👈 加这行
  },

  methods: {
    // 👇 加这个方法
    async fetchUserInfo() {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserName = data.username;
          this.currentUserAvatar = data.avatar;
        }
    },

    async fetchList() {
      this.loading = true;
      try {
        const res = await getChallengeList();
        if (res.data.code === 200) {
          this.list = (res.data.data.data || []).map(item => ({
            ...item,
            statusText: item.statusText || this.getStatusLabel(item.statusCode)
          }));
        }
      } catch (error) {
        ElMessage.error("获取列表失败");
      } finally {
        this.loading = false;
      }
    },

    getStatusLabel(code) {
      const map = {
        0: "未开始",
        1: "报名中",
        2: "评审中",
        3: "已结束",
        4: "已取消"
      };
      return map[code] || "未知";
    },

    async handleCancel(id) {
      ElMessageBox.confirm("确定要强制终止该挑战吗？此操作不可逆。", "高风险操作", {
        confirmButtonText: "确认终止",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        try {
          await cancelChallenge(id);
          ElMessage.success("挑战已终止");
          this.fetchList();
        } catch (e) {
          ElMessage.error("操作失败");
        }
      }).catch(() => {});
    },

    formatDate(t) {
      if (!t) return "-";
      const d = new Date(t);
      return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    getStatusClass(s) {
      const map = {
        0: "status-pending",
        1: "status-active",
        2: "status-review",
        3: "status-ended",
        4: "status-cancelled"
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
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
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

/* 筛选 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap; /* 防止小屏幕溢出 */
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
.card-top {
  margin-bottom: 16px;
}

.status-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

/* 状态颜色 */
.status-pending { background: #F1F5F9; color: #64748B; }   /* 未开始 */
.status-active { background: #DCFCE7; color: #166534; }   /* 报名中 */
.status-review { background: #F3E8FF; color: #6B21A8; }   /* 评审中 */
.status-ended { background: #F1F5F9; color: #94A3B8; }    /* 已结束 */
.status-cancelled { background: #FEF2F2; color: #991B1B; } /* ✅ 已取消 - 红色系 */

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  line-height: 1.4;
  /* 限制两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 统计区域 */
.card-stats {
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
}

.stat-row .label { color: #64748B; }
.stat-row .value { font-weight: 600; color: #334155; }
.stat-row .unit { font-weight: 400; color: #94A3B8; font-size: 12px; }

/* 进度条 */
.progress-track {
  height: 4px;
  background: #F1F5F9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4F46E5;
  border-radius: 2px;
}

/* 时间区域 */
.card-dates {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 20px;
  padding-top: 12px;
  border-top: 1px dashed #E2E8F0;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-separator {
  margin: 0 8px;
  color: #CBD5E1;
}

/* 底部操作区 */
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #FECACA;
  color: #EF4444;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #FEF2F2;
  border-color: #EF4444;
}

.status-closed {
  font-size: 12px;
  color: #CBD5E1;
  font-style: italic;
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
.sk-title { height: 20px; width: 60%; }
.sk-meta { height: 30px; width: 100%; }
.sk-time { height: 12px; width: 40%; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
</style>
