<template>
  <div class="admin-review-container">
    <!-- 1. 管理员导航栏 -->
    <AdminNavBar :user-avatar="currentUserAvatar" :user-name="currentUserName" />

    <main class="content-wrapper">
      <!-- 2. 页面头部 -->
      <header class="page-header">
        <div class="header-left">
          <h1>📸 摄影师认证审核中心</h1>
          <p class="subtitle">高效处理摄影师资质申请，维护社区专业度</p>
        </div>
        <div class="header-right">
          <el-button
              :loading="loading"
              type="primary"
              @click="fetchApplications"
              icon="Refresh"
          >
            刷新数据
          </el-button>
        </div>
      </header>

      <!-- 3. 筛选与统计栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" size="large">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button label="0">
            <el-tag type="warning" effect="dark">待审核</el-tag>
          </el-radio-button>
          <el-radio-button label="1">
            <el-tag type="success" effect="dark">已通过</el-tag>
          </el-radio-button>
          <el-radio-button label="2">
            <el-tag type="danger" effect="dark">已拒绝</el-tag>
          </el-radio-button>
        </el-radio-group>

        <div class="total-count">
          <el-statistic :value="filteredApplications.length" :prefix="`当前显示 `">
            <template #suffix>
              <span style="color: #666;"> 个申请 </span>
            </template>
          </el-statistic>
        </div>
      </div>

      <!-- 4. 申请列表 -->
      <div class="application-list-wrapper">
        <!-- 加载中状态 -->
        <div v-if="loading" class="loading-state">
          <el-empty description="数据加载中..." :image-size="60">
            <el-button type="primary" disabled>🔄</el-button>
          </el-empty>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredApplications.length === 0" class="empty-state">
          <el-empty description="暂无符合条件的申请记录" :image-size="100">
            <el-button type="primary" @click="filterStatus = null">查看全部</el-button>
          </el-empty>
        </div>

        <!-- 申请卡片网格 -->
        <div v-else class="application-grid">
          <el-card
              v-for="app in filteredApplications"
              :key="app.id"
              class="application-card"
              shadow="hover"
              :body-style="{ padding: '24px' }"
          >
            <template #header>
              <div class="card-header">
                <div class="applicant-meta">
                  <h3 class="applicant-name">{{ app.realName }}</h3>
                  <el-tag size="small" type="info">@{{ app.account }}</el-tag>
                </div>
                <el-tag
                    :type="app.status === 0 ? 'warning' : app.status === 1 ? 'success' : 'danger'"
                    effect="dark"
                >
                  {{ getStatusText(app.status) }}
                </el-tag>
              </div>
            </template>

            <!-- 主体信息 -->
            <div class="card-body">
              <div class="info-row">
                <span class="label">📱 手机号</span>
                <span class="value">{{ app.phone }}</span>
              </div>
              <div class="info-row">
                <span class="label">💼 认证类型</span>
                <span class="value">{{ app.serviceType || '未选择' }}</span>
              </div>
              <div class="info-row">
                <span class="label">📅 申请时间</span>
                <span class="value">{{ formatDate(app.createTime) }}</span>
              </div>
            </div>

            <!-- 底部操作 -->
            <template #footer>
              <div class="card-footer">
                <!-- 待审核显示操作按钮 -->
                <div v-if="app.status === 0" class="action-buttons">
                  <el-button
                      type="success"
                      size="small"
                      @click="handleReview(app.id, 1)"
                      icon="CircleCheck"
                  >
                    通过
                  </el-button>
                  <el-button
                      type="danger"
                      size="small"
                      @click="openRejectDialog(app.id)"
                      icon="CircleClose"
                  >
                    拒绝
                  </el-button>
                </div>

                <!-- 已拒绝显示理由 -->
                <div v-else-if="app.status === 2" class="reject-reason">
                  <el-alert
                      title="拒绝理由"
                      :description="app.rejectReason || '无'"
                      type="error"
                      show-icon
                      :closable="false"
                      effect="dark"
                  />
                </div>
              </div>
            </template>
          </el-card>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getPhotographerList, reviewPhotographer } from "@/api/photographer";
