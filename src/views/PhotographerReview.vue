<template>
  <div class="admin-container">
    <AdminNavBar :user-avatar="currentUserAvatar" :user-name="currentUserName" />

    <main class="content-wrapper">

      <!-- header -->
      <header class="page-header">
        <div class="welcome-text">
          <h1>📸 摄影师认证审核中心</h1>
          <p>
            高效处理摄影师资质申请，
            当前共 <span class="highlight">{{ filteredApplications.length }}</span> 条记录。
          </p>
        </div>

        <button class="refresh-btn" @click="fetchApplications" :disabled="loading">
          🔄 {{ loading ? '加载中...' : '刷新数据' }}
        </button>
      </header>

      <!-- filter -->
      <section class="filter-section">
        <div class="filter-chips">
          <button
              v-for="opt in filterOptions"
              :key="opt.value"
              class="filter-chip"
              :class="{ active: filterStatus === opt.value }"
              @click="filterStatus = opt.value"
          >
            {{ opt.label }}
            <span class="chip-count">({{ opt.count }})</span>
          </button>
        </div>
      </section>

      <!-- loading -->
      <div v-if="loading" class="state-card">🚀 加载中...</div>

      <div v-else-if="filteredApplications.length === 0" class="state-card">
        📭 暂无数据
      </div>

      <!-- list -->
      <div v-else class="application-grid">

        <div
            v-for="app in filteredApplications"
            :key="app.id"
            class="review-card"
        >

          <!-- header -->
          <div class="card-header">

            <!-- avatar（修复：用接口） -->
            <div class="avatar-wrapper" :style="{ background: getAvatarGradient(app.id) }">
              <img
                  v-if="app.avatar"
                  :src="app.avatar"
                  style="width:100%;height:100%;border-radius:16px;object-fit:cover"
              />
              <span v-else>
                {{ app.username?.charAt(0) || 'U' }}
              </span>
            </div>

            <div class="header-info">
              <h3>{{ app.username || '加载中...' }}</h3>
              <span class="account-tag">ID: {{ app.userId }}</span>
            </div>

            <div class="status-badge" :class="getStatusClass(app.status)">
              {{ getStatusText(app.status) }}
            </div>

          </div>

          <!-- body -->
          <div class="card-body">

            <!-- 时间 -->
            <div class="info-row">
              <span class="info-label">📅 申请时间</span>
              <span class="info-value">{{ formatDate(app.applyTime) }}</span>
            </div>

            <!-- 描述（你要的重点） -->
            <div class="info-row">
              <span class="info-label">📝 描述</span>
              <span class="info-value">{{ app.description || '—' }}</span>
            </div>

            <!-- 拒绝 -->
            <div v-if="app.status === 2" class="info-row reject-row">
              <span class="info-label">❌ 理由</span>
              <span class="info-value">{{ app.rejectReason || '无' }}</span>
            </div>

          </div>

          <!-- footer -->
          <div class="card-footer">

            <template v-if="app.status === 0">
              <button class="action-btn approve" @click="handleReview(app.id, 1)">
                ✅ 通过
              </button>
              <button class="action-btn reject" @click="openRejectDialog(app.id)">
                ❌ 拒绝
              </button>
            </template>

            <span v-else class="footer-note">
              已处理 · {{ getStatusText(app.status) }}
            </span>

          </div>

        </div>

      </div>

    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getPhotographerList, reviewPhotographer } from "@/api/photographer";
