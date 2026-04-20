<template>
  <div class="admin-container">
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
    />

    <main class="content-wrapper">
      <header class="page-header">
        <div class="welcome-text">
          <h1>🏆 报名审核中心</h1>
          <p>挑战赛 & 活动统一审核管理</p>
        </div>
        <div class="date-badge">
          📅 {{ currentDate }}
        </div>
      </header>

      <div class="tab-navigation">
        <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ 'active': activeTab === tab.key }"
            @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-badge" v-if="getTabCount(tab.key) > 0">
            {{ getTabCount(tab.key) }}
          </span>
        </div>
      </div>

      <div class="content-area">
        <div v-if="activeTab === 'all' || activeTab === 'challenge'" class="section-block">
          <h2 class="section-title" v-if="activeTab === 'challenge'">🏆 挑战赛列表</h2>

          <div class="challenge-item" v-for="challenge in filteredChallenges" :key="challenge.id">
            <div class="challenge-header">
              <div class="challenge-info">
                <div class="icon">🏆</div>
                <div>
                  <h3>{{ challenge.title }}</h3>
                  <p>
                    {{ challenge.startTime?.slice(0,10) }} 至
                    {{ challenge.endTime?.slice(0,10) }}
                  </p>
                  <p class="small">
                    <!-- 这里我帮你改好了！ -->
                    总报名：{{ challenge.applyCount || 0 }} |
                    已通过：{{ challenge.participantCount || 0 }}
                  </p>
                </div>
              </div>

              <el-button
                  type="primary"
                  size="small"
                  @click="() => toggleChallenge(challenge.id)"
              >
                {{ expandedChallengeId === challenge.id ? '收起' : '查看' }}
              </el-button>
            </div>

            <div class="expand-section" v-show="expandedChallengeId === challenge.id">
              <el-table :data="challengeTableData" border stripe>
                <el-table-column label="ID" prop="application.id" align="center" />
                <el-table-column label="用户名" prop="username" align="center" />
                <el-table-column label="头像" align="center">
                  <template #default="scope">
                    <el-avatar :src="scope.row.avatar" />
                  </template>
                </el-table-column>
                <el-table-column label="报名时间" prop="application.applyTime" align="center" />
                <el-table-column label="状态" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.application.status)">
                      {{ getStatusText(scope.row.application.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="application.remark" align="center" />
                <el-table-column label="操作" width="160" align="center">
                  <template #default="scope">
                    <el-button
                        type="success"
                        size="small"
                        @click="handleApprove(scope.row.application.id, 'challenge')"
                        v-if="scope.row.application.status === 0"
                    >通过</el-button>

                    <el-button
                        type="danger"
                        size="small"
                        @click="handleReject(scope.row.application.id, 'challenge')"
                        v-if="scope.row.application.status === 0"
                    >拒绝</el-button>

                    <span v-else>—</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'all' || activeTab === 'activity'" class="section-block">
          <h2 class="section-title" v-if="activeTab === 'activity'">🎯 活动列表</h2>

          <div class="challenge-item" v-for="activity in filteredActivities" :key="activity.id">
            <div class="challenge-header">
              <div class="challenge-info">
                <div class="icon">🎯</div>
                <div>
                  <h3>{{ activity.title }}</h3>
                  <p>
                    {{ activity.startTime?.slice(0,10) }} 至
                    {{ activity.endTime?.slice(0,10) }}
                  </p>
                  <p class="small">
                    总报名：{{ activity.applyCount || 0 }} |
                    已通过：{{ activity.currentParticipants }}
                  </p>
                </div>
              </div>

              <el-button
                  type="primary"
                  size="small"
                  @click="() => toggleActivity(activity.id)"
              >
                {{ expandedActivityId === activity.id ? '收起' : '查看' }}
              </el-button>
            </div>

            <div class="expand-section" v-show="expandedActivityId === activity.id">
              <el-table :data="activityTableData" border stripe>
                <el-table-column label="ID" prop="application.id" align="center" />
                <el-table-column label="用户名" prop="username" align="center" />
                <el-table-column label="头像" align="center">
                  <template #default="scope">
                    <el-avatar :src="scope.row.avatar" />
                  </template>
                </el-table-column>
                <el-table-column label="报名时间" prop="application.applyTime" align="center" />
                <el-table-column label="状态" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.application.status)">
                      {{ getStatusText(scope.row.application.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="application.remark" align="center" />
                <el-table-column label="操作" width="160" align="center">
                  <template #default="scope">
                    <el-button
                        type="success"
                        size="small"
                        @click="handleApprove(scope.row.application.id, 'activity')"
                        v-if="scope.row.application.status === 0"
                    >通过</el-button>

                    <el-button
                        type="danger"
                        size="small"
                        @click="handleReject(scope.row.application.id, 'activity')"
                        v-if="scope.row.application.status === 0"
                    >拒绝</el-button>

                    <span v-else>—</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>

        <div v-if="filteredChallenges.length === 0 && filteredActivities.length === 0" class="empty-state">
          <p>暂无待审核内容</p>
        </div>
      </div>

      <el-dialog v-model="rejectVisible" title="拒绝申请" width="500px">
        <el-input v-model="rejectRemark" type="textarea" rows="3" placeholder="请输入拒绝理由" />
        <template #footer>
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确定</el-button>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getCurrentUserInfo } from "@/api/auth";

import {
  listPendingChallenges,
  getChallengeApplyList,
  approveApply as approveChallenge,
  rejectApplyWithRemark
} from '@/api/challenge.js'

import {
  getPendingActivityList,
  getActivityApplyList,
  approveApply as approveActivity,
  rejectApply
} from '@/api/activity.js'

const currentUserAvatar = ref('')
const currentUserName = ref('')
const currentDate = ref(new Date().toLocaleDateString())

const challengeList = ref([])
const activityList = ref([])

const expandedChallengeId = ref(null)
const expandedActivityId = ref(null)

const challengeTableData = ref([])
const activityTableData = ref([])

const activeTab = ref('all')
const tabs = [
  { key: 'all', label: '全部', icon: '📂' },
  { key: 'challenge', label: '挑战赛', icon: '🏆' },
  { key: 'activity', label: '活动', icon: '🎯' },
]

const rejectVisible = ref(false)
const currentRejectId = ref(null)
const rejectType = ref('')
const rejectRemark = ref('')

const statusMap = {
  0: { text: '待审核', type: 'warning' },
  1: { text: '已通过', type: 'success' },
  2: { text: '已拒绝', type: 'danger' },
}

const filteredChallenges = computed(() => {
  if (activeTab.value === 'all' || activeTab.value === 'challenge') {
    return challengeList.value
  }
  return []
})

const filteredActivities = computed(() => {
  if (activeTab.value === 'all' || activeTab.value === 'activity') {
    return activityList.value
  }
  return []
})

const getTabCount = (key) => {
  if (key === 'challenge') return challengeList.value.length
  if (key === 'activity') return activityList.value.length
  return challengeList.value.length + activityList.value.length
}

const fetchUserInfo = async () => {
  const res = await getCurrentUserInfo()
  const data = res.data.data
  currentUserAvatar.value = data.avatar
  currentUserName.value = data.username
}

const loadChallenges = async () => {
  const res = await listPendingChallenges()
  challengeList.value = res.data.data || []
}

const toggleChallenge = async (id) => {
  if (expandedChallengeId.value === id) {
    expandedChallengeId.value = null
    challengeTableData.value = []
  } else {
    expandedChallengeId.value = id
    const res = await getChallengeApplyList(id)
    challengeTableData.value = (res.data.data || []).map(item => ({
      ...item,
      application: item.application || {
        id: item.id,
        status: item.status,
        remark: item.remark || '',
        applyTime: item.applyTime || item.createTime
      }
    }))
  }
}

const loadActivities = async () => {
  const res = await getPendingActivityList()
  activityList.value = res.data.data || []
}

const toggleActivity = async (id) => {
  if (expandedActivityId.value === id) {
    expandedActivityId.value = null
    activityTableData.value = []
  } else {
    expandedActivityId.value = id
    const res = await getActivityApplyList(id)
    activityTableData.value = (res.data.data || []).map(item => ({
      ...item,
      application: {
        id: item.id,
        status: item.status,
        remark: item.remark || '',
        applyTime: item.createTime
      }
    }))
  }
}

const handleApprove = async (id, type) => {
  await ElMessageBox.confirm('确定通过？')
  if (type === 'challenge') {
    await approveChallenge(id)
    await toggleChallenge(expandedChallengeId.value)
    await loadChallenges()
  } else {
    await approveActivity(id)
    await toggleActivity(expandedActivityId.value)
    await loadActivities()
  }
  ElMessage.success('操作成功')
}

const handleReject = (id, type) => {
  currentRejectId.value = id
  rejectType.value = type
  rejectRemark.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectRemark.value) {
    ElMessage.warning('请输入理由')
    return
  }
  if (rejectType.value === 'challenge') {
    await rejectApplyWithRemark(currentRejectId.value, rejectRemark.value)
    await toggleChallenge(expandedChallengeId.value)
    await loadChallenges()
  } else {
    await rejectApply(currentRejectId.value)
    await toggleActivity(expandedActivityId.value)
    await loadActivities()
  }
  rejectVisible.value = false
  ElMessage.success('已拒绝')
}

const getStatusTagType = (status) => statusMap[status]?.type || 'info'
const getStatusText = (status) => statusMap[status]?.text || '未知'

onMounted(async () => {
  await fetchUserInfo()
  await loadChallenges()
  await loadActivities()
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #F7FAFC;
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  color: #455A64;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.welcome-text p {
  margin: 0;
  color: #78909C;
  font-size: 15px;
}

.date-badge {
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #0277BD;
  box-shadow: 0 4px 10px rgba(129,212,250,0.15);
  border: 1px solid #E1F5FE;
}

.tab-navigation {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  background: #fff;
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #F0F4F8;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #78909C;
  position: relative;
  overflow: hidden;
}

.tab-item:hover {
  background-color: #F5F7FA;
  color: #0288D1;
}

.tab-item.active {
  background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%);
  color: #0277BD;
  box-shadow: 0 4px 8px rgba(2, 119, 189, 0.15);
}

.tab-icon {
  margin-right: 8px;
  font-size: 18px;
}

.tab-badge {
  margin-left: 8px;
  background: #fff;
  color: #0277BD;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.content-area {
  animation: fadeIn 0.4s ease;
}

.section-block {
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #29B6F6;
}

.challenge-item {
  margin-bottom: 12px;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fbfc;
  border-radius: 16px;
  border: 1px solid #f0f4f8;
  transition: all 0.2s;
}

.challenge-header:hover {
  border-color: #B3E5FC;
  box-shadow: 0 4px 12px rgba(179, 229, 252, 0.3);
}

.challenge-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.challenge-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.challenge-info p {
  margin: 0;
  font-size: 13px;
  color: #78909c;
}

.small {
  font-size: 12px !important;
  color: #90a4ae !important;
  margin-top: 4px !important;
}

.expand-section {
  padding: 16px;
  background: #fff;
  border-radius: 0 0 16px 16px;
  border: 1px solid #f0f4f8;
  border-top: none;
  animation: slideDown 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #B0BEC5;
  background: #fff;
  border-radius: 20px;
  border: 2px dashed #ECEFF1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>