<template>
  <el-dialog
    :visible.sync="visible"
    title="驳回申诉"
    width="450px"
    :close-on-click-modal="false"
    center
    class="reject-reason-dialog"
    @closed="handleClosed"
  >
    <div class="dialog-content" v-if="currentRow">
      <!-- 用户信息摘要 -->
      <div class="user-summary">
        <el-avatar :size="44" shape="circle">
          <img v-if="currentRow.userAvatar" :src="currentRow.userAvatar" />
          <i v-else class="el-icon-user" style="font-size: 22px;"></i>
        </el-avatar>
        <div class="user-summary-info">
          <div class="user-summary-name">{{ currentRow.userNickName }}</div>
          <div class="user-summary-desc">申诉单号：{{ currentRow.appealNo }}</div>
        </div>
      </div>

      <!-- 警告提示 -->
      <div class="warning-banner">
        <div class="warning-icon-wrapper">
          <i class="el-icon-warning"></i>
        </div>
        <div class="warning-text">
          <div class="warning-title">驳回申诉提醒</div>
          <div class="warning-desc">请填写驳回原因，以便用户了解驳回依据</div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <div class="form-label">
          <span class="required">*</span>
          <span>驳回原因</span>
        </div>
        <div class="textarea-wrapper" id="appeal-reject-reason" style="position: relative;">
          <el-input
            v-model="formData.rejectReason"
            type="textarea"
            :maxlength="200"
            placeholder="请输入驳回原因，详细说明驳回理由..."
            :rows="4"
            class="form-textarea"
          ></el-input>
          <annotation-point
            title="【优化】驳回原因必填"
            content="优化前：驳回按钮可直接操作，原因非必填。&#10;&#10;优化后：驳回时必须填写原因或选择原因标签。&#10;&#10;原因：避免用户再次投诉时无依据，用户需要了解驳回原因，也便于后续追溯和审计。"
            priority="P0"
          />
          <div class="char-count">{{ formData.rejectReason.length }}/200</div>

          <div class="quick-reasons-wrapper">
            <div class="quick-reasons-title">快捷选择</div>
            <div class="quick-reasons">
              <span
                v-for="reason in quickReasons"
                :key="reason"
                :class="['quick-tag', formData.rejectReason === reason ? 'active' : '']"
                @click="selectQuickReason(reason)"
              >
                {{ reason }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'RejectReasonDialog',
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
        rejectReason: '',
      },

      quickReasons: [
        '申诉理由不充分',
        '凭证图片模糊不清',
        '证据不足以证明问题',
        '重复提交相同申诉',
        '不符合申诉规则',
        '其他',
      ],
    };
  },
  methods: {
    open(row) {
      this.currentRow = row;
      this.visible = true;
      this.formData = {
        rejectReason: '',
      };
    },

    close() {
      this.visible = false;
    },

    selectQuickReason(reason) {
      this.formData.rejectReason = reason;
    },

    handleCancel() {
      this.visible = false;
    },

    handleConfirm() {
      if (!this.formData.rejectReason.trim()) {
        this.$message.warning('请填写驳回原因');
        return;
      }

      this.$confirm(
        `确认驳回该申诉？\n驳回原因：${this.formData.rejectReason}`,
        '确认驳回',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          this.$emit('confirm', this.formData.rejectReason);
          this.visible = false;
        })
        .catch(() => {});
    },

    handleClosed() {
      this.currentRow = null;
      this.formData = {
        rejectReason: '',
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
.reject-reason-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px 24px 24px;
  }

  ::v-deep .el-dialog__header {
    padding: 18px 24px 16px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
    }
  }

  ::v-deep .el-dialog__footer {
    padding: 14px 24px;
    border-top: 1px solid #ebeef5;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.user-summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-summary-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.user-summary-desc {
  font-size: 12px;
  color: #909399;
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, #fef0f0 0%, #fdf2f2 100%);
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid #fbc4c4;
}

.warning-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 18px;
    color: #fff;
  }
}

.warning-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.warning-desc {
  font-size: 12px;
  color: #f56c6c;
  opacity: 0.8;
  line-height: 1.5;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;

  .required {
    color: #f56c6c;
  }
}

.textarea-wrapper {
  position: relative;
}

.form-textarea {
  width: 100%;

  ::v-deep .el-textarea__inner {
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.6;
    transition: border-color 0.2s;

    &:focus {
      border-color: #f56c6c;
    }
  }
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 6px;
}

.quick-reasons-wrapper {
  margin-top: 14px;
}

.quick-reasons-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.quick-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  padding: 5px 14px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: #fef0f0;
    color: #f56c6c;
    border-color: #fbc4c4;
  }

  &.active {
    background: #f56c6c;
    color: #fff;
    border-color: #f56c6c;
  }
}
</style>