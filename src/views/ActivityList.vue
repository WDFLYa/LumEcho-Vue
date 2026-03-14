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
      <!-- 头部：更有艺术感的标语 -->
      <div class="page-header">
        <h2>🎨 摄影活动 · 发现身边的美</h2>
        <p>线下采风 · 主题创作 · 大师面对面</p>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-tools">
        <div class="tabs">
          <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-btn', { active: currentTab === tab.key }]"
              @click="currentTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="sorter">
          <select v-model="sortBy" @change="fetchActivities">
            <option value="latest">最新发布</option>
            <option value="hot">最热报名</option>
            <option value="nearby">距离最近</option>
          </select>
        </div>
      </div>

      <!-- 活动卡片网格 -->
      <div class="activity-grid">
        <div
            v-for="act in activityList"
            :key="act.id"
            class="a-card"
            @click="goDetail(act.id)"
        >
          <!-- 顶部：状态与审核提示 -->
          <div class="card-top">
            <span :class="['status-badge', getStatusClass(act.status)]">
              {{ getStatusText(act.status) }}
            </span>
            <span v-if="act.requireAudit" class="audit-tag" title="作品需审核">
              🛡️ 需审核
            </span>
          </div>

          <!-- 主体：封面与内容 -->
          <div class="card-body">
            <div class="cover-box">
              <!-- 如果有 coverImage 就用，没有就用渐变占位 -->
              <img v-if="act.coverImage" :src="act.coverImage" class="a-cover" alt="cover" />
              <div v-else class="a-cover-placeholder" :style="getGradientStyle(act.id)">
                <span class="placeholder-icon">📷</span>
              </div>

              <div class="time-overlay">
                <span class="date-start">{{ formatDate(act.startTime) }}</span>
                <span class="arrow">➜</span>
                <span class="date-end">{{ formatDate(act.endTime) }}</span>
              </div>
            </div>

            <h3 class="a-title">{{ act.title }}</h3>

            <!-- 地点信息 -->
            <div class="location-row">
              <span class="loc-icon">📍</span>
              <span class="loc-text">{{ formatLocation(act) }}</span>
            </div>

            <p class="a-desc">{{ truncate(act.description, 50) }}</p>
          </div>

          <!-- 底部：人数进度 -->
          <div class="card-footer">
            <div class="organizer-info">
              <span class="org-label">发起者:</span>
              <span class="org-name">{{ act.photographerName || '官方' }}</span>
            </div>

            <div class="progress-section">
              <div class="p-count">
                <span class="num">{{ act.currentParticipants }}</span>
                <span class="total">/ {{ act.maxParticipants }}</span>
              </div>
              <div class="progress-bar-bg">
                <div
                    class="progress-bar-fill"
                    :style="{ width: getProgressPercent(act) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 悬停时的行动按钮 -->
          <div class="hover-action">
            <button class="join-btn">立即报名</button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="activityList.length === 0" class="empty-state">
        <div class="empty-icon">🎞️</div>
        <p>暂无相关活动，期待你的发起！</p>
      </div>
    </main>
  </div>
</template>

<script>
import ActivityNavBar from "@/components/NavBar/ActivityNavBar.vue";


