<template>
  <el-dialog title="禁言设置" :visible.sync="visible" width="550px" :close-on-click-modal="false">
    <AnnotationHighlight />
    <div class="modal-content">
      <div class="section">
        <div class="section-title">
          <i class="el-icon-user"></i>
          <span>当前用户</span>
          <annotation-point 
            title="【新增】用户信息展示" 
            content="优化前：弹窗中没有用户信息展示，运营禁言时不清楚当前操作对象，容易搞错用户。&#10;&#10;优化后：弹窗顶部新增当前用户信息展示，包括头像、昵称、用户编号。&#10;&#10;原因：确保运营在禁言操作前能准确确认操作对象，避免误操作，提升风控管理安全性。" 
            priority="P0"
          />
        </div>
        <div class="user-info">
          <img :src="user.avatar" class="avatar" />
          <div class="user-detail">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-id">用户编号: {{ user.userId }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <i class="el-icon-settings"></i>
          <span>禁言设置</span>
          <annotation-point 
            title="【优化】禁言弹窗操作" 
            content="优化前：列表中通过开关直接禁言，操作简单但信息不足，无法记录详细原因和设置。&#10;&#10;优化后：点击后弹出禁言弹窗，包含：禁言用户信息、禁言原因、禁言时长、禁言范围（全平台/指定房间/评论区）、禁言影响文字提示、操作日志记录。&#10;&#10;原因：规范禁言操作流程，确保每次禁言都有明确的原因和记录，便于后续追溯和审计，提升风控管理质量。" 
            priority="P0"
          />
        </div>
        <div class="mute-form">
          <div class="form-row" id="mute-reason">
            <div class="form-item full">
              <span class="form-label required">禁言原因 *</span>
              <el-input
                v-model="form.reason"
                placeholder="请输入禁言原因，便于后续查询与追溯"
                type="textarea"
                :maxlength="200"
                :rows="3"
                class="reason-textarea"
              ></el-input>
            </div>
          </div>

          <div class="form-row" id="mute-duration">
            <div class="form-item">
              <span class="form-label required">禁言时长 *</span>
              <div class="duration-group">
                <label
                  v-for="option in durationOptions"
                  :key="option.value"
                  :class="['duration-label', { active: form.duration === option.value }]"
                >
                  <input type="radio" v-model="form.duration" :value="option.value" />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row" v-if="form.duration === 'custom'" id="mute-custom-duration">
            <div class="form-item">
              <span class="form-label required">自定义时长 *</span>
              <div class="custom-duration-wrapper">
                <el-input
                  v-model="form.customDuration"
                  placeholder="请输入数字"
                  class="custom-duration-input"
                  type="number"
                ></el-input>
                <el-select v-model="form.customUnit" placeholder="单位" class="custom-unit-select">
                  <el-option value="hours" label="小时"></el-option>
                  <el-option value="days" label="天"></el-option>
                </el-select>
              </div>
            </div>
          </div>

          <div class="form-row" id="mute-scope">
            <div class="form-item">
              <span class="form-label">禁言范围</span>
              <div class="scope-group">
                <label
                  v-for="option in scopeOptions"
                  :key="option.value"
                  :class="['scope-label', { active: form.scope === option.value }]"
                >
                  <input type="radio" v-model="form.scope" :value="option.value" />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row" v-if="form.scope === 'room'">
            <div class="form-item">
              <span class="form-label">选择房间</span>
              <el-select v-model="form.room" placeholder="请选择房间" class="room-select">
                <el-option value="" label="请选择房间"></el-option>
                <el-option value="1" label="房间1"></el-option>
                <el-option value="2" label="房间2"></el-option>
                <el-option value="3" label="房间3"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <div class="warning-section" id="mute-warning">
        <i class="el-icon-warning"></i>
        <span>禁言后，用户将在所选范围内无法发言。请谨慎操作，并确保已记录禁言原因。</span>
      </div>

      <div class="notice-section" id="mute-unmute-notice">
        <i class="el-icon-info"></i>
        <span>操作日志将记录解禁时间，系统自动向用户发送站内信或Push通知。</span>
        <annotation-point 
          title="【新增】解禁通知" 
          content="优化前：禁言到期后系统自动解禁，但无记录和通知，用户不知道何时解禁。&#10;&#10;优化后：操作日志记录解禁时间，系统自动向用户发送站内信或Push通知。&#10;&#10;原因：提升用户体验，让用户清楚知道解禁时间；同时留下完整的操作记录，便于运营追溯和审计。" 
          priority="P0"
        />
      </div>
    </div>

    <div class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定禁言</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'MuteModal',
  components: { AnnotationHighlight, AnnotationPoint },
  data() {
    return {
      visible: false,
      user: {
        avatar: '',
        nickname: '',
        userId: ''
      },
      form: {
        reason: '',
        duration: '1h',
        customDuration: '',
        customUnit: 'hours',
        scope: 'all',
        room: ''
      },
      durationOptions: [
        { value: '1h', label: '1小时' },
        { value: '2h', label: '2小时' },
        { value: '1d', label: '1天' },
        { value: '3d', label: '3天' },
        { value: '7d', label: '7天' },
        { value: '30d', label: '30天' },
        { value: 'permanent', label: '永久禁言' },
        { value: 'custom', label: '自定义' }
      ],
      scopeOptions: [
        { value: 'all', label: '全平台' },
        { value: 'room', label: '指定房间' },
        { value: 'comment', label: '评论区' }
      ]
    };
  },
  methods: {
    open(user) {
      this.user = {
        avatar: user.avatar,
        nickname: user.nickname,
        userId: user.userId
      };
      this.form = {
        reason: '',
        duration: '1h',
        customDuration: '',
        customUnit: 'hours',
        scope: 'all',
        room: ''
      };
      this.visible = true;
    },
    confirm() {
      if (!this.form.reason) {
        this.$message.error('请输入禁言原因');
        return;
      }
      if (this.form.duration === 'custom' && (!this.form.customDuration || parseInt(this.form.customDuration) <= 0)) {
        this.$message.error('请输入有效的自定义时长');
        return;
      }
      this.$message.success('禁言设置成功');
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 10px 0;
}

.section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;

  i {
    margin-right: 8px;
    color: #409eff;
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.mute-form {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.form-row {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  &.full {
    flex: 1;
  }
}

.form-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
  padding-top: 6px;

  &.required::after {
    content: '*';
    color: #f56c6c;
    margin-left: 4px;
  }
}

.reason-textarea {
  flex: 1;
}

.duration-group,
.scope-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.duration-label,
.scope-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  padding: 8px 16px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;

  &.active {
    background: #e8f5fd;
    border-color: #409eff;
    color: #409eff;
  }

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.room-select {
  flex: 1;
  width: auto;
}

.custom-duration-wrapper {
  display: flex;
  gap: 12px;
}

.custom-duration-input {
  width: 120px;
}

.custom-unit-select {
  width: 100px;
}

.warning-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff7e6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  font-size: 13px;
  color: #d4a574;

  i {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.notice-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  background: #ecf5ff;
  border: 1px solid #c6e2ff;
  border-radius: 8px;
  font-size: 13px;
  color: #409eff;

  i {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>