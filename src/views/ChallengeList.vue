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

      <!-- 筛选工具栏 -->
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
          <span>排序：</span>
          <select v-model="sortBy" @change="fetchChallenges">
            <option value="latest">最新发布</option>
            <option value="hot">最热参与</option>
            <option value="ending">即将结束</option>
          </select>
        </div>
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
              <!-- 这里假设有一个 cover 字段，如果没有可以用默认图 -->
              <img :src="ch.cover || defaultCover" class="c-cover" alt="cover" />
              <div class="overlay-icon">🏆</div>
            </div>
            <h3 class="c-title">{{ ch.title }}</h3>
            <p class="c-desc">{{ truncate(ch.description, 40) }}</p>
          </div>

          <!-- 卡片底部：数据与进度 -->
          <div class="card-footer">
            <div class="progress-section">
              <div class="p-info">
                <span class="p-count">{{ ch.participantCount }} / {{ ch.maxParticipants }}</span>
                <span class="p-label">人已加入</span>
              </div>
              <div class="progress-bar-bg">
                <div
                    class="progress-bar-fill"
                    :style="{ width: getProgressPercent(ch) + '%', backgroundColor: getProgressColor(ch) }"
                ></div>
              </div>
            </div>

            <div class="action-hint">
              <span class="arrow-icon">➜</span>
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
import ChallengeNavBar from "@/components/NavBar/ChallengeNavBar.vue"; // 假设上面那个组件保存为此文件

export default {
  name: "ChallengeList",
  components: { ChallengeNavBar },
  data() {
    return {
      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: '摄影师',
      challengeList: [], // 存储 Challenge 对象
      currentTab: 'all',
      sortBy: 'latest',
      searchQuery: '',
      defaultCover: 'http://localhost:9000/lumecho/cover.png',
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
  },
  methods: {
    // 模拟获取数据 (实际请替换为你的 API 调用)
    async fetchChallenges() {
      // TODO: 调用后端 API，传入 currentTab, sortBy, searchQuery
      // const res = await api.getChallenges({ status: this.currentTab, sort: this.sortBy });
      // this.challengeList = res.data;

      // ---  mock 数据演示 ---
      this.challengeList = [
        {
          id: 1,
          title: "春日樱花季",
          description: "捕捉春天的第一抹粉色，分享你身边的樱花美景。",
          startTime: new Date(Date.now() - 86400000 * 5),
          endTime: new Date(Date.now() + 86400000 * 2), // 2天后结束
          reviewEndTime: new Date(Date.now() + 86400000 * 10),
          status: 1, // 1: 进行中
          maxParticipants: 500,
          participantCount: 420,
          cover: null
        },
        {
          id: 2,
          title: "城市夜景光影",
          description: "探索城市的夜晚，用光影讲述故事。",
          startTime: new Date(Date.now() - 86400000 * 10),
          endTime: new Date(Date.now() + 86400000 * 15),
          reviewEndTime: new Date(Date.now() + 86400000 * 20),
          status: 1,
          maxParticipants: 1000,
          participantCount: 150,
          cover: null
        },
        {
          id: 3,
          title: "复古胶片风",
          description: "重现胶片质感，寻找怀旧的色彩。",
          startTime: new Date(Date.now() - 86400000 * 20),
          endTime: new Date(Date.now() - 86400000 * 1), // 已结束
          reviewEndTime: new Date(Date.now() + 86400000 * 5),
          status: 2, // 2: 评审中
          maxParticipants: 200,
          participantCount: 200,
          cover: null
        }
      ];
      // -------------------
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.fetchChallenges();
    },
    goCreate() { this.$router.push('/challenge/create'); },
    goProfile() { this.$router.push('/profile'); },
    goDetail(id) { this.$router.push(`/challenge/${id}`); },

    // 工具函数
    truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len) + '...' : str;
    },
    getStatusClass(ch) {
      if (ch.status === 2) return 'status-review';
      if (ch.status === 3) return 'status-ended';
      // 检查是否即将结束
      const now = new Date();
      const end = new Date(ch.endTime);
      const diff = end - now;
      if (diff > 0 && diff < 86400000 * 2) return 'status-urgent'; // 2天内
      return 'status-active';
    },
    getStatusText(ch) {
      if (ch.status === 2) return '评审中';
      if (ch.status === 3) return '已结束';
      const now = new Date();
      const end = new Date(ch.endTime);
      if (end < now) return '已结束';
      const diff = end - now;
      if (diff < 86400000 * 2) return '即将截止';
      return '报名中';
    },
    isEndingSoon(ch) {
      if (ch.status !== 1) return false;
      const now = new Date();
      const end = new Date(ch.endTime);
      return (end - now) < 86400000 * 3; // 3天内
    },
    getRemainingTime(ch) {
      const now = new Date();
      const end = new Date(ch.endTime);
      const diff = end - now;
      if (diff <= 0) return '已结束';
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      return `${days}天${hours}时`;
    },
    getProgressPercent(ch) {
      if (!ch.maxParticipants) return 0;
      return Math.min(100, (ch.participantCount / ch.maxParticipants) * 100);
    },
    getProgressColor(ch) {
      const percent = this.getProgressPercent(ch);
      if (percent > 80) return '#D32F2F'; // 红色：快满了
      if (percent > 50) return '#FBC02D'; // 黄色：过半
      return '#7B1FA2'; // 紫色：正常
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
  justify-content: space-between;
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
.sorter {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6A1B9A;
  font-weight: 600;
}
.sorter select {
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #E1BEE7;
  background: #FFF;
  color: #4A148C;
  outline: none;
  cursor: pointer;
}

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

/* 卡片底部：进度条 */
.card-footer {
  padding: 15px 20px;
  background: #FFF;
  border-top: 1px solid #F3E5F5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-section {
  flex: 1;
  margin-right: 15px;
}
.p-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #6A1B9A;
  margin-bottom: 6px;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #F3E5F5;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}
.action-hint {
  color: #AB47BC;
  font-size: 18px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}
.c-card:hover .action-hint {
  opacity: 1;
  transform: translateX(0);
}

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
  .filter-tools { flex-direction: column; gap: 15px; align-items: stretch; }
  .tabs { justify-content: center; }
  .sorter { justify-content: center; }
}
</style>