<template>
  <div class="admin-user-container">
    <!-- 1. 管理员导航栏 -->
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @profile="goProfile"
    />

    <main class="content-wrapper">
      <!-- 2. 页面头部 -->
      <header class="page-header">
        <div class="header-left">
          <h1>👥 用户管理中心</h1>
          <p>监控平台用户动态，管理账户权限与状态。</p>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="fetchUsers" :disabled="loading">
            <span :class="{ 'spin': loading }">🔄</span> 刷新数据
          </button>
        </div>
      </header>

      <!-- 3. 筛选与统计栏 -->
      <div class="filter-bar">
        <div class="status-tabs">
          <span
              class="tab-item"
              :class="{ active: filterStatus === null }"
              @click="setFilter(null)"
          >全部用户</span>
          <span
              class="tab-item status-normal"
              :class="{ active: filterStatus === 1 }"
              @click="setFilter(1)"
          >✅ 正常活跃</span>
          <span
              class="tab-item status-disabled"
              :class="{ active: filterStatus === 0 }"
              @click="setFilter(0)"
          >🚫 已禁用</span>
        </div>
        <div class="total-count">
          当前显示 <strong>{{ filteredUsers.length }}</strong> 位用户
        </div>
      </div>

      <!-- 4. 用户列表 -->
      <div class="user-list-wrapper">

        <!-- 加载中状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>正在同步用户数据...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading && filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>暂无相关用户</h3>
          <p>尝试调整搜索关键词或筛选条件</p>
        </div>

        <!-- 用户卡片网格 -->
        <div v-else class="user-grid">
          <div
              class="user-card"
              v-for="user in filteredUsers"
              :key="user.account"
          >
            <!-- 左侧：身份标识 -->
            <div class="card-main">
              <div class="avatar-wrapper">
                <img
                    :src="user.avatar || defaultAvatar"
                    alt="avatar"
                    class="user-avatar"
                    @error="$event.target.src = defaultAvatar"
                />
                <span class="role-indicator" :class="user.role === 'admin' ? 'admin' : 'user'" :title="user.role === 'admin' ? '管理员' : '普通用户'">
                  {{ user.role === 'admin' ? 'A' : 'U' }}
                </span>
              </div>

              <div class="user-details">
                <div class="name-row">
                  <h3 class="username">{{ user.username || '未知用户' }}</h3>
                  <span class="account-badge">@{{ user.account }}</span>
                </div>

                <div class="contact-info">
                  <div class="info-item" v-if="user.email">
                    <span class="icon">📧</span> {{ user.email }}
                  </div>
                  <div class="info-item" v-if="user.phone">
                    <span class="icon">📱</span> {{ user.phone }}
                  </div>
                  <div class="info-item time">
                    <span class="icon">📅</span> 注册于 {{ formatDate(user.createTime) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：状态操作 (美化版) -->
            <div class="card-action">
              <div class="status-toggle" @click="toggleStatus(user)">
                <span
                    class="toggle-label"
                    :class="user.status === 1 ? 'active' : 'inactive'"
                >
                  {{ user.status === 1 ? '正常' : '禁用' }}
                </span>
                <span class="toggle-switch" :class="{ 'is-disabled': user.status === 0 }"></span>
              </div>

              <span v-if="changingUserId === user.account" class="action-status saving">
                保存中...
              </span>
              <span v-else class="action-status idle">
                点击切换状态
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getUserList, updateUserStatus } from "@/api/auth";

export default {
  name: "AdminUserManage",
  components: { AdminNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: 'Admin',
      // 使用一个更通用的默认头像
      defaultAvatar: 'https://ui-avatars.com/api/?background=random&name=User',

      loading: false,
      searchQuery: '',
      filterStatus: null,

      userList: [],
      changingUserId: null
    };
  },
  computed: {
    filteredUsers() {
      return this.userList.filter(user => {
        const keyword = this.searchQuery.toLowerCase();
        const matchKeyword = !this.searchQuery ||
            (user.username && user.username.toLowerCase().includes(keyword)) ||
            (user.account && user.account.toLowerCase().includes(keyword)) ||
            (user.phone && user.phone.includes(keyword));

        const matchStatus = this.filterStatus === null || user.status === this.filterStatus;
        return matchKeyword && matchStatus;
      });
    }
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    goProfile() { this.$router.push("/admin/profile"); },

    showToast(msg, type = "success") {
      if (this.$message) {
        this.$message[type](msg);
      } else {
        // 简单的自定义 Toast 逻辑，如果没有 Element Plus
        console.log(`[${type}] ${msg}`);
        alert(msg);
      }
    },

    handleSearch(query) {
      this.searchQuery = query;
    },

    setFilter(status) {
      this.filterStatus = status;
    },

    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('zh-CN');
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const res = await getUserList();
        if (res.data && res.data.code === 200) {
          this.userList = res.data.data || [];
        } else {
          this.showToast(res.data?.message || "获取失败", "error");
        }
      } catch (error) {
        console.error(error);
        this.showToast("网络连接异常", "error");
      } finally {
        this.loading = false;
      }
    },

    // ✅ 点击切换状态
    async toggleStatus(user) {
      // 如果正在操作中，防止重复点击
      if (this.changingUserId) return;

      const newStatus = user.status === 1 ? 0 : 1;
      const oldStatus = user.status;

      // 乐观更新
      user.status = newStatus;
      this.changingUserId = user.account;

      try {
        await updateUserStatus(user.account, newStatus);
        this.showToast(`已将 ${user.username} 设为${newStatus === 1 ? '正常' : '禁用'}`, "success");
      } catch (error) {
        // 失败回滚
        user.status = oldStatus;
        this.showToast("操作失败，请重试", "error");
      } finally {
        this.changingUserId = null;
      }
    }
  }
};
</script>

