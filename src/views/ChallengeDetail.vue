<template>
  <div class="challenge-page">
    <ChallengeDetailNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @profile="goProfile"
    />

    <main class="content-area">
      <div v-if="loading" class="loader-fullscreen">
        <div class="cute-loader">🌸</div>
        <p>正在加载比赛信息...</p>
      </div>

      <div v-else-if="loadError" class="error-state">
        <div class="error-icon">😢</div>
        <p>{{ errorMessage }}</p>
        <button class="retry-btn" @click="retry">重试</button>
        <button class="back-btn" @click="goBack">返回列表</button>
      </div>

      <div v-else-if="challenge" class="detail-flow">
        <!-- 阶段一：报名/准备期 (status 0 或 1) -->
        <div v-if="isActionPhase" class="phase-action">
          <section class="hero-section">
            <div class="hero-cover">
              <img :src="challenge.coverUrl || defaultCover" alt="Cover" />
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              <span :class="['status-badge', getStatusClass(challenge.status)]">
                {{ getStatusText(challenge.status) }}
              </span>
              <h1 class="hero-title">{{ challenge.title }}</h1>
              <p class="hero-desc">{{ challenge.description }}</p>
              <div class="hero-meta">
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>截止：{{ formatDate(challenge.endTime) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">👥</span>
                  <span>{{ challenge.participantCount }} / {{ challenge.maxParticipants || '∞' }} 人已加入</span>
                </div>
              </div>
            </div>
          </section>

          <section class="info-section">
            <div class="info-card">
              <h3 class="card-title">📜 挑战规则</h3>
              <ul class="rule-list">
                <li>📷 必须为原创摄影作品</li>
                <li>🚫 严禁使用 AI 生成或过度 PS</li>
                <li>📍 需标注拍摄地点</li>
                <li>⏰ 必须在截止时间前提交</li>
                <li>🖼️ 只能上传一张图片</li>
              </ul>
            </div>

            <div class="action-card">
              <div class="action-info">
                <div v-if="!hasJoined" class="info-row">
                  <span class="info-label">名额剩余</span>
                  <span class="info-value">{{ remainingSlots }}</span>
                </div>
                <div v-else-if="!hasSubmittedWork" class="info-row">
                  <span class="info-label">当前状态</span>
                  <span class="info-value warning">待提交作品</span>
                </div>
                <div v-else class="info-row">
                  <span class="info-label">当前状态</span>
                  <span class="info-value success">✅ 已提交</span>
                </div>
              </div>

              <button
                  v-if="challenge.status === 0"
                  class="action-btn btn-disabled"
                  disabled
              >
                🔒 活动未开始
              </button>

              <button
                  v-else-if="!hasJoined"
                  class="action-btn btn-primary"
                  @click="goSubmitWork"
                  :disabled="isFull"
              >
                {{ isFull ? '🚫 已满员' : '🚀 立即报名并提交' }}
              </button>

              <button
                  v-else-if="!hasSubmittedWork"
                  class="action-btn btn-accent"
                  @click="goSubmitWork"
              >
                📷 去提交作品
              </button>

              <button v-else class="action-btn btn-disabled" disabled>
                ✅ 已完成
              </button>
            </div>
          </section>
        </div>

        <!-- 阶段二：评审/结果期 (status 2 或 3) -->
        <div v-else class="phase-review">
          <header class="review-header">
            <span :class="['status-badge', getStatusClass(challenge.status)]">
              {{ getStatusText(challenge.status) }}
            </span>
            <h1 class="page-title">{{ challenge.title }}</h1>
            <p class="sub-text">
              {{ challenge.status === 2 ? '请为优秀的作品打分' : '比赛已结束，最终结果如下' }}
            </p>
          </header>

          <section class="podium-section">
            <h2 class="section-title">🌟 荣耀榜</h2>
            <div class="podium-container">
              <div v-if="topSubmissions[1]" class="podium-item rank-2">
                <div class="medal">🥈</div>
                <div class="photo-frame">
                  <img :src="topSubmissions[1].authorAvatar || defaultCover" />
                  <div class="score-badge">{{ topSubmissions[1].finalScore || 0 }}分</div>
                </div>
                <div class="user-info">
                  <div class="name">{{ topSubmissions[1].title }}</div>
                  <div class="work-title">📍 {{ topSubmissions[1].location || '未知' }}</div>
                </div>
              </div>

              <div v-if="topSubmissions[0]" class="podium-item rank-1">
                <div class="medal">🥇</div>
                <div class="crown">👑</div>
                <div class="photo-frame large">
                  <img :src="topSubmissions[0].authorAvatar || defaultCover" />
                  <div class="score-badge highlight">{{ topSubmissions[0].finalScore || 0 }}分</div>
                </div>
                <div class="user-info">
                  <div class="name">{{ topSubmissions[0].title }}</div>
                  <div class="work-title">📍 {{ topSubmissions[0].location || '未知' }}</div>
                </div>
              </div>

              <div v-if="topSubmissions[2]" class="podium-item rank-3">
                <div class="medal">🥉</div>
                <div class="photo-frame">
                  <img :src="topSubmissions[2].authorAvatar || defaultCover" />
                  <div class="score-badge">{{ topSubmissions[2].finalScore || 0 }}分</div>
                </div>
                <div class="user-info">
                  <div class="name">{{ topSubmissions[2].title }}</div>
                  <div class="work-title">📍 {{ topSubmissions[2].location || '未知' }}</div>
                </div>
              </div>
            </div>
          </section>

          <section class="all-works-section">
            <h2 class="section-title">
              📸 参赛作品
              <span class="count-tag">{{ submissions.length }} 部</span>
            </h2>

            <div v-if="submissionsLoading" class="loading-works">
              <div class="cute-loader">🌸</div>
              <p>加载作品中...</p>
            </div>

            <div v-else-if="submissions.length > 0" class="works-grid">
              <div v-for="item in submissions" :key="item.id" class="work-card">
                <div class="work-img-box">
                  <img :src="item.coverUrl || defaultCover" loading="lazy" />
                  <div v-if="canVote" class="overlay-action">
                    <button class="float-vote" @click="handleScore(item)" :disabled="hasVoted(item.id)">
                      <span>{{ hasVoted(item.id) ? '✅ 已打分' : '⚖️ 打分' }}</span>
                    </button>
                  </div>
                  <div v-if="item.finalScore" class="final-score-tag">
                    🏆 {{ item.finalScore }}分
                  </div>
                </div>
                <div class="work-info">
                  <div class="w-title">{{ item.title }}</div>
                  <div class="w-meta">
                    <span class="w-user">📍 {{ item.location || '无地点' }}</span>
                    <span class="w-score">{{ item.finalScore || 0 }}分</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">🍃</div>
              <p>暂无参赛作品</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import ChallengeDetailNavBar from "@/components/NavBar/ChallengeDetailNavBar.vue";
import { getChallengeDetail, getChallengeSubmissions } from "@/api/challenge";

export default {
  name: "ChallengeDetail",
  components: { ChallengeDetailNavBar },

  data() {
    return {
      loading: true,
      loadError: false,
      errorMessage: '加载失败，请重试',

      challenge: null,
      submissions: [],
      submissionsLoading: false,

      currentUserAvatar: "http://localhost:9000/lumecho/avatar.png",
      currentUserName: "摄影师",
      defaultCover: "http://localhost:9000/lumecho/avatar.png",

      hasJoined: false,
      hasSubmittedWork: false,
      votedIds: []
    };
  },

  computed: {
    isActionPhase() {
      if (!this.challenge) return false;
      const status = Number(this.challenge.status);
      return status === 0 || status === 1;
    },

    canVote() {
      const status = Number(this.challenge?.status);
      return status === 2;
    },

    isFull() {
      if (!this.challenge) return false;
      if (!this.challenge.maxParticipants) return false;
      return this.challenge.participantCount >= this.challenge.maxParticipants;
    },

    remainingSlots() {
      if (!this.challenge) return 0;
      if (!this.challenge.maxParticipants) return "∞";
      return this.challenge.maxParticipants - this.challenge.participantCount;
    },

    topSubmissions() {
      if (!this.submissions.length) return [];
      return [...this.submissions]
          .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
          .slice(0, 3);
    }
  },

  mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.fetchDetail(id);
    } else {
      this.loading = false;
      this.loadError = true;
      this.errorMessage = '未找到挑战赛 ID';
    }
  },

  methods: {
    async fetchDetail(id) {
      try {
        this.loading = true;
        this.loadError = false;

        const res = await getChallengeDetail(id);

        let code = res.code;
        let data = res.data;

        if (!code && res.data && res.data.code !== undefined) {
          code = res.data.code;
          data = res.data.data;
        }

        if (code === 200 || code === '200') {
          this.challenge = data;

          if (this.challenge.status !== undefined) {
            this.challenge.status = Number(this.challenge.status);
          }

          if (!this.challenge.coverUrl) {
            this.challenge.coverUrl = this.defaultCover;
          }

          if (!this.isActionPhase) {
            this.fetchSubmissions(id);
          }

        } else {
          throw new Error(res.message || '接口返回错误');
        }

      } catch (e) {
        console.error('获取挑战详情失败:', e);
        this.loadError = true;
        this.errorMessage = e.message || '网络请求失败';
      } finally {
        this.loading = false;
      }
    },

    async fetchSubmissions(challengeId) {
      try {
        this.submissionsLoading = true;

        const res = await getChallengeSubmissions(challengeId);

        let submissionsData = [];

        if (Array.isArray(res)) {
          submissionsData = res;
        }
        else if (res && (res.code === 200 || res.code === '200') && Array.isArray(res.data)) {
          submissionsData = res.data;
        }
        else if (res && res.data && (res.data.code === 200 || res.data.code === '200') && Array.isArray(res.data.data)) {
          submissionsData = res.data.data;
        }
        else if (res && Array.isArray(res.data)) {
          submissionsData = res.data;
        }
        else {
          submissionsData = [];
        }

        this.submissions = submissionsData.map(item => ({
          ...item,
          coverUrl: item.coverUrl || this.defaultCover,
          authorAvatar: item.authorAvatar || this.defaultCover,
          finalScore: Number(item.finalScore) || 0
        }));

      } catch (e) {
        console.error('获取作品列表失败:', e);
        this.submissions = [];
      } finally {
        this.submissionsLoading = false;
      }
    },

    goSubmitWork() {
      if (Number(this.challenge.status) === 0) {
        alert("活动尚未开始");
        return;
      }
      if (this.isFull) {
        alert("报名已满");
        return;
      }
      this.$router.push(`/challenge/${this.challenge.id}/submit`);
    },

    goProfile() {
      this.$router.push("/profile");
    },

    goBack() {
      this.$router.push("/activity");
    },

    hasVoted(id) {
      return this.votedIds.includes(id);
    },

    handleScore(item) {
      if (this.hasVoted(item.id)) return;
      item.finalScore = (item.finalScore || 0) + 1;
      this.votedIds.push(item.id);
    },

    retry() {
      const id = this.$route.params.id;
      if (id) {
        this.fetchDetail(id);
      }
    },

    getStatusClass(status) {
      const s = Number(status);
      if (s === 0) return "status-gray";
      if (s === 1) return "status-active";
      if (s === 2) return "status-review";
      if (s === 3) return "status-ended";
      return "";
    },

    getStatusText(status) {
      const s = Number(status);
      const map = { 0: "未开始", 1: "进行中", 2: "评审中", 3: "已结束" };
      return map[s] || "未知";
    },

    formatDate(time) {
      if (!time) return "";
      const d = new Date(time);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  }
};
</script>

<style scoped>
/* --- 基础布局 - 添加淡紫色背景 --- */
.challenge-page {
  min-height: 100vh;
  /* 淡紫色渐变背景 */
  background: linear-gradient(180deg, #F8F5FA 0%, #F0E8F5 50%, #FFFFFF 100%);
  font-family: 'Nunito', sans-serif;
  color: #333333;
}

.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* --- 加载/错误状态 --- */
.loader-fullscreen, .error-state, .loading-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-size: 1.2rem;
  color: #666;
}
.cute-loader, .error-icon { font-size: 4rem; margin-bottom: 20px; }
.retry-btn, .back-btn {
  margin-top: 10px;
  padding: 10px 30px;
  border: none;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
}
.retry-btn { background: #8E24AA; color: #FFF; }
.back-btn { background: #EEEEEE; color: #333333; }

/* --- 状态标签 --- */
.status-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 15px;
}
.status-active { background: #E8F5E9; color: #2E7D32; }
.status-gray { background: #F5F5F5; color: #757575; }
.status-review { background: #E3F2FD; color: #1565C0; }
.status-ended { background: #FFF3E0; color: #E65100; }

/* --- 海报区域 --- */
.hero-section {
  background: #ffe4ff;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #EEEEEE;
}
.hero-cover {
  width: 100%;
  height: 400px;
  position: relative;
}
.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  padding: 30px;
  position: relative;
  margin-top: -100px;
  color: #FFFFFF;
  text-shadow: 0 2px 6px rgba(0,0,0,0.4); /* 阴影增加可读性 */
}
.hero-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 10px 0;
  color: #FFFFFF;
}
.hero-desc {
  font-size: 1rem;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #FFFFFF;
}
.hero-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #FFFFFF;
}
.meta-icon { font-size: 1.2rem; }

/* --- 信息卡片 --- */
.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
@media (max-width: 768px) {
  .info-section { grid-template-columns: 1fr; }
}

.info-card, .action-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #EEEEEE;
}
.card-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #333333;
  margin: 0 0 15px 0;
}
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.rule-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #EEEEEE;
  font-size: 0.95rem;
  color: #555555;
}
.rule-list li:last-child { border-bottom: none; }

