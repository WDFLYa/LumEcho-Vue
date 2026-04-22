<template>
  <div class="challenge-page">
    <!-- 使用自定义导航栏 -->
    <ChallengeNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @search="handleSearch"
        @create="goCreate"
        @profile="goProfile"
    />

    <main class="content-area">
      <!-- 头部标语 -->
      <div class="page-header">
        <h2>🔥 热门挑战赛</h2>
        <p>用镜头记录世界，赢取荣耀勋章</p>
      </div>

      <!-- 筛选工具栏 (已移除排序部分) -->
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
        <!-- sorter 部分已完全删除 -->
      </div>

      <!-- 挑战卡片网格 -->
      <div class="challenge-grid">
        <div
            v-for="ch in challengeList"
            :key="ch.id"
            class="c-card"
            @click="goDetail(ch.id)"
        >
          <!-- 卡片顶部：状态与时间 -->
          <div class="card-header">
            <span :class="['status-badge', getStatusClass(ch)]">
              {{ getStatusText(ch) }}
            </span>
            <span class="time-left" v-if="isEndingSoon(ch)">
              ⏳ {{ getRemainingTime(ch) }}
            </span>
          </div>

          <!-- 卡片主体：封面与标题 -->
          <div class="card-body">
            <div class="cover-box">
              <img :src="ch.cover || defaultCover" class="c-cover" alt="cover" />
              <div class="overlay-icon">🏆</div>
            </div>
            <h3 class="c-title">{{ ch.title }}</h3>
            <p class="c-desc">{{ truncate(ch.description, 40) }}</p>
          </div>

          <!-- ✨ 卡片底部：优化后的进度与友好提示 -->
          <div class="card-footer">
            <!-- 第一行：左侧徽章 + 中间进度条 -->
            <div class="footer-top-row">
              <div class="count-badge">
                <span class="badge-icon">{{ getBadgeIcon(ch) }}</span>
                <span class="badge-text">
                  {{ ch.participantCount }}
                  <span class="separator">/</span>
                  {{ ch.isUnlimited ? '∞' : (ch.maxParticipants || 0) }}
                </span>
              </div>

              <div class="progress-track">
                <div
                    class="progress-fill"
                    :class="getProgressClass(ch)"
                    :style="{ width: getProgressWidth(ch) + '%' }"
                ></div>
              </div>
            </div>

            <!-- 第二行：友好提示语文案（独占一行） -->
            <div class="friendly-hint" :class="getHintColorClass(ch)">
              {{ getFriendlyText(ch) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="challengeList.length === 0" class="empty-state">
        <div class="empty-icon">🍃</div>
        <p>暂时没有相关的挑战赛</p>
      </div>
    </main>
  </div>
</template>

<script>
import ChallengeNavBar from "@/components/NavBar/ChallengeNavBar.vue";
import { getChallengeList } from "@/api/challenge";
import { getCurrentUserInfo } from "@/api/auth";

export default {
  name: "ChallengeList",
  components: { ChallengeNavBar },
  data() {
    return {
      currentUserAvatar: 'http://47.116.108.205:9000/lumecho/avatar.png',
      currentUserName: '摄影师',
      challengeList: [],
      currentTab: 'all',
      // sortBy: 'latest',  <-- 已删除
      searchQuery: '',
      defaultCover: 'http://47.116.108.205:9000/lumecho/cover.png',
      tabs: [
        { key: 'all', label: '全部' },
        { key: 'ongoing', label: '进行中' },
        { key: 'review', label: '评审中' },
        { key: 'ended', label: '已结束' }
      ]
    };
  },

  mounted() {
    this.fetchChallenges();
    this.fetchUserInfo();
  },

  watch: {
    currentTab() {
      this.fetchChallenges();
    }
  },

  methods: {
    async fetchChallenges() {
      try {
        const statusMap = {
          all: null,
          ongoing: 1,
          review: 2,
          ended: 3
        };

        const res = await getChallengeList({
          status: statusMap[this.currentTab],
          keyword: this.searchQuery,
          pageNum: 1,
          pageSize: 20
          // sortBy: this.sortBy <-- 已删除
        });

        this.challengeList = res.data?.data?.data || res.data?.data || [];

      } catch (error) {
        console.error("获取挑战列表失败", error);
      }
    },
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserInfo();
        const data = res.data.code === 200 ? res.data.data : res.data;

        if (data) {
          this.currentUserAvatar = data.avatar || this.currentUserAvatar;
          this.currentUserName = data.username || this.currentUserName;
        }
      } catch (e) {
        console.warn("获取用户信息失败", e);
      }
    },

    handleSearch(query) {
      this.searchQuery = query;
      this.fetchChallenges();
    },

    goCreate() {
      this.$router.push('/challenge/create');
    },

    goProfile() {
      this.$router.push('/profile');
    },

    goDetail(id) {
      this.$router.push(`/challenge/${id}`);
    },

    truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len) + '...' : str;
    },

    // --- ✨ 新增辅助方法 ---
    getBadgeIcon(ch) {
      if (ch.isFull) return '✅';
      if (ch.isUnlimited) return '🌟';
      if (ch.isUrgent) return '🔥';
      return '👥';
    },

    getFriendlyText(ch) {
      if (ch.friendlyHint) return ch.friendlyHint;
      if (ch.isUnlimited) return '无人数限制';
      if (ch.isFull) return '已满员';
      const remaining = (ch.maxParticipants || 0) - (ch.participantCount || 0);
      return `还差 ${remaining} 人`;
    },

    getHintColorClass(ch) {
      if (ch.isFull) return 'hint-success';
      const text = this.getFriendlyText(ch);
      if (text.includes('仅剩') || text.includes('手慢无')) return 'hint-danger';
      if (text.includes('热度') || ch.isUrgent) return 'hint-warning';
      return 'hint-normal';
    },

    getProgressWidth(ch) {
      if (ch.isUnlimited) return 100;
      if (ch.isFull) return 100;
      return this.getProgressPercent(ch);
    },

    getProgressClass(ch) {
      if (ch.isFull) return 'fill-success';
      if (ch.isUnlimited) return 'fill-unlimited';
      if (ch.isUrgent) return 'fill-urgent';
      return '';
    },

    // --- 原有方法 ---
    getStatusClass(ch) {
      if (ch.statusCode === 2) return 'status-review';
      if (ch.statusCode === 3) return 'status-ended';
      const now = new Date();
      const end = new Date(ch.endTime);
      const diff = end - now;
      if (diff > 0 && diff < 86400000 * 2) return 'status-urgent';
      return 'status-active';
    },

    getStatusText(ch) {
      return ch.statusText || '未知状态';
    },

    isEndingSoon(ch) {
      if (ch.statusCode !== 1) return false;
      const now = new Date();
      const end = new Date(ch.endTime);
      return (end - now) < 86400000 * 3;
    },

    getRemainingTime(ch) {
      return ch.remainingTimeDesc || '';
    },

    getProgressPercent(ch) {
      if (!ch.maxParticipants || ch.maxParticipants <= 0) return 0;
      return Math.min(100, (ch.participantCount / ch.maxParticipants) * 100);
    }
  }
};
</script>