<style scoped>
/* --- 全局容器 --- */
.admin-user-container {
  min-height: 100vh;
  background-color: #F8FAFC; /* 更冷的背景色，显得专业 */
  background-image: radial-gradient(#E2E8F0 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #334155;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* --- 头部区域 --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 20px;
}

.header-left h1 {
  font-size: 26px;
  font-weight: 800;
  color: #1E293B;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.header-left p {
  margin: 0;
  color: #64748B;
  font-size: 14px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #CBD5E1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
  background: #EFF6FF;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- 筛选栏 --- */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 24px;
  border: 1px solid #E2E8F0;
}

.status-tabs {
  display: flex;
  gap: 4px;
}

.tab-item {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item:hover {
  background: #F1F5F9;
  color: #334155;
}

.tab-item.active {
  background: #3B82F6;
  color: #fff;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.total-count {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.total-count strong {
  color: #3B82F6;
  font-weight: 700;
}

/* --- 用户列表网格 --- */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
  border-color: #BFDBFE;
}

/* 左侧主要信息 */
.card-main {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 14px; /* 稍微方一点的圆角，更现代 */
  object-fit: cover;
  border: 1px solid #F1F5F9;
}

.role-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.role-indicator.admin { background: #F59E0B; } /* Amber */
.role-indicator.user { background: #3B82F6; }   /* Blue */

.user-details {
  flex: 1;
  min-width: 0; /* 防止文本溢出撑开 */
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.username {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-badge {
  font-size: 11px;
  color: #64748B;
  background: #F1F5F9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  font-size: 12px;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-item .icon {
  font-size: 12px;
  opacity: 0.7;
}

.info-item.time {
  color: #94A3B8;
  font-size: 11px;
  margin-top: 2px;
}

/* 右侧操作区 */
.card-action {
  border-top: 1px dashed #E2E8F0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

/* 模拟 iOS 开关的样式 */
.status-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
  transition: background 0.2s;
}

.status-toggle:hover {
  background: #F8FAFC;
}

.toggle-label {
  font-size: 12px;
  font-weight: 700;
  transition: color 0.3s;
}

.toggle-label.active { color: #10B981; } /* Green */
.toggle-label.inactive { color: #EF4444; } /* Red */

.toggle-switch {
  width: 36px;
  height: 20px;
  background: #E2E8F0;
  border-radius: 20px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 激活状态 (正常) */
.toggle-switch:not(.is-disabled) {
  background: #10B981;
}
.toggle-switch:not(.is-disabled)::after {
  transform: translateX(16px);
}

/* 禁用状态 */
.toggle-switch.is-disabled {
  background: #CBD5E1;
}
.toggle-switch.is-disabled::after {
  transform: translateX(0);
}

.action-status {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-status.saving { color: #F59E0B; }
.action-status.idle { color: #94A3B8; }

/* 空状态 & 加载状态 */
.loading-state, .empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed #CBD5E1;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #475569;
}

.empty-state p {
  margin: 0;
  color: #94A3B8;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E2E8F0;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