// 引入 Element Plus 组件和样式
import { ElMessage, ElMessageBox, ElCard, ElButton, ElTag, ElEmpty, ElStatistic, ElRadioGroup, ElRadioButton, ElAlert } from 'element-plus';

export default {
  name: "AdminPhotographerReview",
  components: {
    AdminNavBar,
    ElCard,
    ElButton,
    ElTag,
    ElEmpty,
    ElStatistic,
    ElRadioGroup,
    ElRadioButton,
    ElAlert
  },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: 'Admin',
      loading: false,
      searchQuery: '',
      filterStatus: 0,
      applicationList: []
    };
  },
  computed: {
    filteredApplications() {
      return this.applicationList.filter(app => {
        const keyword = this.searchQuery.toLowerCase();
        const matchKeyword = !this.searchQuery ||
            app.realName?.toLowerCase().includes(keyword) ||
            app.account?.toLowerCase().includes(keyword) ||
            app.phone?.includes(keyword);
        const matchStatus = this.filterStatus === null || app.status === this.filterStatus;
        return matchKeyword && matchStatus;
      });
    }
  },
  mounted() {
    this.fetchApplications();
  },
  methods: {
    goProfile() {
      this.$router.push("/admin/profile");
    },
    showToast(msg, type = "success") {
      // 使用 Element Plus 的 Message 组件
      ElMessage({
        message: msg,
        type: type,
        duration: 2000,
        center: true
      });
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
      return isNaN(date.getTime()) ? dateStr : date.toLocaleString('zh-CN');
    },
    getStatusText(status) {
      const texts = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
      return texts[status] || '未知';
    },

    async fetchApplications() {
      this.loading = true;
      try {
        const res = await getPhotographerList();
        if (res.data && res.data.code === 200) {
          this.applicationList = res.data.data || [];
          this.showToast('数据刷新成功', 'success');
        } else {
          this.showToast(res.data?.message || "获取列表失败", "error");
        }
      } catch (error) {
        this.showToast("网络连接异常", "error");
      } finally {
        this.loading = false;
      }
    },

    // 核心优化：使用 MessageBox 替代原生 Prompt
    openRejectDialog(id) {
      ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.{5,50}/, // 限制字数 5-50
        inputErrorMessage: '理由长度必须在 5-50 个字符之间',
        type: 'warning',
        inputPlaceholder: '请填写拒绝的具体原因，例如：资质照片模糊、信息不实等'
      }).then(({ value }) => {
        this.submitReview(id, 2, value);
      }).catch(() => {
        // 取消操作，不执行任何事
      });
    },

    async handleReview(id, status) {
      if (status === 2) {
        this.openRejectDialog(id);
      } else {
        ElMessageBox.confirm(
            '确定要通过该摄影师的认证吗？通过后用户将获得摄影师权限。',
            '确认通过',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success',
              icon: '' // 如果有自定义图标可以引入
            }
        ).then(() => {
          this.submitReview(id, 1, null);
        });
      }
    },

    async submitReview(id, status, reason) {
      try {
        await reviewPhotographer(id, status, reason);
        this.showToast(`审核操作成功`, "success");
        this.fetchApplications(); // 刷新
      } catch (error) {
        this.showToast("操作失败，请重试", "error");
      }
    }
  }
};
</script>

<style scoped>
/* 全局美化 */
.admin-review-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
  padding: 20px 0;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subtitle {
  margin: 4px 0 0 34px;
  color: #6b7280;
  font-size: 14px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.total-count {
  font-weight: 500;
  color: #4b5563;
}

/* 列表网格 */
.application-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

/* 卡片样式 */
.application-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -4px rgba(15, 20, 25, 0.15) !important;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.applicant-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.applicant-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* 卡片内容 */
.card-body {
  padding: 0;
}

.info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px dashed #e5e7eb;
  font-size: 14px;
  color: #4b5563;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4f46e5;
  min-width: 80px;
}

.value {
  flex: 1;
  color: #111827;
  word-break: break-all;
}

/* 卡片底部 */
.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header, .filter-bar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .header-right {
    margin-top: 16px;
  }

  .application-grid {
    grid-template-columns: 1fr;
  }
}
</style>