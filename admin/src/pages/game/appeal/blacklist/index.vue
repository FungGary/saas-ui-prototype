<template>
  <div class="appeal-blacklist-page" :class="{ 'annotation-mode': showAnnotation }">
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
        />
      </div>
    </transition>

    <AnnotationHighlight />

    <!-- 顶部筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="80px"
        label-position="right"
        @submit.native.prevent
        inline
        id="blacklist-filter-section"
      >
        <el-form-item label="用户信息：">
          <entity-picker-input
            v-model="searchForm.userUid"
            :display="getBlacklistUserDisplay(searchForm.userUid)"
            placeholder="请选择用户"
            title="用户搜索"
            search-label="用户搜索"
            search-placeholder="请输入昵称/UID"
            :rows="blacklistUserOptions"
            :columns="userPickerColumns"
            row-key="userUid"
            :search-fields="['userNickName', 'userUid']"
          />
          <annotation-point
            title="【新增】用户信息筛选交互"
            content="优化前：筛选区缺少用户信息查询入口，无法按用户维度快速定位记录。&#10;&#10;优化后：新增带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，提升定位效率并减少误选。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="封禁时长：">
          <el-select
            v-model="searchForm.banDuration"
            placeholder="请选择封禁时长"
            clearable
            class="form_content_width"
          >
            <el-option label="3天" value="3d"></el-option>
            <el-option label="7天" value="7d"></el-option>
            <el-option label="30天" value="30d"></el-option>
            <el-option label="永久" value="permanent"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封禁时间：">
          <el-date-picker
            v-model="searchForm.banDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="form_content_width"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="到期时间：">
          <el-date-picker
            v-model="searchForm.expireDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="form_content_width"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button class="ResetSearch" @click="reset('searchForm')">重置</el-button>
          <el-button type="primary" @click="userSearchs">搜索</el-button>
          <annotation-point
            title="【新增】筛选条件与用户弹窗搜索"
            content="优化前：申诉黑名单缺少用户信息查询入口，且封禁维度筛选不完整。&#10;&#10;优化后：新增用户信息弹窗搜索，并保留封禁时长、封禁时间、到期时间筛选。用户入口使用带搜索图标的只读输入框，点击后打开用户搜索弹窗进行选择。&#10;&#10;原因：黑名单数量多时更方便按用户、封禁时长和时间范围快速定位记录，提升运营处理效率。"
            priority="P1"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格标题 + 操作栏 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <el-row :gutter="24" justify="space-between" class="table-header-row">
        <el-col :span="12">
          <div style="display: inline-block; position: relative;">
            <span class="table-title" id="blacklist-page-title">申诉黑名单</span>
            <span class="table-desc">（限制用户发起申诉，如需全站封禁，请前往用户黑名单模块）</span>
            <annotation-point
              title="【优化】页面定位说明"
              content="优化前：页面标题为'恶意名单'，限制范围不清楚。&#10;&#10;优化后：改为'申诉黑名单'，并说明：限制用户发起申诉。如果是全站封禁，需改为'用户黑名单'。&#10;&#10;原因：避免误解为全站封禁、禁止游戏或禁止登录，明确当前黑名单的具体作用范围。"
              priority="P1"
            />
          </div>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button class="mr10" @click="exportList">导出</el-button>
        </el-col>
      </el-row>

      <!-- 核心数据表格 -->
      <el-table
        :data="tableData"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        no-filtered-data-text="暂无筛选结果"
      >
        <el-table-column label="ID" prop="id" width="80"></el-table-column>
        <el-table-column label="关联申诉单号" prop="appealNo" min-width="140">
          <template slot-scope="scope">
            <div style="position: relative; display: inline-block;">
              <span class="appeal-no">{{ scope.row.appealNo }}</span>
              <annotation-point
                v-if="scope.$index === 0"
                title="【新增】关联申诉单号"
                content="优化前：当前看不到由哪条申诉加入黑名单。&#10;&#10;优化后：增加关联申诉单号或来源记录。从申诉列表加入时自动关联。&#10;&#10;原因：方便追溯处罚依据，便于运营查看黑名单用户的来源申诉记录。"
                priority="P0"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="180">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <el-avatar :size="40" shape="circle">
                <img v-if="scope.row.userAvatar" :src="scope.row.userAvatar" />
                <i v-else class="el-icon-user" style="font-size: 20px;"></i>
              </el-avatar>
              <div class="user-info-detail">
                <div class="user-nickname">{{ scope.row.userNickName }}</div>
                <div class="user-uid">编号：{{ scope.row.userUid }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="封禁时长" prop="banDurationText" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.banDuration === 'permanent' ? 'danger' : 'warning'">
              {{ scope.row.banDurationText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="封禁时间" prop="banTime" width="160"></el-table-column>
        <el-table-column label="到期时间" prop="expireTime" width="160">
          <template slot-scope="scope">
            <span :class="['expire-time', scope.row.isExpired ? 'expired' : '']">
              {{ scope.row.isExpired ? '已过期' : scope.row.expireTime }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="封禁原因" prop="banReason" min-width="150">
          <template slot-scope="scope">
            <span class="reason-text">{{ scope.row.banReason }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isExpired ? 'info' : 'danger'">
              {{ scope.row.isExpired ? '已过期' : '封禁中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEditDuration(scope.row)">修改时长</el-button>
            <el-button size="mini" type="primary" @click="handleUnban(scope.row)">解禁</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部翻页 -->
      <div class="acea-row row-right page">
        <pagination
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <!-- 修改封禁时长弹窗 -->
    <el-dialog
      :visible.sync="editDurationVisible"
      title="修改封禁时长"
      width="450px"
      :close-on-click-modal="false"
      center
      @closed="handleEditDurationClosed"
    >
      <div v-if="currentEditRow" class="edit-dialog-content">
        <div class="info-section" id="edit-duration-current-info" style="position: relative;">
          <annotation-point
            title="【优化】当前时长与新到期时间展示"
            content="优化前：弹窗只展示禁止时长。&#10;&#10;优化后：显示当前到期时间、当前封禁原因、新到期时间。&#10;&#10;原因：修改前后对比更清晰，便于运营确认修改内容，减少误操作。"
            priority="P0"
          />
          <div class="info-item">
            <span class="label">当前到期时间：</span>
            <span class="value">{{ currentEditRow.expireTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前封禁原因：</span>
            <span class="value">{{ currentEditRow.banReason }}</span>
          </div>
        </div>

        <el-divider></el-divider>

        <el-form :model="editForm" label-width="100px" class="form-container">
          <el-form-item label="* 新封禁时长">
            <el-select
              v-model="editForm.newDuration"
              placeholder="请选择新封禁时长"
              class="form-select"
            >
              <el-option label="3天" value="3d"></el-option>
              <el-option label="7天" value="7d"></el-option>
              <el-option label="30天" value="30d"></el-option>
              <el-option label="永久" value="permanent"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="新到期时间（预览）">
            <el-tag type="info">{{ newExpireTimeText }}</el-tag>
          </el-form-item>
          <el-form-item label="* 修改原因" id="edit-duration-reason">
            <div style="position: relative;">
              <el-input
                v-model="editForm.editReason"
                type="textarea"
                :maxlength="200"
                placeholder="请输入修改原因"
                :rows="3"
                class="form-textarea"
              ></el-input>
              <annotation-point
                title="【优化】修改原因必填"
                content="优化前：修改时长无需填写原因。&#10;&#10;优化后：修改封禁时长必须填写原因。&#10;&#10;原因：延长或缩短处罚都需要可追溯，便于后续审计和问题复查。"
                priority="P0"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDurationVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditDurationConfirm">确定</el-button>
      </span>
    </el-dialog>

    <!-- 解禁弹窗 -->
    <el-dialog
      :visible.sync="unbanVisible"
      title="解禁用户"
      width="450px"
      :close-on-click-modal="false"
      center
      @closed="handleUnbanClosed"
    >
      <div v-if="currentUnbanRow" class="unban-dialog-content">
        <div class="warning-box" id="unban-warning" style="position: relative;">
          <annotation-point
            title="【优化】解禁影响提示"
            content="优化前：当前只问'确定解除封禁吗'。&#10;&#10;优化后：展示解除后用户可重新发起申诉。&#10;&#10;原因：让操作人明确解禁后果，防止随意解除处罚。"
            priority="P1"
          />
          <i class="el-icon-info"></i>
          <span>解除后用户可重新发起申诉</span>
        </div>

        <el-form :model="unbanForm" label-width="80px" class="form-container">
          <el-form-item label="* 解禁原因" id="unban-reason">
            <div style="position: relative;">
              <el-input
                v-model="unbanForm.unbanReason"
                type="textarea"
                :maxlength="200"
                placeholder="请输入解禁原因"
                :rows="3"
                class="form-textarea"
              ></el-input>
              <annotation-point
                title="【优化】解禁原因必填"
                content="优化前：解禁只做简单确认。&#10;&#10;优化后：解禁时必须填写原因。&#10;&#10;原因：防止随意解除处罚，解禁操作需要有依据，便于后续追溯和审计。"
                priority="P0"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="unbanVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUnbanConfirm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight';
import AnnotationPanel from '@/components/annotation/AnnotationPanel';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'game_appeal_blacklist',
  components: {
    EntityPickerInput,
    AnnotationPoint,
    AnnotationHighlight,
    AnnotationPanel,
  },
  data() {
    return {
      showAnnotation: false,
      activeAnnotationId: null,
      annotations: [],
      loading: false,
      total: 0,
      tableData: [],
      allData: [],
      userPickerColumns: [
        { label: '用户昵称', prop: 'userNickName', minWidth: 180 },
        { label: 'UID', prop: 'userUid', width: 160 },
      ],

      searchForm: {
        userUid: '',
        banDuration: '',
        banDateRange: [],
        expireDateRange: [],
        page: 1,
        limit: 10,
      },

      currentEditRow: null,
      editDurationVisible: false,
      editForm: {
        newDuration: '',
        editReason: '',
      },

      currentUnbanRow: null,
      unbanVisible: false,
      unbanForm: {
        unbanReason: '',
      },

      mockData: [
        {
          id: 1,
          appealNo: 'AP20260622JQD2LL707220420059138',
          userUid: 'U100',
          userNickName: 'Beedo',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          banDuration: '7d',
          banDurationText: '7天',
          banTime: '2026-06-22 14:30:00',
          expireTime: '2026-06-29 14:30:00',
          banReason: '频繁恶意申诉',
          isExpired: false,
        },
        {
          id: 2,
          appealNo: 'AP20260620JQD5LL707220420059140',
          userUid: 'U200',
          userNickName: '测试用户A',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          banDuration: 'permanent',
          banDurationText: '永久',
          banTime: '2026-06-20 10:00:00',
          expireTime: '永久',
          banReason: '恶意刷单',
          isExpired: false,
        },
        {
          id: 3,
          appealNo: 'AP20260615JQD8LL707220420059142',
          userUid: 'U201',
          userNickName: '测试用户B',
          userAvatar: '',
          banDuration: '3d',
          banDurationText: '3天',
          banTime: '2026-06-15 16:00:00',
          expireTime: '2026-06-18 16:00:00',
          banReason: '辱骂客服',
          isExpired: true,
        },
        {
          id: 4,
          appealNo: 'AP20260618JQD0LL707220420059145',
          userUid: 'U202',
          userNickName: '测试用户C',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          banDuration: '30d',
          banDurationText: '30天',
          banTime: '2026-06-18 09:00:00',
          expireTime: '2026-07-18 09:00:00',
          banReason: '提供虚假凭证',
          isExpired: false,
        },
        {
          id: 5,
          appealNo: 'AP20260610JQD2LL707220420059148',
          userUid: 'U203',
          userNickName: '测试用户D',
          userAvatar: '',
          banDuration: '7d',
          banDurationText: '7天',
          banTime: '2026-06-10 14:00:00',
          expireTime: '2026-06-17 14:00:00',
          banReason: '恶意攻击系统',
          isExpired: true,
        },
      ],
    };
  },
  computed: {
    blacklistUserOptions() {
      const map = new Map();
      this.allData.forEach(item => {
        if (!map.has(item.userUid)) map.set(item.userUid, item);
      });
      return Array.from(map.values());
    },
    newExpireTimeText() {
      if (!this.editForm.newDuration || !this.currentEditRow) return '-';
      if (this.editForm.newDuration === 'permanent') return '永久';
      const days = parseInt(this.editForm.newDuration.replace('d', ''));
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + days);
      return expireDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-');
    },
  },
  created() {
    this.allData = [...this.mockData];
    this.getList();
  },
  methods: {
    getBlacklistUserDisplay(uid) {
      const user = this.blacklistUserOptions.find(item => item.userUid === uid);
      if (!user) return '';
      return (user.userNickName || '-') + '（' + (user.userUid || '-') + '）';
    },
    getList() {
      this.loading = true;
      setTimeout(() => {
        let filteredData = [...this.allData];

        if (this.searchForm.userUid) {
          filteredData = filteredData.filter((item) => item.userUid === this.searchForm.userUid);
        }

        if (this.searchForm.banDuration) {
          filteredData = filteredData.filter((item) => item.banDuration === this.searchForm.banDuration);
        }

        if (this.searchForm.banDateRange && this.searchForm.banDateRange.length === 2) {
          const startDate = new Date(this.searchForm.banDateRange[0]).getTime();
          const endDate = new Date(this.searchForm.banDateRange[1] + ' 23:59:59').getTime();
          filteredData = filteredData.filter((item) => {
            const banTime = new Date(item.banTime).getTime();
            return banTime >= startDate && banTime <= endDate;
          });
        }

        if (this.searchForm.expireDateRange && this.searchForm.expireDateRange.length === 2) {
          const startDate = new Date(this.searchForm.expireDateRange[0]).getTime();
          const endDate = new Date(this.searchForm.expireDateRange[1] + ' 23:59:59').getTime();
          filteredData = filteredData.filter((item) => {
            if (item.expireTime === '永久') return false;
            const expireTime = new Date(item.expireTime).getTime();
            return expireTime >= startDate && expireTime <= endDate;
          });
        }

        this.total = filteredData.length;

        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableData = filteredData.slice(start, end);

        this.loading = false;
      }, 300);
    },

    userSearchs() {
      this.searchForm.page = 1;
      this.getList();
    },

    reset(name) {
      this.searchForm = {
        userUid: '',
        banDuration: '',
        banDateRange: [],
        expireDateRange: [],
        page: 1,
        limit: 10,
      };
      this.getList();
    },

    pageChange() {
      this.getList();
    },

    handleEditDuration(row) {
      this.currentEditRow = row;
      this.editForm = {
        newDuration: row.banDuration,
        editReason: '',
      };
      this.editDurationVisible = true;
    },

    handleEditDurationConfirm() {
      if (!this.editForm.newDuration) {
        this.$message.warning('请选择新封禁时长');
        return;
      }
      if (!this.editForm.editReason.trim()) {
        this.$message.warning('请填写修改原因');
        return;
      }

      this.$confirm(
        `确认修改封禁时长？\n新时长：${this.getDurationText(this.editForm.newDuration)}\n新到期时间：${this.newExpireTimeText}\n修改原因：${this.editForm.editReason}`,
        '确认修改',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          const row = this.allData.find((item) => item.id === this.currentEditRow.id);
          if (row) {
            row.banDuration = this.editForm.newDuration;
            row.banDurationText = this.getDurationText(this.editForm.newDuration);
            row.expireTime = this.newExpireTimeText;
          }
          this.$message.success('修改成功');
          this.editDurationVisible = false;
          this.getList();
        })
        .catch(() => {});
    },

    handleEditDurationClosed() {
      this.currentEditRow = null;
      this.editForm = {
        newDuration: '',
        editReason: '',
      };
    },

    handleUnban(row) {
      this.currentUnbanRow = row;
      this.unbanForm = {
        unbanReason: '',
      };
      this.unbanVisible = true;
    },

    handleUnbanConfirm() {
      if (!this.unbanForm.unbanReason.trim()) {
        this.$message.warning('请填写解禁原因');
        return;
      }

      this.$confirm(
        `确认解禁用户【${this.currentUnbanRow.userNickName}】？\n解禁原因：${this.unbanForm.unbanReason}`,
        '确认解禁',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success',
        }
      )
        .then(() => {
          this.allData = this.allData.filter((item) => item.id !== this.currentUnbanRow.id);
          this.$message.success('解禁成功，用户可重新发起申诉');
          this.unbanVisible = false;
          this.getList();
        })
        .catch(() => {});
    },

    handleUnbanClosed() {
      this.currentUnbanRow = null;
      this.unbanForm = {
        unbanReason: '',
      };
    },

    getDurationText(duration) {
      const durationMap = {
        '3d': '3天',
        '7d': '7天',
        '30d': '30天',
        'permanent': '永久',
      };
      return durationMap[duration] || duration;
    },

    exportList() {
      this.$message.info('导出功能开发中');
    },

    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleMarkerClick(annotationId) {
      this.activeAnnotationId = annotationId;
      const annotation = this.annotations.find(a => a.id === annotationId);
      if (annotation && this.$refs.annotationPanel) {
        this.$refs.annotationPanel.selectAnnotation(annotation);
      }
    },
    handleAnnotationSelect(annotation) {
      this.activeAnnotationId = annotation.id;
      const markerElements = document.querySelectorAll('.annotation-marker');
      markerElements.forEach(el => el.classList.remove('active'));
      const activeMarker = document.querySelector(`.annotation-marker[data-id="${annotation.id}"]`);
      if (activeMarker) {
        activeMarker.classList.add('active');
        activeMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
    this.bus.$on('annotationMarkerClick', this.handleMarkerClick);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
    this.bus.$off('annotationMarkerClick', this.handleMarkerClick);
  },
};
</script>

<style lang="scss" scoped>
.form_content_width {
  width: 200px;
}

.ResetSearch {
  border: 1px solid #dcdfe6;
  color: #606266;
  margin-right: 10px;
}

.mt16 {
  margin-top: 16px;
}

.table-header-row {
  margin-top: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-desc {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.mr10 {
  margin-right: 10px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-nickname {
  font-size: 14px;
  color: #303133;
}

.user-uid {
  font-size: 12px;
  color: #909399;
}

.appeal-no {
  font-size: 13px;
  color: #409eff;
}

.reason-text {
  font-size: 13px;
  color: #606266;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.expire-time {
  &.expired {
    color: #909399;
  }
}

.page {
  margin-top: 20px;
}

.edit-dialog-content,
.unban-dialog-content {
  padding: 0 5px;
}

.info-section {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    font-size: 13px;
    color: #606266;
  }

  .value {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }
}

.form-container {
  margin-top: 10px;
}

.form-select {
  width: 100%;
}

.form-textarea {
  width: 100%;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #67c23a;
  background: #f0f9eb;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 16px;

  i {
    font-size: 16px;
  }
}

.appeal-blacklist-page {
  position: relative;
  min-height: 100vh;

  &.annotation-mode {
    padding-right: 380px;
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-active {
  transform: translateX(100%);
}
</style>