export default {
  name: "ActivityList",
  components: { ActivityNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: '摄影师',
      activityList: [],
      currentTab: 'all',
      sortBy: 'latest',
      searchQuery: '',
      tabs: [
        { key: 'all', label: '全部活动' },
        { key: '0', label: '待开始' },
        { key: '1', label: '进行中' },
        { key: '2', label: '已结束' }
      ]
    };
  },
  mounted() {
    this.fetchActivities();
  },
  methods: {
    async fetchActivities() {
      // TODO: 替换为真实 API
      // const res = await api.getActivities({ status: this.currentTab, sort: this.sortBy });

      // Mock 数据演示
      this.activityList = [
        {
          id: 101,
          title: "秋日颐和园·古风人像采风",
          description: "一起探索颐和园的秋色，拍摄古风人像，专业模特带队。",
          startTime: new Date(Date.now() + 86400000 * 2),
          endTime: new Date(Date.now() + 86400000 * 2.5),
          location: "北京市海淀区", // 简化处理，实际可能关联 Address 对象
          addressDetail: "颐和园东宫门",
          maxParticipants: 20,
          currentParticipants: 15,
          photographerId: 1,
          photographerName: "老张摄影",
          status: 0, // PENDING
          requireAudit: true,
          coverImage: null
        },
        {
          id: 102,
          title: "城市夜景·车流光轨教学",
          description: "手把手教你拍摄车流光轨，适合新手入门。",
          startTime: new Date(Date.now() - 86400000),
          endTime: new Date(Date.now() + 86400000 * 5),
          location: "北京市朝阳区",
          addressDetail: "国贸三期天桥",
          maxParticipants: 30,
          currentParticipants: 28,
          photographerId: 2,
          photographerName: "光影魔术师",
          status: 1, // ONGOING
          requireAudit: false,
          coverImage: null
        },
        {
          id: 103,
          title: "胡同里的烟火气",
          description: "记录老北京最真实的日常生活。",
          startTime: new Date(Date.now() - 86400000 * 10),
          endTime: new Date(Date.now() - 86400000 * 1),
          location: "北京市东城区",
          addressDetail: "南锣鼓巷周边",
          maxParticipants: 50,
          currentParticipants: 50,
          photographerId: 3,
          photographerName: "纪实君",
          status: 2, // FINISHED
          requireAudit: true,
          coverImage: null
        }
      ];
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.fetchActivities();
    },
    goCreate() { this.$router.push('/activity/create'); },
    goProfile() { this.$router.push('/profile'); },
    goDetail(id) { this.$router.push(`/activity/${id}`); },

    // 工具函数
    truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len) + '...' : str;
    },
    // 格式化地点：兼容 Address 对象或纯字符串
    formatLocation(act) {
      if (!act.location) return '地点待定';
      // 如果 location 是字符串直接返回，如果是 Address 对象则拼接
      if (typeof act.location === 'string') {
        return act.addressDetail ? `${act.location} · ${act.addressDetail}` : act.location;
      }
      // 假设 location 是 Address 对象的情况 (根据你的 Address 类)
      const addr = act.location;
      return `${addr.province || ''}${addr.city || ''}${addr.district || ''} ${addr.detail || ''}`;
    },
    getStatusClass(status) {
      switch(status) {
        case 0: return 'status-pending'; // 待开始 - 蓝色
        case 1: return 'status-ongoing'; // 进行中 - 绿色/金色
        case 2: return 'status-finished'; // 已结束 - 灰色
        default: return 'status-pending';
      }
    },
    getStatusText(status) {
      const map = { 0: '待开始', 1: '报名中', 2: '已结束' };
      return map[status] || '未知';
    },
    getProgressPercent(act) {
      if (!act.maxParticipants) return 0;
      return Math.min(100, (act.currentParticipants / act.maxParticipants) * 100);
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    },
    // 生成随机渐变色，用于没有封面图的情况
    getGradientStyle(id) {
      const hues = [260, 280, 300, 320]; // 紫色系
      const hue = hues[id % hues.length];
      return {
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 90%), hsl(${hue + 20}, 80%, 80%))`
      };
    }
  }
};
</script>

<style scoped>
/* --- 全局 --- */
.activity-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%); /* 暖白底色 */
  font-family: 'Nunito', sans-serif;
  color: #5D4037; /* 深棕色文字，比黑色更柔和 */
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* --- 头部 --- */
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
  margin: 0;
}

/* --- 筛选 --- */
.filter-tools {
  display: flex;
  justify-content: space-between;
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
  transition: all 0.3s ease;
}
.tab-btn.active {
  background: linear-gradient(135deg, #FFB300, #FFA000);
  color: #FFF;
  box-shadow: 0 4px 10px rgba(255, 160, 0, 0.4);
}
.sorter select {
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #FFE0B2;
  background: #FFF;
  color: #5D4037;
  outline: none;
  font-weight: 600;
}

/* --- 卡片网格 --- */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

/* --- 活动卡片 --- */
.a-card {
  background: #FFF;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid #FFF3E0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.a-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(255, 179, 0, 0.2);
  border-color: #FFB300;
}

/* 顶部标签 */
.card-top {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 主体 */
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
.a-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
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
.a-card:hover .a-cover { transform: scale(1.05); }

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
  align-items: center;
}
.arrow { margin: 0 4px; opacity: 0.7; }

.a-title {
  font-size: 18px;
  font-weight: 800;
  color: #4A148C;
  margin: 0 0 8px 0;
  line-height: 1.4;
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
.loc-icon { font-size: 14px; }
.a-desc {
  font-size: 13px;
  color: #795548;
  margin: 0;
  line-height: 1.6;
}

/* 底部 */
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
.org-name {
  font-weight: 700;
  color: #5D4037;
  margin-left: 4px;
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
  display: block;
}
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: #FFE0B2;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB300, #FFA000);
  border-radius: 3px;
  transition: width 1s ease;
}

/* 悬停行动按钮 */
.hover-action {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(106, 27, 154, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
}
.a-card:hover .hover-action {
  opacity: 1;
}
.join-btn {
  padding: 12px 32px;
  background: #FFF;
  color: #6A1B9A;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.a-card:hover .join-btn {
  transform: scale(1);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #A1887F;
}
.empty-icon { font-size: 4rem; margin-bottom: 20px; }

@media (max-width: 768px) {
  .activity-grid { grid-template-columns: 1fr; }
  .page-header h2 { font-size: 2rem; }
  .filter-tools { flex-direction: column; gap: 15px; }
  .tabs { width: 100%; overflow-x: auto; justify-content: flex-start; }
}
</style>