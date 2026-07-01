<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="取消审核"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <div class="audit-dialog-content">
      <div class="cancel-reason-display">
        <div class="reason-label">用户取消原因：</div>
        <div class="reason-text">{{ cancelReason || '-' }}</div>
      </div>
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px">
        <el-form-item label="审核结果" prop="auditResult">
          <el-radio-group v-model="auditForm.auditResult">
            <el-radio label="approve">同意取消</el-radio>
            <el-radio label="reject">拒绝取消</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.auditResult === 'reject'" label="拒绝原因" prop="rejectReason">
          <el-select v-model="auditForm.rejectReason" placeholder="请选择拒绝原因" style="width: 100%">
            <el-option label="商品已发货" value="商品已发货" />
            <el-option label="商品已出库" value="商品已出库" />
            <el-option label="用户原因不成立" value="用户原因不成立" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核备注（可选）" />
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'CancelAuditDialog',
  components: {
    AnnotationPoint,
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    cancelReason: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      auditForm: {
        auditResult: 'approve',
        rejectReason: '',
        remark: ''
      },
      auditRules: {
        auditResult: [
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        rejectReason: [
          { required: true, message: '请选择拒绝原因', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  methods: {
    handleClosed() {
      this.resetForm();
    },
    handleCancel() {
      this.dialogVisible = false;
    },
    handleConfirm() {
      this.$refs.auditFormRef.validate((valid) => {
        if (valid) {
          this.$emit('confirm', {
            auditResult: this.auditForm.auditResult,
            rejectReason: this.auditForm.rejectReason,
            remark: this.auditForm.remark
          });
          this.dialogVisible = false;
        }
      });
    },
    resetForm() {
      this.auditForm = {
        auditResult: 'approve',
        rejectReason: '',
        remark: ''
      };
      this.$refs.auditFormRef?.clearValidate();
    }
  }
};
</script>

<style scoped>
.audit-dialog-content {
  padding: 10px 0;
}
.cancel-reason-display {
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}
.reason-label {
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
}
.reason-text {
  color: #303133;
  line-height: 1.5;
}
</style>