import { getUserById, getCurrentUserInfo } from "@/api/auth";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "AdminPhotographerReview",
  components: { AdminNavBar },

  data() {
    return {
      currentUserAvatar: "http://47.116.108.205:9000/lumecho/avatar.png",
      currentUserName: "Admin",

      loading: false,
      filterStatus: 0,
      applicationList: []
    };
  },

  computed: {
    filterOptions() {
      const all = this.applicationList;
      return [
        { label: "全部", value: null, count: all.length },
        { label: "待审核", value: 0, count: all.filter(i => i.status === 0).length },
        { label: "已通过", value: 1, count: all.filter(i => i.status === 1).length },
        { label: "已拒绝", value: 2, count: all.filter(i => i.status === 2).length }
      ];
    },

    filteredApplications() {
      if (this.filterStatus === null || this.filterStatus === undefined) {
        return this.applicationList;
      }
      return this.applicationList.filter(app => app.status === this.filterStatus);
    }
  },

  mounted() {
    this.fetchApplications();
    this.fetchUserInfo(); // 👈 就加这一行
  },

  methods: {
    // 👋 加这个方法
    async fetchUserInfo() {

        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserName = data.username;
          this.currentUserAvatar = data.avatar;
        }

    },

    // =========================
    // 获取 + 补用户信息（关键）
    // =========================
    async fetchApplications() {
      this.loading = true;

      try {
        const res = await getPhotographerList();
        const list = res.data.data || [];

        const result = await Promise.all(
            list.map(async (item) => {
              try {
                const userRes = await getUserById(item.userId);
                const user = userRes.data.data;

                return {
                  ...item,
                  username: user?.username,
                  avatar: user?.avatar
                };
              } catch (e) {
                return {
                  ...item,
                  username: "未知用户",
                  avatar: null
                };
              }
            })
        );

        this.applicationList = result;

      } finally {
        this.loading = false;
      }
    },

    handleReview(id, status) {
      ElMessageBox.confirm("确定通过？", "提示").then(() => {
        this.submitReview(id, status, null);
      });
    },

    openRejectDialog(id) {
      ElMessageBox.prompt("拒绝理由").then(({ value }) => {
        this.submitReview(id, 2, value);
      });
    },

    async submitReview(id, status, reason) {
      await reviewPhotographer(id, status, reason);
      ElMessage.success("操作成功");
      this.fetchApplications();
    },

    getStatusText(s) {
      return { 0: "待审核", 1: "通过", 2: "拒绝" }[s];
    },

    getStatusClass(s) {
      return {
        0: "status-pending",
        1: "status-approved",
        2: "status-rejected"
      }[s];
    },

    formatDate(d) {
      return d ? new Date(d).toLocaleString("zh-CN") : "—";
    },

    getAvatarGradient(id) {
      const arr = [
        "linear-gradient(135deg,#a8edea,#fed6e3)",
        "linear-gradient(135deg,#ffecd2,#fcb69f)",
        "linear-gradient(135deg,#d4fc79,#96e6a1)",
        "linear-gradient(135deg,#a18cd1,#fbc2eb)"
      ];
      return arr[id % arr.length];
    }
  }
};
</script>
<style scoped>
/* 你的原样式完全保留，不动 */
</style>

<style scoped>
/* ================= 基础容器 (完全对齐首页) ================= */
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

/* ================= 页面头部 ================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

.refresh-btn {
  background: #fff;
  border: 1px solid #E1F5FE;
  color: #0277BD;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(129, 212, 250, 0.15);
  transition: all 0.2s;
}
.refresh-btn:hover:not(:disabled) {
  background: #E1F5FE;
  transform: translateY(-2px);
}
.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ================= 筛选标签栏 ================= */
.filter-section {
  margin-bottom: 30px;
}

.filter-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-chip {
  background: #fff;
  border: 1px solid #F0F4F8;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #90A4AE;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(100, 181, 246, 0.05);
  transition: all 0.25s ease;
}

.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(100, 181, 246, 0.12);
}

.filter-chip.active {
  background: #0288D1;
  color: #fff;
  border-color: #0288D1;
  box-shadow: 0 5px 15px rgba(2, 136, 209, 0.25);
}

.chip-count {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 4px;
}

/* ================= 状态提示卡片 ================= */
.state-card {
  background: #fff;
  border-radius: 24px;
  padding: 60px 20px;
  text-align: center;
  font-size: 16px;
  color: #90A4AE;
  box-shadow: 0 5px 15px rgba(100, 181, 246, 0.05);
  border: 1px solid #F0F4F8;
}

/* ================= 申请列表网格 ================= */
.application-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* ================= 审核卡片核心样式 ================= */
.review-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #F0F4F8;
  box-shadow: 0 5px 15px rgba(100, 181, 246, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.review-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 15px 30px rgba(129, 212, 250, 0.18);
  border-color: #B3E5FC;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: inset 0 0 15px rgba(255,255,255,0.4);
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #37474F;
  line-height: 1.2;
}

.account-tag {
  font-size: 12px;
  color: #90A4AE;
  font-weight: 600;
}

/* 状态徽标 */
.status-badge {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-pending { background: #FFF3E0; color: #E65100; }
.status-approved { background: #E8F5E9; color: #2E7D32; }
.status-rejected { background: #FFEBEE; color: #C62828; }

/* 卡片主体 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #546E7A;
  padding-bottom: 8px;
  border-bottom: 1px dashed #F0F4F8;
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }

.info-label {
  font-weight: 700;
  color: #78909C;
  min-width: 70px;
}

.info-value {
  flex: 1;
  text-align: right;
  color: #37474F;
  word-break: break-all;
}

.reject-row .info-value {
  color: #C62828;
  background: #FFEBEE;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

/* 卡片底部操作 */
.card-footer {
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid #F5F7FA;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.action-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.approve {
  background: #C8E6C9;
  color: #2E7D32;
}
.action-btn.approve:hover {
  background: #A5D6A7;
  transform: scale(1.05);
}

.action-btn.reject {
  background: #FFCDD2;
  color: #C62828;
}
.action-btn.reject:hover {
  background: #EF9A9A;
  transform: scale(1.05);
}

.footer-note {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #90A4AE;
  font-weight: 600;
}

/* ================= 响应式 ================= */
@media (max-width: 900px) {
  .content-wrapper { padding: 20px; }
  .application-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
}

@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .filter-chips { justify-content: center; }
  .card-header { flex-wrap: wrap; }
  .status-badge { margin-left: 62px; margin-top: 4px; }
}
</style>
