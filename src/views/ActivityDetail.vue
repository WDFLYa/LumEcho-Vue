<template>
  <div class="activity-detail-page" :class="pageTheme">
    <ActivityNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @create="goCreate"
        @profile="goProfile"
    />

    <main class="detail-container" v-if="activity">
      <div class="detail-hero">
        <div class="cover-blur" :style="{ backgroundImage: `url(${activity.coverUrl})` }"></div>
        <div class="cover-content">
          <div class="status-badge" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
          <h1 class="title">{{ activity.title }}</h1>
          <p class="desc">{{ activity.description }}</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <div class="item-icon">📅</div>
            <div class="item-text">
              <div class="label">活动时间</div>
              <div class="value">{{ formatDate(activity.startTime) }} ~ {{ formatDate(activity.endTime) }}</div>
            </div>
          </div>

          <div class="info-item">
            <div class="item-icon">📍</div>
            <div class="item-text">
              <div class="label">活动地点</div>
              <div class="value">{{ activity.location }}</div>
            </div>
          </div>

          <div class="info-item">
            <div class="item-icon">👥</div>
            <div class="item-text">
              <div class="label">参与人数</div>
              <div class="value">
                <span class="num">{{ activity.currentParticipants || 0 }}</span>
                <span class="total">/ {{ activity.maxParticipants }} 人</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <div class="item-icon">📸</div>
            <div class="item-text">
              <div class="label">发起摄影师</div>
              <div class="value">{{ activity.photographerName || '摄影师' }}</div>
            </div>
          </div>

          <div class="info-item">
            <div class="item-icon">🛡️</div>
            <div class="item-text">
              <div class="label">报名审核</div>
              <div class="value">{{ activity.requireAudit ? "需要审核" : "免审核" }}</div>
            </div>
          </div>
        </div>

        <div class="action-box">
          <button
              v-if="activity.status === 0"
              class="join-btn"
              :class="btnTheme"
              :disabled="btnDisabled"
              @click="handleAction"
          >
            {{ btnText }}
          </button>

          <template v-else-if="activity.status === 1">
            <button
                v-if="myApplication?.status === 1"
                class="join-btn btn-approved"
                @click="doCheckIn"
                :disabled="hasChecked"
            >
              {{ hasChecked ? "✅ 已签到" : "📱 立即签到" }}
            </button>
            <button v-else class="join-btn btn-disabled" disabled>
              未报名，无法签到
            </button>
          </template>

          <button
              v-else-if="activity.status === 2"
              class="join-btn btn-disabled"
              disabled
          >
            活动已结束
          </button>
        </div>
      </div>
    </main>

    <div v-else class="loading" style="text-align:center; padding:60px;">
      加载活动详情中...
    </div>
  </div>
</template>

<script>
import ActivityNavBar from "@/components/NavBar/ActivityNavBar.vue";
import {
  getActivityDetail,
  applyActivity,
  applyActivityDirect,
  getMyApplicationStatus,
  cancelApplication,
  activityCheckIn
} from "@/api/activity";

