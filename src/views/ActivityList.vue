<template>
  <div class="activity-page">
    <ActivityNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @create="goCreate"
        @profile="goProfile"
    />

    <main class="content-area">
      <div class="page-header">
        <h2>🎨 摄影活动 · 发现身边的美</h2>
        <p>线下采风 · 主题创作 · 大师面对面</p>
      </div>

      <div class="filter-tools">
        <div class="tabs">
          <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-btn', { active: currentTab === tab.key }]"
              @click="currentTab = tab.key; fetchActivities()"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="activity-grid">
        <div
            v-for="act in activityList"
            :key="act.id"
            class="a-card"
            @click="goDetail(act.id)"
        >
          <div class="card-top">
            <span :class="['status-badge', getStatusClass(act.status)]">
              {{ getStatusText(act.status) }}
            </span>
            <span v-if="act.requireAudit" class="audit-tag">🛡️ 需审核</span>
          </div>

          <div class="card-body">
            <div class="cover-box">
              <img
                  v-if="act.coverUrl"
                  :src="act.coverUrl"
                  alt="封面"
                  class="cover-img"
              >
              <div v-else class="a-cover-placeholder" :style="getGradientStyle(act.id)">
                <span class="placeholder-icon">📷</span>
              </div>
              <div class="time-overlay">
                <span>{{ formatDate(act.startTime) }}</span>
                <span>➜</span>
                <span>{{ formatDate(act.endTime) }}</span>
              </div>
            </div>

            <h3 class="a-title">{{ act.title }}</h3>
            <div class="location-row">
              <span>📍</span>
              <span>{{ act.location }}</span>
            </div>
            <p class="a-desc">{{ truncate(act.description, 50) }}</p>
          </div>

          <div class="card-footer">
            <div class="organizer-info">
              <span>发起者:</span>
              <span>{{ act.photographerName || '摄影师' }}</span>
            </div>
            <div class="progress-section">
              <div class="p-count">
                {{ act.currentParticipants || 0 }} / {{ act.maxParticipants }}
              </div>
              <div class="progress-bar-bg">
                <div
                    class="progress-bar-fill"
                    :style="{ width: getProgressPercent(act) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activityList.length === 0" class="empty-state">
        <div class="empty-icon">🎞️</div>
        <p>暂无相关活动</p>
      </div>
    </main>
  </div>
</template>

<script>
import ActivityNavBar from "@/components/NavBar/ActivityNavBar.vue";
import { getActivityList } from "@/api/activity";
import { getCurrentUserInfo } from "@/api/auth";
import { ElMessage } from 'element-plus';

export default {
  name: "ActivityList",
  components: { ActivityNavBar },
  data() {
    return {
      currentUserAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      currentUserName: '摄影师',
      activityList: [],
      currentTab: 'all',
      searchQuery: '',  // ✅ 修复：加了搜索关键词
      tabs: [
        { key: 'all', label: '全部活动' },
        { key: 0, label: '待开始' },
        { key: 1, label: '进行中' },
        { key: 2, label: '已结束' }
      ]
    };
  },
  mounted() {
    this.fetchActivities();
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;
        if (data) {
          this.currentUserAvatar = data.avatar || this.currentUserAvatar;
          this.currentUserName = data.username || this.currentUserName;
        }
      } catch (e) {
        console.warn("获取用户信息失败");
      }
    },
    async fetchActivities() {
      try {
        // ✅ 修复：传 status + keyword 给后端
        const status = this.currentTab === 'all' ? null : this.currentTab;
        const res = await getActivityList(status, this.searchQuery, 1, 100);

        this.activityList = res.data.data || [];
      } catch (err) {
        ElMessage.error('获取活动失败');
        console.error(err);
      }
    },

    // ✅ 修复：搜索方法
    handleSearch(query) {
      this.searchQuery = query;
      this.fetchActivities();
    },

    goCreate() {
      this.$router.push('/activity/create');
    },
    goProfile() {
      this.$router.push('/profile');
    },
    goDetail(id) {
      this.$router.push(`/activity/${id}`);
    },

    truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.slice(0, len) + '...' : str;
    },
    getStatusClass(status) {
      const cls = { 0: 'status-pending', 1: 'status-ongoing', 2: 'status-finished' };
      return cls[status] || 'status-pending';
    },
    getStatusText(status) {
      const map = { 0: '报名中', 1: '进行中', 2: '已结束' };
      return map[status] || '未知';
    },
    getProgressPercent(act) {
      if (!act.maxParticipants) return 0;
      return Math.min(100, (act.currentParticipants || 0) / act.maxParticipants * 100);
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return (d.getMonth() + 1) + '/' + d.getDate();
    },
    getGradientStyle(id) {
      const h = [260, 280, 300, 320][id % 4];
      return {
        background: `linear-gradient(135deg, hsl(${h},70%,90%), hsl(${h+20},80%,80%))`
      };
    }
  }
};
</script>

<style scoped>
.activity-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%);
  font-family: 'Nunito', sans-serif;
  color: #5D4037;
}
.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-header h2 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: #6A1B9A;
  font-weight: 900;
}
.page-header p {
  color: #FFA000;
  font-size: 1.1rem;
  font-weight: 600;
}
.filter-tools {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 30px;
  background: #FFF;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 160, 0, 0.1);
  border: 1px solid #FFE0B2;
}
.tabs { display: flex; gap: 10px; }
.tab-btn {
  padding: 8px 20px;
  border: none;
  background: #FFF3E0;
  color: #EF6C00;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}
.tab-btn.active {
  background: linear-gradient(135deg, #FFB300, #FFA000);
  color: #FFF;
}
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}
.a-card {
  background: #FFF;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s;
  border: 1px solid #FFF3E0;
  display: flex;
  flex-direction: column;
}
.a-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(255, 179, 0, 0.15);
  border-color: #FFB300;
}
.card-top {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  background: #FAFAFA;
}
.status-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
}
.status-pending { background: #E3F2FD; color: #1976D2; }
.status-ongoing { background: #E8F5E9; color: #388E3C; }
.status-finished { background: #F5F5F5; color: #9E9E9E; }
.audit-tag {
  font-size: 11px;
  color: #F57F17;
  background: #FFF8E1;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid #FFE0B2;
}
.card-body {
  padding: 20px;
  flex: 1;
}
.cover-box {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  margin-bottom: 15px;
  background: #EEE;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.a-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(255,255,255,0.8);
}
.time-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 20px;
  color: #FFF;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
}
.a-title {
  font-size: 18px;
  font-weight: 800;
  color: #4A148C;
  margin: 0 0 8px 0;
}
.location-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #EF6C00;
  font-weight: 700;
  margin-bottom: 8px;
}
.a-desc {
  font-size: 13px;
  color: #795548;
  line-height: 1.6;
}
.card-footer {
  padding: 15px 20px;
  background: #FFF;
  border-top: 1px solid #FFF3E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.organizer-info {
  font-size: 12px;
  color: #8D6E63;
}
.progress-section {
  width: 140px;
  text-align: right;
}
.p-count {
  font-size: 12px;
  font-weight: 800;
  color: #EF6C00;
  margin-bottom: 4px;
}
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #FFE0B2;
  border-radius: 3px;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB300, #FFA000);
  border-radius: 3px;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #A1887F;
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}
</style>