<style scoped>
/* --- 全局布局 --- */
.challenge-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F3E5F5 0%, #FFFFFF 100%);
  font-family: 'Nunito', sans-serif;
  color: #4A148C;
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
  color: #8E24AA;
  font-size: 1.1rem;
  margin: 0;
}

/* --- 筛选工具 --- */
.filter-tools {
  display: flex;
  justify-content: space-between; /* 因为移除了 sorter，现在 tabs 会自动占满或靠左，如需居中可改为 justify-content: center; */
  align-items: center;
  margin-bottom: 30px;
  background: #FFF;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
}
.tabs { display: flex; gap: 10px; }
.tab-btn {
  padding: 8px 20px;
  border: none;
  background: #F3E5F5;
  color: #8E24AA;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tab-btn.active {
  background: linear-gradient(135deg, #AB47BC, #8E24AA);
  color: #FFF;
  box-shadow: 0 4px 10px rgba(142, 36, 170, 0.3);
}
/* .sorter 相关样式已彻底删除 */

/* --- 卡片网格 --- */
.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

/* --- 挑战卡片核心设计 --- */
.c-card {
  background: #FFF;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid #F3E5F5;
  position: relative;
  display: flex;
  flex-direction: column;
}

.c-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(106, 27, 154, 0.15);
  border-color: #CE93D8;
}

/* 卡片头部：状态 */
.card-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFAFA;
  border-bottom: 1px solid #F3E5F5;
}
.status-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}
.status-active { background: #E8F5E9; color: #2E7D32; }
.status-urgent { background: #FFEBEE; color: #C62828; animation: pulse 2s infinite; }
.status-review { background: #E3F2FD; color: #1565C0; }
.status-ended { background: #F5F5F5; color: #9E9E9E; }

.time-left {
  font-size: 12px;
  font-weight: 700;
  color: #D32F2F;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 卡片主体 */
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
  background: #F3E5F5;
}
.c-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.c-card:hover .c-cover { transform: scale(1.05); }
.overlay-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.c-title {
  font-size: 18px;
  font-weight: 800;
  color: #4A148C;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.c-desc {
  font-size: 13px;
  color: #7B1FA2;
  margin: 0;
  line-height: 1.6;
  opacity: 0.8;
}

/* ✨ 卡片底部：全新两行布局 */
.card-footer {
  padding: 15px 20px;
  background: #FFF;
  border-top: 1px solid #F3E5F5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-badge {
  display: flex;
  align-items: center;
  background: #F8F9FA;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #4A148C;
  white-space: nowrap;
  border: 1px solid #E1BEE7;
  flex-shrink: 0;
}

.badge-icon {
  margin-right: 6px;
  font-style: normal;
}

.separator {
  margin: 0 4px;
  color: #9E9E9E;
  font-weight: 400;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #F3E5F5;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(90deg, #AB47BC, #8E24AA);
}

.progress-fill.fill-success {
  background: linear-gradient(90deg, #66BB6A, #43A047);
}
.progress-fill.fill-urgent {
  background: linear-gradient(90deg, #EF5350, #E53935);
}
.progress-fill.fill-unlimited {
  background: linear-gradient(90deg, #BA68C8, #CE93D8);
  opacity: 0.8;
}

.friendly-hint {
  font-size: 12px;
  font-weight: 600;
  color: #7B1FA2;
  line-height: 1.4;
  text-align: left;
  width: 100%;
}

.hint-normal { color: #7B1FA2; }
.hint-success { color: #2E7D32; }
.hint-warning { color: #F9A825; }
.hint-danger { color: #C62828; font-weight: 800; }

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #9E9E9E;
}
.empty-icon { font-size: 4rem; margin-bottom: 20px; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(198, 40, 40, 0); }
  100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); }
}

@media (max-width: 768px) {
  .challenge-grid { grid-template-columns: 1fr; }
  .page-header h2 { font-size: 2rem; }
  .filter-tools {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  .tabs { justify-content: center; }
  /* .sorter 相关媒体查询已彻底删除 */
}
</style>