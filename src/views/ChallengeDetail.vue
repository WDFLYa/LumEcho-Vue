<template>
  <div class="challenge-page">
    <ChallengeDetailNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
        @profile="goProfile"
    />

    <main class="content-area">
      <!-- 加载中 -->
      <div v-if="loading" class="loader-fullscreen">
        <div class="cute-loader">🌸</div>
        <p>正在加载比赛信息...</p>
      </div>

      <!-- 加载错误 -->
      <div v-else-if="loadError" class="error-state">
        <div class="error-icon">😢</div>
        <p>{{ errorMessage }}</p>
        <button class="retry-btn" @click="retry">重试</button>
        <button class="back-btn" @click="goBack">返回列表</button>
      </div>

      <!-- ✅ 新增：活动已取消状态展示 -->
      <div v-else-if="challenge && challenge.status === 4" class="cancelled-state">
        <div class="cancelled-card">
          <div class="cancelled-icon">🚫</div>
          <h2 class="cancelled-title">很抱歉，该挑战赛已取消</h2>
          <p class="cancelled-desc">
            由于不可抗力或主办方安排，管理员已终止此挑战。<br>
            给您带来的不便，我们深表歉意。
          </p>

          <div class="cancelled-info-box">
            <div class="info-row">
              <span class="label">挑战主题：</span>
              <span class="value">{{ challenge.title }}</span>
            </div>
            <div class="info-row">
              <span class="label">原定时间：</span>
              <span class="value">{{ formatDate(challenge.startTime) }} ~ {{ formatDate(challenge.endTime) }}</span>
            </div>
          </div>

          <button class="back-btn-large" @click="goBack">
            🏠 返回挑战赛列表
          </button>
        </div>
      </div>

      <!-- 正常流程：报名/投稿阶段 (状态 0, 1) -->
      <div v-else-if="challenge && isActionPhase" class="detail-flow">
        <div class="phase-action">
          <section class="hero-section">
            <div class="hero-cover">
              <img :src="challenge.coverUrl || defaultCover" alt="Cover" />
            </div>
            <div class="hero-content">
              <span :class="['status-badge', getStatusClass(challenge.status)]">
                {{ getStatusText(challenge.status) }}
              </span>
              <h1 class="hero-title">{{ challenge.title }}</h1>
              <p class="hero-desc">{{ challenge.description }}</p>
              <div class="hero-meta">
                <div class="meta-item">
                  <span class="meta-icon">🟢</span>
                  <span>开始：{{ formatDate(challenge.startTime) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>截止：{{ formatDate(challenge.endTime) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🏁</span>
                  <span>评审结束：{{ formatDate(challenge.reviewEndTime) }}</span>
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
                <li v-for="(rule, idx) in realRules" :key="idx">
                  📜 {{ rule }}
                </li>
                <li v-if="realRules.length === 0">暂无挑战规则</li>
              </ul>
            </div>

            <div class="action-card">
              <div class="action-info">
                <div class="info-row">
                  <span class="info-label">报名状态</span>
                  <span :class="['info-value', applyStatusClass]">
                    {{ applyStatusText }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">作品状态</span>
                  <span :class="['info-value', hasSubmittedWork ? 'success' : 'warning']">
                    {{ hasSubmittedWork ? '✅ 已提交' : '待提交' }}
                  </span>
                </div>
              </div>

              <button
                  v-if="challenge.status === 0"
                  class="action-btn btn-primary"
                  @click="doApply"
                  :disabled="isFull || [0, 1].includes(applyStatus)"
              >
                <span v-if="isFull">🚫 已满员</span>
                <span v-else-if="applyStatus === 0">⏳ 待审核</span>
                <span v-else-if="applyStatus === 1">✅ 已报名</span>
                <span v-else>📝 立即报名</span>
              </button>

              <button
                  v-else-if="challenge.status === 1"
                  class="action-btn btn-accent"
                  @click="goSubmitWork"
                  :disabled="applyStatus !== 1 || hasSubmittedWork"
              >
                <span v-if="hasSubmittedWork">✅ 已提交作品</span>
                <span v-else>📷 去提交作品</span>
              </button>

              <!-- 理论上不会进这里，因为 v-else-if 控制了，但为了健壮性保留 -->
              <button v-else class="action-btn btn-disabled" disabled>
                🔒 比赛已结束
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- 正常流程：评审/结束阶段 (状态 2, 3) -->
      <div v-else-if="challenge" class="detail-flow">
        <div class="phase-review">
          <header class="review-header">
            <span :class="['status-badge', getStatusClass(challenge.status)]">
              {{ getStatusText(challenge.status) }}
            </span>
            <h1 class="page-title">{{ challenge.title }}</h1>
            <p class="sub-text">
              {{ challenge.status === 2 ? '请为优秀的作品打分' : '比赛已结束，最终结果如下' }}
            </p>
            <div class="review-time-bar">
              <span>🟢 开始：{{ formatDate(challenge.startTime) }}</span>
              <span>📅 截止：{{ formatDate(challenge.endTime) }}</span>
              <span>🏁 评审结束：{{ formatDate(challenge.reviewEndTime) }}</span>
            </div>
          </header>

          <section class="podium-section">
            <h2 class="section-title">🌟 荣耀榜</h2>
            <div class="podium-container">
              <div v-if="topSubmissions[1]" class="podium-item rank-2">
                <div class="medal">🥈</div>
                <div class="photo-frame">
                  <img :src="topSubmissions[1].coverUrl || defaultCover" />
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
                  <img :src="topSubmissions[0].coverUrl || defaultCover" />
                </div>
                <div class="user-info">
                  <div class="name">{{ topSubmissions[0].title }}</div>
                  <div class="work-title">📍 {{ topSubmissions[0].location || '未知' }}</div>
                </div>
              </div>

              <div v-if="topSubmissions[2]" class="podium-item rank-3">
                <div class="medal">🥉</div>
                <div class="photo-frame">
                  <img :src="topSubmissions[2].coverUrl || defaultCover" />
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
              <div
                  v-for="item in submissions"
                  :key="item.id"
                  class="work-card"
                  @click="openWorkDetail(item)"
              >
                <div class="work-img-box">
                  <img :src="item.coverUrl || defaultCover" loading="lazy" />
                </div>
                <div class="work-info">
                  <div class="w-title">{{ item.title }}</div>
                  <div class="w-meta">
                    <span class="w-user">📍 {{ item.location || '无地点' }}</span>
                    <span class="w-score">{{ Number(item.finalScore || 0).toFixed(2) }}分</span>
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

    <!-- 作品详情弹窗 (保持不变) -->
    <div v-if="showWorkModal" class="score-modal-mask" @click="closeWorkModal">
      <div class="score-modal" @click.stop>
        <div class="score-left">
          <img :src="currentWork?.coverUrl || defaultCover" alt="作品">
        </div>
        <div class="score-right">
          <h3>作品评分详情</h3>
          <div class="score-info">
            <div class="info-item">
              <label>最终得分</label>
              <span>{{ Number(currentWork.finalScore || 0).toFixed(2) }} 分</span>
            </div>
            <div class="info-item">
              <label>评分人数</label>
              <span>{{ scoreList.length }} 人</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="score-history" v-if="scoreList.length">
            <label>所有评委评分记录</label>
            <div class="score-item" v-for="s in scoreList" :key="s.id">
              <div class="score-header">
                <span class="judge-name">{{ s.judgeName || '匿名评委' }}</span>
                <span class="score-score">{{ s.score }} 分</span>
              </div>
              <div class="score-comment" v-if="s.comment">{{ s.comment }}</div>
            </div>
          </div>
          <div v-else class="no-score-tip">暂无评分</div>
          <button
              class="score-btn"
              v-if="canVote && !hasScored"
              @click="openScorePanel"
          >
            我要打分
          </button>
          <button class="score-btn disabled" v-else>
            {{ hasScored ? '✅ 已打分' : '🔒 不可打分' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 打分弹窗 (保持不变) -->
    <div v-if="showScoreModal" class="score-modal-mask" @click="closeScoreModal">
      <div class="score-modal" @click.stop>
        <div class="score-left">
          <img :src="currentWork?.coverUrl || defaultCover" alt="作品">
        </div>
        <div class="score-right">
          <h3>评分</h3>
          <div class="form-item">
            <label>分数（0-100）</label>
            <input v-model.number="scoreForm.score" type="number" min="0" max="100" placeholder="请输入分数" />
          </div>
          <div class="form-item">
            <label>评语（可选）</label>
            <textarea v-model="scoreForm.comment" placeholder="请输入评语"></textarea>
          </div>
          <div class="btn-group">
            <button class="btn-cancel" @click="closeScoreModal">取消</button>
            <button class="btn-submit" @click="doSubmitScore" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交评分' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChallengeDetailNavBar from '@/components/NavBar/ChallengeDetailNavBar.vue'
import {
  getChallengeDetail,
  getChallengeSubmissions,
  applyChallenge,
  getApplyStatus,
  submitScore,
  getScoreList,
  checkHasScored
} from '@/api/challenge'
import { getCurrentUserInfo } from "@/api/auth";

export default {
  name: 'ChallengeDetail',
  components: { ChallengeDetailNavBar },
  data() {
    return {
      loading: true,
      loadError: false,
      errorMessage: '加载失败',

      challenge: null,
      submissions: [],
      submissionsLoading: false,

      currentUserAvatar: 'http://localhost:9000/lumecho/avatar.png',
      currentUserName: '摄影师',
      defaultCover: 'http://localhost:9000/lumecho/avatar.png',

      applyStatus: null,
      hasSubmittedWork: false,

      showWorkModal: false,
      currentWork: null,
      scoreList: [],
      hasScored: false,

      showScoreModal: false,
      scoreForm: {
        submissionId: null,
        score: null,
        comment: ''
      },
      submitting: false
    }
  },
  computed: {
    isActionPhase() {
      if (!this.challenge) return false
      const s = Number(this.challenge.status)
      // 只有 0 和 1 是行动阶段，4(已取消) 在上面单独处理了
      return s === 0 || s === 1
    },
    canVote() {
      if (!this.challenge) return false
      const s = Number(this.challenge.status)
      return s === 2
    },
    isFull() {
      if (!this.challenge?.maxParticipants) return false
      return this.challenge.participantCount >= this.challenge.maxParticipants
    },
    topSubmissions() {
      return [...this.submissions]
          .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
          .slice(0, 3)
    },
    realRules() {
      if (!this.challenge?.rules) return []
      try {
        return JSON.parse(this.challenge.rules)
      } catch {
        return []
      }
    },
    applyStatusText() {
      const map = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已取消' }
      return map[this.applyStatus] ?? '未报名'
    },
    applyStatusClass() {
      if (this.applyStatus === 1) return 'success'
      if (this.applyStatus === 2) return 'error'
      if (this.applyStatus === 0) return 'warning'
      if (this.applyStatus === 3) return 'canceled'
      return ''
    }
  },
  mounted() {
    this.fetchDetail(this.$route.params.id);
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
        console.warn("获取用户信息失败", e);
      }
    },
    async fetchDetail(id) {
      if (!id) return;
      try {
        this.loading = true
        const [res, statusRes] = await Promise.all([
          getChallengeDetail(id),
          getApplyStatus(id)
        ])
        const chal = this.getData(res)
        if (!chal) throw new Error()
        this.challenge = chal
        this.challenge.status = Number(this.challenge.status)

        const statusData = this.getData(statusRes) || {}
        this.applyStatus = statusData.applyStatus ?? null
        this.hasSubmittedWork = !!statusData.hasSubmitted

        // 如果是评审中或已结束，加载作品列表
        if ([2, 3].includes(this.challenge.status)) {
          await this.fetchSubmissions(id)
        }
      } catch (e) {
        this.loadError = true
      } finally {
        this.loading = false
      }
    },
    async fetchSubmissions(cid) {
      try {
        this.submissionsLoading = true
        const res = await getChallengeSubmissions(cid)
        this.submissions = this.getData(res) || []
      } catch (e) {
        this.submissions = []
      } finally {
        this.submissionsLoading = false
      }
    },
    getData(res) {
      if (!res) return null
      if (res.code === 200) return res.data
      if (res.data?.code === 200) return res.data.data
      return null
    },
    async openWorkDetail(item) {
      this.currentWork = item
      this.showWorkModal = true
      const sid = item.id

      const [listRes, checkRes] = await Promise.all([
        getScoreList(sid),
        checkHasScored(sid)
      ])

      this.scoreList = this.getData(listRes) || []
      this.hasScored = this.getData(checkRes) || false
    },
    closeWorkModal() {
      this.showWorkModal = false
      this.currentWork = null
      this.scoreList = []
      this.hasScored = false
    },
    openScorePanel() {
      if (!this.canVote || this.hasScored) return
      this.scoreForm.submissionId = this.currentWork.id
      this.scoreForm.score = null
      this.scoreForm.comment = ''
      this.showScoreModal = true
    },
    closeScoreModal() {
      this.showScoreModal = false
    },
    async doSubmitScore() {
      const { score } = this.scoreForm
      if (score == null || score < 0 || score > 100) {
        return
      }
      try {
        this.submitting = true
        await submitScore(this.scoreForm)
        this.closeScoreModal()
        this.closeWorkModal()
        await this.fetchSubmissions(this.challenge.id)
      } catch (e) {
        console.error('评分失败')
      } finally {
        this.submitting = false
      }
    },
    async doApply() {
      try {
        await applyChallenge(this.challenge.id)
        this.applyStatus = 0
      } catch (e) {
        console.error('报名失败')
      }
    },
    goSubmitWork() {
      this.$router.push(`/challenge/${this.challenge.id}/submit`)
    },
    goProfile() {
      this.$router.push('/profile')
    },
    goBack() {
      this.$router.push('/challenge') // 或者 /challenges，根据你的路由配置
    },
    retry() {
      this.fetchDetail(this.$route.params.id)
    },
    getStatusClass(s) {
      s = Number(s)
      if (s === 0) return 'status-gray'
      if (s === 1) return 'status-active'
      if (s === 2) return 'status-review'
      if (s === 3) return 'status-ended'
      if (s === 4) return 'status-cancelled' // ✅ 新增
      return ''
    },
    getStatusText(s) {
      const m = {
        0: '未开始',
        1: '进行中',
        2: '评审中',
        3: '已结束',
        4: '已取消' // ✅ 新增
      }
      return m[Number(s)] || '未知'
    },
    formatDate(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
/* ... 保持原有样式不变，仅在底部追加 cancelled-state 相关样式 ... */

.challenge-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F5FA 0%, #F0E8F5 50%, #FFFFFF 100%);
  font-family: 'Nunito', sans-serif;
  color: #333;
}
.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ... 省略中间已有的 loader, error, hero, info, review, podium, works 等样式 ... */
/* 为了节省篇幅，这里只列出新增的 cancelled-state 样式，其他样式请保留原样 */

.loader-fullscreen, .error-state, .loading-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-size: 1.2rem;
  color: #666;
}
.cute-loader, .error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}
.retry-btn, .back-btn {
  margin-top: 10px;
  padding: 10px 30px;
  border: none;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
}
.retry-btn {
  background: #8E24AA;
  color: #fff;
}
.back-btn {
  background: #eee;
  color: #333;
}

/* ✅ 新增：已取消状态样式 */
.cancelled-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.cancelled-card {
  background: #fff;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid #fee2e2;
}

.cancelled-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.8;
}

.cancelled-title {
  font-size: 1.8rem;
  color: #991B1B; /* Red-800 */
  margin: 0 0 15px 0;
  font-weight: 800;
}

.cancelled-desc {
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 30px;
}

.cancelled-info-box {
  background: #FEF2F2; /* Red-50 */
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
}

.cancelled-info-box .info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 0.95rem;
}
.cancelled-info-box .info-row:last-child {
  margin-bottom: 0;
}
.cancelled-info-box .label {
  color: #9CA3AF;
  width: 80px;
  flex-shrink: 0;
}
.cancelled-info-box .value {
  color: #374151;
  font-weight: 600;
}

.back-btn-large {
  background: #1E293B;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}
.back-btn-large:hover {
  transform: translateY(-2px);
  background: #334155;
}

/* 原有样式继续... */
.status-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 12px;
  margin-bottom: 15px;
}
.status-active { background: #E8F5E9; color: #2E7D32; }
.status-gray { background: #f5f5f5; color: #757575; }
.status-review { background: #E3F2FD; color: #1565C0; }
.status-ended { background: #FFF3E0; color: #E65100; }
.status-cancelled { background: #FEF2F2; color: #DC2626; } /* ✅ 新增 */

.hero-section {
  background: #ffe4ff;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee;
}
.hero-cover {
  width: 100%;
  height: 400px;
}
.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-content {
  padding: 30px;
  margin-top: -100px;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
.hero-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 10px 0;
}
.hero-desc {
  font-size: 1rem;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: 20px;
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
}
.meta-icon {
  font-size: 1.2rem;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
@media (max-width: 768px) {
  .info-section {
    grid-template-columns: 1fr;
  }
}

.info-card, .action-card {
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee;
}
.card-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 15px 0;
}
.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.rule-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  font-size: 0.95rem;
  color: #555;
}
.rule-list li:last-child {
  border-bottom: none;
}

.action-info {
  margin-bottom: 20px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.info-row:last-child {
  border-bottom: none;
}
.info-label {
  color: #999;
  font-size: 0.9rem;
}
.info-value {
  font-weight: 700;
}
.info-value.success { color: #2E7D32; }
.info-value.error { color: #f44336; }
.info-value.warning { color: #F9A825; }
.info-value.canceled { color: #9E9E9E; }

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
  color: #fff;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(142, 36, 170, 0.4);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-accent {
  background: linear-gradient(135deg, #BA68C8, #CE93D8);
  color: #fff;
}
.btn-accent:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-disabled {
  background: #f5f5f5;
  color: #9E9E9E;
  cursor: not-allowed;
}

.review-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
}
.page-title {
  font-size: 2rem;
  margin: 10px 0;
  font-weight: 900;
}
.sub-text {
  color: #666;
  font-size: 1rem;
}
.review-time-bar {
  margin-top:15px;
  font-size:14px;
  color:#666;
  display:flex;
  gap:16px;
  flex-wrap:wrap;
  justify-content:center;
}

.podium-section {
  margin-bottom: 50px;
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee;
}
.section-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: 800;
}
.count-tag {
  font-size: 1rem;
  background: #E8F5E9;
  color: #2E7D32;
  padding: 4px 10px;
  border-radius: 20px;
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
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.3s ease;
  width: 160px;
}
.podium-item:hover {
  transform: scale(1.05);
}
.medal {
  font-size: 3rem;
  margin-bottom: -10px;
  z-index: 2;
}
.crown {
  position: absolute;
  top: -35px;
  font-size: 2.5rem;
  animation: float 2s infinite;
  z-index: 3;
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.photo-frame {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 5px solid #fff;
  box-shadow: 0 8px 20px rgba(106,27,154,0.15);
  overflow: hidden;
  background: #f5f5f5;
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
.user-info {
  margin-top: 15px;
  text-align: center;
  background: #fff;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(106,27,154,0.1);
  width: 100%;
}
.name {
  font-weight: 800;
  font-size: 0.95rem;
}
.work-title {
  font-size: 0.85rem;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.rank-2 { order: 1; margin-bottom: 40px; }
.rank-1 { order: 2; margin-bottom: 0; z-index: 10; }
.rank-3 { order: 3; margin-bottom: 40px; }

.all-works-section {
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee;
}
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
}
.work-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(106,27,154,0.08);
  border: 1px solid #eee;
  transition: transform 0.3s ease;
  cursor: pointer;
}
.work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(106,27,154,0.15);
}
.work-img-box {
  position: relative;
  padding-top: 100%;
  background: #f5f5f5;
}
.work-img-box img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.work-info {
  padding: 15px;
}
.w-title {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 5px;
}
.w-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
}
.w-score {
  color: #8E24AA;
  font-weight: 700;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

/* 弹窗 */
.score-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.score-modal {
  width: 90%;
  max-width: 800px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}
.score-left {
  flex: 1;
  background: #f4f4f4;
}
.score-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.score-right {
  width: 360px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.score-right h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-item label {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}
.form-item input,
.form-item textarea {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
}
.form-item textarea {
  min-height: 100px;
  resize: none;
}
.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit {
  flex: 2;
  padding: 12px;
  background: #8e24aa;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.score-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
}
.divider {
  height: 1px;
  background: #eee;
  margin: 10px 0;
}
.score-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}
.score-item {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}
.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.judge-name {
  font-weight: 700;
  color: #333;
}
.score-score {
  font-weight: 700;
  color: #8e24aa;
}
.score-comment {
  color: #666;
  padding-left: 4px;
}
.no-score-tip {
  color: #999;
  font-size: 14px;
}
.score-btn {
  width: 100%;
  padding: 12px;
  background: #8e24aa;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}
.score-btn.disabled {
  background: #aaa;
  cursor: not-allowed;
}

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