import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "ActivityDetail",
  components: { ActivityNavBar },
  data() {
    return {
      currentUserAvatar: localStorage.getItem('user_avatar') || 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: localStorage.getItem('user_name') || '摄影师',
      activity: null,
      myApplication: null,
      hasChecked: false
    };
  },
  mounted() {
    this.init();
  },
  computed: {
    pageTheme() {
      const map = { 0: "theme-pending", 1: "theme-ongoing", 2: "theme-finished" };
      return map[this.activity?.status || 0];
    },
    btnText() {
      if (this.isFull) return "人数已满";
      const s = this.myApplication?.status;
      if (!this.myApplication) return "立即报名参加";
      if (s === 0) return "申请中，请等待审核";
      if (s === 1) return "报名成功，请按时参加";
      if (s === 2) return "已拒绝";
      if (s === 3) return "已取消报名";
      return "状态异常";
    },
    btnTheme() {
      if (this.isFull) return "btn-full";
      const s = this.myApplication?.status;
      if (!this.myApplication) return "btn-active";
      if (s === 0) return "btn-pending";
      if (s === 1) return "btn-approved";
      if (s === 2 || s === 3) return "btn-disabled";
      return "btn-disabled";
    },
    btnDisabled() {
      if (this.isFull) return true;
      const s = this.myApplication?.status;
      return s !== undefined && s !== null && s !== 1;
    },
    isFull() {
      return (this.activity?.currentParticipants || 0) >= (this.activity?.maxParticipants || 0);
    }
  },
  methods: {
    async init() {
      await this.getActivityDetail();
      await this.getMyApplyStatus();
    },
    async getActivityDetail() {
      try {
        const id = this.$route.params.id;
        const res = await getActivityDetail(id);
        this.activity = res.data.data;
      } catch (err) {
        console.error(err);
        ElMessage.error("获取活动详情失败");
      }
    },
    async getMyApplyStatus() {
      try {
        const id = this.$route.params.id;
        const res = await getMyApplicationStatus(id);
        this.myApplication = res.data.data;
      } catch (err) {
        console.error(err);
      }
    },
    async handleAction() {
      const s = this.myApplication?.status;
      if (s === 1) {
        this.showNiceDialog();
        return;
      }
      if (s === 0 || s === 2 || s === 3) {
        return;
      }
      await this.doApply(this.$route.params.id);
    },
    async doApply(activityId) {
      try {
        if (this.activity.requireAudit) {
          await applyActivity(activityId);
          ElMessage.success("报名成功，等待管理员审核");
        } else {
          await applyActivityDirect(activityId);
          ElMessage.success("报名成功");
        }
        await this.init();
        if (!this.activity.requireAudit) {
          setTimeout(() => {
            this.showNiceDialog();
          }, 300);
        }
      } catch (err) {
        ElMessage.error(err.response?.data?.message || "报名失败");
      }
    },
    async doCancel(applicationId) {
      try {
        await cancelApplication(applicationId);
        ElMessage.success("已取消报名");
        await this.init();
      } catch (err) {
        ElMessage.error("取消失败");
      }
    },
    showNiceDialog() {
      const time = this.formatDate(this.activity.startTime);
      const place = this.activity.location;
      ElMessageBox({
        message: `
          <div style="text-align:center; padding:10px 10px 0;">
            <h2 style="margin:0 0 12px; font-size:17px; font-weight:700; color:#222;">✅ 报名成功</h2>
            <div style="text-align:left; margin:0 auto; max-width:200px; font-size:14px; color:#555; line-height:1.9;">
              <div>📅 活动时间：${time}</div>
              <div>📍 活动地点：${place}</div>
            </div>
            <p style="margin-top:12px; font-size:12px; color:#999;">请按时参加活动</p>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: "我知道了",
        cancelButtonText: "取消报名",
        center: true,
        customClass: "custom-dialog",
        confirmButtonClass: "dialog-btn-ok",
        cancelButtonClass: "dialog-btn-cancel",
      }).then(() => {
      }).catch(() => {
        this.showConfirmCancelDialog();
      });
    },
    showConfirmCancelDialog() {
      ElMessageBox({
        message: `
          <div style="text-align:center; padding:15px 10px;">
            <h3 style="margin:0 0 8px; font-size:16px; color:#333;">确定要取消报名吗？</h3>
            <p style="margin:0; font-size:13px; color:#888;">取消后无法再次报名</p>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: true,
        confirmButtonText: "确定取消",
        cancelButtonText: "返回",
        center: true,
        customClass: "custom-dialog",
        confirmButtonClass: "dialog-btn-danger",
        cancelButtonClass: "dialog-btn-cancel",
      }).then(() => {
        this.doCancel(this.myApplication.id);
      }).catch(() => {
        ElMessage.info("已取消操作");
      });
    },
    async doCheckIn() {
      ElMessage.info("正在获取定位…");
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          await activityCheckIn({
            activityId: this.activity.id,
            latitude: lat,
            longitude: lng
          });
          ElMessage.success("签到成功！");
          this.hasChecked = true;
        } catch (err) {
          const msg = err.response?.data?.message || "签到失败";
          ElMessage.error(msg);
        }
      }, () => {
        ElMessage.error("获取定位失败，请打开定位权限");
      });
    },
    formatDate(time) {
      if (!time) return "";
      const d = new Date(time);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,0)}-${String(d.getDate()).padStart(2,0)} ${String(d.getHours()).padStart(2,0)}:${String(d.getMinutes()).padStart(2,0)}`;
    },
    getStatusClass(status) {
      const map = { 0: "badge-pending", 1: "badge-ongoing", 2: "badge-finished" };
      return map[status];
    },
    getStatusText(status) {
      const map = { 0: "待开始", 1: "进行中", 2: "已结束" };
      return map[status];
    },
    handleSearch() {},
    goCreate() { this.$router.push('/activity/create'); },
    goProfile() { this.$router.push('/profile'); }
  }
};
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  font-family: 'Nunito', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
}
.detail-container {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 20px 60px;
  padding-top: 70px;
}
.theme-pending {
  background: linear-gradient(180deg, #FFF8E1 0%, #FFF 100%);
}
.theme-ongoing {
  background: linear-gradient(180deg, #E8F5E9 0%, #FFF 100%);
}
.theme-finished {
  background: linear-gradient(180deg, #F5F7FA 0%, #FFF 100%);
}
.detail-hero {
  position: relative;
  height: 380px;
  border-radius: 0 0 32px 32px;
  display: flex;
  align-items: flex-end;
  color: #fff;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}
.cover-blur {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.65) blur(2px);
  transform: scale(1.05);
}
.cover-content {
  position: relative;
  z-index: 10;
  padding: 40px 44px;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.status-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.badge-pending { background: #FF9800; }
.badge-ongoing { background: #4CAF50; }
.badge-finished { background: #607D8B; }
.title {
  font-size: 36px;
  font-weight: 900;
  margin: 0 0 12px;
  line-height: 1.3;
}
.desc {
  font-size: 17px;
  opacity: 0.95;
  line-height: 1.6;
  margin: 0;
}
.info-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 36px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.item-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
  margin-top: 4px;
}
.item-text { flex: 1; }
.label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}
.value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
}
.value .num { color: #FF6B35; }
.value .total {
  color: #909399;
  font-weight: 400;
}
.action-box { text-align: center; }
.join-btn {
  width: 100%;
  max-width: 420px;
  padding: 16px 40px;
  border-radius: 100px;
  font-size: 17px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
.btn-active {
  background: linear-gradient(135deg, #FF9800, #FF6B35);
  color: #fff;
}
.btn-active:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 152, 0, 0.3);
}
.btn-disabled {
  background: #B0BEC5 !important;
  color: #fff !important;
  cursor: not-allowed !important;
}
.btn-full {
  background: #FFCC80;
  color: #fff;
  cursor: not-allowed;
}
.btn-pending {
  background: #2196F3;
  color: #fff;
  cursor: not-allowed;
}
.btn-approved {
  background: #4CAF50;
  color: #fff;
  cursor: pointer !important;
}
.btn-approved:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
}
.join-btn:disabled { opacity: 0.9; }

@media (max-width: 768px) {
  .detail-hero { height: 320px; }
  .title { font-size: 28px; }
  .info-grid { grid-template-columns: 1fr; }
  .info-card { padding: 28px 24px; }
  .cover-content { padding: 30px 24px; }
}
</style>

<style>
.custom-dialog {
  border-radius: 20px !important;
  overflow: hidden;
}
.custom-dialog .el-message-box__header {
  display: none !important;
}
.custom-dialog .el-message-box__btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 20px;
}
.dialog-btn-ok {
  border-radius: 20px !important;
  padding: 6px 22px !important;
  background: #4CAF50 !important;
  border-color: #4CAF50 !important;
  color: #fff !important;
}
.dialog-btn-cancel {
  border-radius: 20px !important;
  padding: 6px 22px !important;
  background: #fff !important;
  border: 1px solid #ddd !important;
  color: #666 !important;
}
.dialog-btn-danger {
  border-radius: 20px !important;
  padding: 6px 22px !important;
  background: #F56C6C !important;
  border-color: #F56C6C !important;
  color: #fff !important;
}
</style>