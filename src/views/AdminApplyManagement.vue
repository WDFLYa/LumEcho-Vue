<template>
  <div class="admin-container">
    <AdminNavBar
        :user-avatar="currentUserAvatar"
        :user-name="currentUserName"
    />

    <main class="content-wrapper">
      <header class="page-header">
        <div class="welcome-text">
          <h1>🏆 挑战赛报名审核</h1>
          <p>审核报名、管理状态、查看用户信息</p>
        </div>
        <div class="date-badge">
          📅 {{ currentDate }}
        </div>
      </header>

      <div class="challenge-list-card">
        <h2 class="section-title">待开始挑战赛</h2>

        <div class="challenge-item"
             v-for="challenge in challengeList"
             :key="challenge.id">

          <div class="challenge-header">
            <div class="challenge-info">
              <div class="icon">🏆</div>
              <div>
                <h3>{{ challenge.title }}</h3>

                <!-- 🔥 只改这里：挑战赛只显示年月日 -->
                <p>
                  {{ challenge.startTime?.slice(0,10) }} 至
                  {{ challenge.endTime?.slice(0,10) }}
                </p>

                <p class="small">报名人数：{{ challenge.participantCount }}</p>
              </div>
            </div>

            <el-button
                type="primary"
                size="small"
                @click="() => toggleChallenge(challenge.id)"
            >
              {{ expandedId === challenge.id ? '收起' : '查看' }}
            </el-button>
          </div>

          <div class="expand-section" v-show="expandedId === challenge.id">
            <el-table :data="tableData" border stripe style="width:100%">
              <el-table-column label="ID" prop="application.id" align="center" />
              <el-table-column label="用户名" prop="username" align="center" />
              <el-table-column label="头像" align="center">
                <template #default="scope">
                  <el-avatar :src="scope.row.avatar" />
                </template>
              </el-table-column>

              <!-- 🔥 报名时间 完全不动！保留完整年月日时分秒 -->
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
                      @click="handleApprove(scope.row.application.id)"
                      v-if="scope.row.application.status === 0"
                  >
                    通过
                  </el-button>
                  <el-button
                      type="danger"
                      size="small"
                      @click="handleReject(scope.row.application.id)"
                      v-if="scope.row.application.status === 0"
                  >
                    拒绝
                  </el-button>
                  <span v-else>—</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminNavBar from "@/components/NavBar/AdminNavBar.vue";
import { getCurrentUserInfo } from "@/api/auth";
import {
  listPendingChallenges,
  getChallengeApplyList,
  approveApply,
  rejectApplyWithRemark
} from '@/api/challenge.js'

const currentUserAvatar = ref('')
const currentUserName = ref('')
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}))

const challengeList = ref([])
const expandedId = ref(null)
const tableData = ref([])

const rejectVisible = ref(false)
const currentRejectId = ref(null)
const rejectRemark = ref('')

const statusMap = {
  0: { text: '待审核', type: 'warning' },
  1: { text: '已通过', type: 'success' },
  2: { text: '已拒绝', type: 'danger' },
  3: { text: '已取消', type: 'info' },
}

const fetchUserInfo = async () => {
  try {
    const res = await getCurrentUserInfo()
    const data = res.data.code === 200 ? res.data.data : res.data
    if (data) {
      currentUserAvatar.value = data.avatar
      currentUserName.value = data.username
    }
  } catch (e) {
    console.warn('获取用户信息失败')
  }
}

const loadPendingChallenges = async () => {
  try {
    const res = await listPendingChallenges()
    challengeList.value = res.data.data || []
  } catch (e) {
    ElMessage.error('加载比赛列表失败')
  }
}

const toggleChallenge = async (id) => {
  if (expandedId.value === id) {
    expandedId.value = null
    tableData.value = []
  } else {
    expandedId.value = id
    const res = await getChallengeApplyList(id)
    tableData.value = res.data.data || []
  }
}

const handleApprove = async (id) => {
  await ElMessageBox.confirm('确定通过该报名？')
  await approveApply(id)
  ElMessage.success('操作成功')
  toggleChallenge(expandedId.value)
}

const handleReject = (id) => {
  currentRejectId.value = id
  rejectRemark.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectRemark.value) {
    ElMessage.warning('请填写拒绝理由')
    return
  }
  await rejectApplyWithRemark(currentRejectId.value, rejectRemark.value)
  ElMessage.success('已拒绝')
  rejectVisible.value = false
  toggleChallenge(expandedId.value)
}

const getStatusTagType = (status) => statusMap[status]?.type || 'info'
const getStatusText = (status) => statusMap[status]?.text || '未知'

onMounted(async () => {
  await fetchUserInfo()
  await loadPendingChallenges()
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

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.challenge-list-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(100,181,246,0.05);
  border: 1px solid #F0F4F8;
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
}
</style>