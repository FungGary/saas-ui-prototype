<template>
  <el-dialog
    :visible.sync="visible"
    title="加入恶意名单"
    width="500px"
    :close-on-click-modal="false"
    center
    class="add-malicious-dialog"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="dialog-content">
      <!-- 风险提示区块 -->
      <div class="risk-warning" id="malicious-risk-warning" style="position: relative;">
        <annotation-point
          title="【新增】加入前风险提示"
          content="优化前：当前弹窗较简单，缺少用户风险信息。&#10;&#10;优化后：提示该用户近期申诉次数、通过率、拒绝率。&#10;&#10;统计口径：统计范围为该用户近30天内的所有申诉记录。通过率 = 申诉通过数 / 总申诉数 × 100%；拒绝率 = 申诉驳回数 / 总申诉数 × 100%。&#10;&#10;原因：帮助客服判断是否是真的恶意用户，在加入黑名单前提供决策依据，减少误判。"
          priority="P0"
        />
        <div class="warning-icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="warning-content">
          <div class="warning-title">用户近期申诉记录</div>
          <div class="warning-stats">
            <span class="stat-item">
              <span class="stat-label">次数</span>
              <span class="stat-value">{{ currentRow.userAppealStats?.totalCount || 0 }} 次</span>
            </span>
            <span class="stat-divider">|</span>
            <span class="stat-item">
              <span class="stat-label">通过率</span>
              <span class="stat-value success">{{ currentRow.userAppealStats?.passRate || 0 }}%</span>
            </span>
            <span class="stat-divider">|</span>
            <span class="stat-item">
              <span class="stat-label">拒绝率</span>
              <span class="stat-value danger">{{ currentRow.userAppealStats?.rejectRate || 0 }}%</span>
            </span>
          </div>
        </div>
      </div>

      <el-divider></el-divider>

      <!-- 禁止时长说明 -->
      <div class="duration-info" id="malicious-ban-duration-desc" style="position: relative;">
        <annotation-point
          title="【优化】禁止时长说明"
          content="优化前：当前只有3天、7天、30天、永久，限制范围不清晰。&#10;&#10;优化后：增加说明：限制范围是禁止申诉、禁止游戏还是禁止登录。&#10;&#10;原因：当前'加入恶意名单'影响范围不清楚，用户和运营都需要明确封禁的具体范围。"
          priority="P1"
        />
        <div class="info-text">
          <i class="el-icon-info"></i>
          <span>说明：当前操作将限制该用户发起申诉权限（如需全站封禁，请前往用户黑名单模块处理）</span>
        </div>
      </div>

      <!-- 表单字段 -->
      <el-form :model="formData" label-width="100px" class="form-container">
        <!-- 禁止时长 -->
        <el-form-item label="* 禁止时长" prop="banDuration" :rules="[{ required: true, message: '请选择禁止时长' }]">
          <el-select
            v-model="formData.banDuration"
            placeholder="请选择禁止时长"
            class="form-select"
          >
            <el-option label="3天" value="3d"></el-option>
            <el-option label="7天" value="7d"></el-option>
            <el-option label="30天" value="30d"></el-option>
            <el-option label="永久" value="permanent"></el-option>
          </el-select>
        </el-form-item>

        <!-- 封禁原因 -->
        <el-form-item label="* 封禁原因" prop="banReason" :rules="[{ required: true, message: '请选择或填写封禁原因' }]" id="malicious-ban-reason">
          <div style="position: relative;">
            <el-select
              v-model="formData.banReason"
              placeholder="请选择封禁原因"
              class="form-select"
            >
              <el-option
                v-for="reason in banReasonOptions"
                :key="reason.value"
                :label="reason.label"
                :value="reason.value"
              ></el-option>
            </el-select>
            <annotation-point
              title="【优化】封禁原因下拉+其他自定义"
              content="优化前：当前封禁原因可输入，不是必填，也没有快捷选项。&#10;&#10;优化后：改为下拉菜单选择，支持'其他'时自定义输入。&#10;&#10;原因：黑名单处罚必须有依据，便于后续追溯和审计，下拉选择提升操作效率。"
              priority="P0"
            />
          </div>
        </el-form-item>

        <!-- 自定义原因（选择"其他"时显示） -->
        <el-form-item
          v-if="formData.banReason === 'other'"
          label="* 详细说明"
          prop="customReason"
          :rules="[{ required: true, message: '请填写详细说明' }]"
        >
          <el-input
            v-model="formData.customReason"
            type="textarea"
            :maxlength="200"
            placeholder="请输入详细的封禁原因..."
            :rows="3"
            class="form-textarea"
          ></el-input>
          <div class="char-count">{{ formData.customReason.length }}/200</div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'AddMaliciousDialog',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      showAnnotation: false,
      activeAnnotationId: null,
      annotations: [],
      visible: false,
      currentRow: null,
      
      formData: {
        banDuration: '',
        banReason: '',
        customReason: '',
      },

      banReasonOptions: [
        { label: '辱骂客服', value: 'abuse_service' },
        { label: '频繁恶意申诉', value: 'frequent_malicious_appeal' },
        { label: '提供虚假凭证', value: 'false_evidence' },
        { label: '恶意攻击系统', value: 'malicious_attack' },
        { label: '其他', value: 'other' },
      ],

      durationOptions: [
        { label: '3天', value: '3d' },
        { label: '7天', value: '7d' },
        { label: '30天', value: '30d' },
        { label: '永久', value: 'permanent' },
      ],
    };
  },
  methods: {
    open(row) {
      this.currentRow = row;
      this.visible = true;
      this.formData = {
        banDuration: '',
        banReason: '',
        customReason: '',
      };
    },

    getBanReasonText(reasonValue) {
      const option = this.banReasonOptions.find(item => item.value === reasonValue);
      return option ? option.label : reasonValue;
    },

    handleCancel() {
      this.visible = false;
    },

    handleConfirm() {
      if (!this.formData.banDuration) {
        this.$message.warning('请选择禁止时长');
        return;
      }
      if (!this.formData.banReason) {
        this.$message.warning('请选择封禁原因');
        return;
      }
      if (this.formData.banReason === 'other' && !this.formData.customReason.trim()) {
        this.$message.warning('请填写详细的封禁原因');
        return;
      }

      const banReasonText = this.formData.banReason === 'other'
        ? this.formData.customReason
        : this.getBanReasonText(this.formData.banReason);

      this.$confirm(
        `确认将用户【${this.currentRow.userNickName}】加入恶意名单？\n禁止时长：${this.getDurationText(this.formData.banDuration)}\n封禁原因：${banReasonText}`,
        '确认加入恶意名单',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          this.submit();
        })
        .catch(() => {});
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

    submit() {
      const banReasonText = this.formData.banReason === 'other'
        ? this.formData.customReason
        : this.getBanReasonText(this.formData.banReason);

      const data = {
        appealId: this.currentRow.id,
        userId: this.currentRow.userUid,
        banDuration: this.formData.banDuration,
        banReason: banReasonText,
        banReasonType: this.formData.banReason,
      };
      this.$message.success('已成功加入恶意名单');
      this.$emit('success', data);
      this.visible = false;
    },

    handleClosed() {
      this.currentRow = null;
      this.formData = {
        banDuration: '',
        banReason: '',
      };
    },

    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleMarkerClick(annotationId) {
      this.activeAnnotationId = annotationId;
      this.bus.$emit('annotationMarkerClick', annotationId);
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
};
</script>

<style lang="scss" scoped>
.add-malicious-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 15px;
  }
}

.dialog-content {
  padding: 0 5px;
}

.risk-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fefbea;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #fde68a;
}

.warning-icon {
  width: 40px;
  height: 40px;
  background: #fcd34d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 20px;
    color: #92400e;
  }
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.warning-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #92400e;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #78350f;

  &.success {
    color: #16a34a;
  }

  &.danger {
    color: #dc2626;
  }
}

.stat-divider {
  color: #fcd34d;
}

.duration-info {
  margin: 12px 0;
}

.info-text {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px 12px;

  i {
    color: #409eff;
    margin-top: 2px;
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

.char-count {
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>