.action-info { margin-bottom: 20px; }
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #EEEEEE;
}
.info-row:last-child { border-bottom: none; }
.info-label { color: #999999; font-size: 0.9rem; }
.info-value { font-weight: 700; color: #333333; }
.info-value.warning { color: #F9A825; }
.info-value.success { color: #2E7D32; }

.action-btn {
  width: 100%;
  padding: 14px 30px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-primary {
  background: linear-gradient(135deg, #AB47BC, #8E24AA);
  color: #FFFFFF;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(142, 36, 170, 0.4);
}
.btn-accent {
  background: linear-gradient(135deg, #BA68C8, #CE93D8);
  color: #FFFFFF;
}
.btn-disabled {
  background: #F5F5F5;
  color: #9E9E9E;
  cursor: not-allowed;
}

/* --- 评审期 --- */
.review-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
}
.page-title {
  font-size: 2rem;
  color: #333333;
  margin: 10px 0;
  font-weight: 900;
}
.sub-text {
  color: #666666;
  font-size: 1rem;
}

/* 领奖台 - 统一动画效果 */
.podium-section {
  margin-bottom: 50px;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #EEEEEE;
}
.section-title {
  text-align: center;
  font-size: 1.5rem;
  color: #333333;
  margin-bottom: 30px;
  font-weight: 800;
}
.count-tag {
  font-size: 1rem;
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 10px;
  border-radius: 20px;
  vertical-align: middle;
  margin-left: 10px;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 15px;
  padding: 20px;
  min-height: 350px;
}

/* 🔧 统一领奖台动画：全部放大 */
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.3s ease;
  width: 160px;
}
/* 所有领奖台悬停时都放大 1.05 倍 */
.podium-item:hover {
  transform: scale(1.05);
}

.medal {
  font-size: 3rem;
  margin-bottom: -10px;
  z-index: 2;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
}
.crown {
  position: absolute;
  top: -35px;
  font-size: 2.5rem;
  animation: float 2s infinite ease-in-out;
  z-index: 3;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.photo-frame {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 5px solid #FFFFFF;
  box-shadow: 0 8px 20px rgba(106, 27, 154, 0.15);
  overflow: hidden;
  background: #F5F5F5;
  position: relative;
  flex-shrink: 0;
}
.photo-frame.large {
  width: 180px;
  height: 180px;
  border-width: 8px;
  border-color: #FFD93D;
}
.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.score-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: #FFFFFF;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 10px;
  font-weight: 700;
}
.score-badge.highlight {
  background: #FFD93D;
  color: #333333;
  font-size: 1rem;
}

.user-info {
  margin-top: 15px;
  text-align: center;
  background: #FFFFFF;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(106, 27, 154, 0.1);
  width: 100%;
}
.name {
  font-weight: 800;
  color: #333333;
  font-size: 0.95rem;
}
.work-title {
  font-size: 0.85rem;
  color: #999999;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  margin-left: auto;
  margin-right: auto;
}

/* 🔧 领奖台位置调整 - 移除不一致的 transform */
.rank-2 {
  order: 1;
  margin-bottom: 40px;
}
.rank-1 {
  order: 2;
  margin-bottom: 0;
  z-index: 10;
}
.rank-3 {
  order: 3;
  margin-bottom: 40px;
}

/* 作品网格 */
.all-works-section {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #EEEEEE;
}
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
}
.work-card {
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(106, 27, 154, 0.08);
  border: 1px solid #EEEEEE;
  transition: transform 0.3s ease;
}
.work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(106, 27, 154, 0.15);
}
.work-img-box {
  position: relative;
  padding-top: 100%;
  background: #F5F5F5;
}
.work-img-box img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay-action {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.work-card:hover .overlay-action { opacity: 1; }
.float-vote {
  background: #FFFFFF;
  color: #8E24AA;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
}
.float-vote:disabled {
  color: #999999;
  cursor: default;
}

.final-score-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #FFD93D;
  color: #333333;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.work-info { padding: 15px; }
.w-title {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333333;
}
.w-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999999;
}
.w-score {
  color: #8E24AA;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999999;
}
.empty-icon { font-size: 4rem; margin-bottom: 20px; }

/* 响应式 */
@media (max-width: 768px) {
  .hero-title { font-size: 1.5rem; }
  .hero-cover { height: 300px; }
  .podium-container { gap: 5px; min-height: 300px; }
  .photo-frame { width: 100px; height: 100px; }
  .photo-frame.large { width: 120px; height: 120px; }
  .rank-2, .rank-3 { margin-bottom: 20px; }
  .works-grid { grid-template-columns: 1fr; }
}
</style>
