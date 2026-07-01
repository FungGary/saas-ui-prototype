<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form ref="addForm" :model="formData" label-width="100px" label-position="right" class="add-code-form">
      <el-form-item label="*口令类型" prop="codeType" id="add-code-type-item">
        <el-radio-group v-model="formData.codeType" id="add-code-type-radio">
          <el-radio label="one_time">一次性兑换码</el-radio>
          <el-radio label="long_term">长期兑换码</el-radio>
        </el-radio-group>
        <div class="tip-text" id="add-code-type-tip">一次性仅可用一次，长期可按次数重复兑换。</div>
        <annotation-point 
          title="【优化】口令类型说明"
          content="一次性仅可用一次，长期可按次数重复兑换。&#10;&#10;说明：&#10;- 一次性兑换码：每个口令只能使用一次&#10;- 长期兑换码：每个口令可按设置的次数重复兑换"
          priority="P1"
        />
      </el-form-item>

      <el-form-item label="*口令数量" prop="count">
        <el-input-number v-model="formData.count" :min="1" :max="10000" class="form-input" />
        <span class="input-suffix">个</span>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="formData.remark" placeholder="请输入备注信息" class="form-input" />
      </el-form-item>

      <el-form-item label="*奖品类型" prop="prizeType">
        <el-radio-group v-model="formData.prizeType">
          <el-radio label="gold">金币</el-radio>
          <el-radio label="points">积分</el-radio>
          <el-radio label="physical">商品</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.prizeType === 'gold'" label="*金币数量" prop="prizeValue">
        <el-input-number v-model="formData.prizeValue" :min="1" :max="999999" class="form-input" />
        <span class="input-suffix">币</span>
      </el-form-item>

      <el-form-item v-else-if="formData.prizeType === 'points'" label="*积分数量" prop="prizeValue">
        <el-input-number v-model="formData.prizeValue" :min="1" :max="999999" class="form-input" />
        <span class="input-suffix">分</span>
      </el-form-item>

      <el-form-item v-else-if="formData.prizeType === 'physical'" label="*商品选择" prop="prizeValue">
        <el-select v-model="formData.prizeValue" placeholder="请选择商品" class="form-input">
          <el-option label="精美礼品一份" value="gift_001" />
          <el-option label="限量版周边" value="gift_002" />
          <el-option label="定制周边大礼包" value="gift_003" />
          <el-option label="专属纪念徽章" value="gift_004" />
        </el-select>
      </el-form-item>

      <el-form-item label="*生效时间" prop="dateRange">
        <el-date-picker
          v-model="formData.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="form-input"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <div style="position: relative; display: inline-block">
        <el-button @click="handleReset" id="add-code-reset-btn">重置</el-button>
        <annotation-point 
          title="【优化】重置按钮风险提示"
          content="点击重置前需二次确认是否清空已填内容。&#10;&#10;流程：&#10;1. 点击重置按钮&#10;2. 弹出确认弹窗：'是否清空已填内容？'&#10;3. 点击'确定'清空表单，点击'取消'保留内容"
          priority="P1"
        />
      </div>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'AddCodeModal',
  components: {
    AnnotationPoint,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      title: '添加兑换口令',
      formData: {
        codeType: 'long_term',
        count: 1,
        remark: '',
        prizeType: 'gold',
        prizeValue: '',
        dateRange: [],
      },
    };
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },

    handleReset() {
      this.$confirm('是否清空已填内容？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.resetForm();
          this.$message.info('已清空表单内容');
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    resetForm() {
      this.formData = {
        codeType: 'long_term',
        count: 1,
        remark: '',
        prizeType: 'gold',
        prizeValue: '',
        dateRange: [],
      };
      if (this.$refs.addForm) {
        this.$refs.addForm.resetFields();
      }
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.$confirm('确定要添加兑换口令吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
        .then(() => {
          this.$message.success('添加成功');
          this.$emit('success', { ...this.formData });
          this.resetForm();
          this.handleClose();
        })
        .catch(() => {
          this.$message.info('已取消操作');
        });
    },

    validateForm() {
      if (!this.formData.codeType) {
        this.$message.error('请选择口令类型');
        return false;
      }
      if (!this.formData.count || this.formData.count < 1) {
        this.$message.error('请输入有效的口令数量');
        return false;
      }
      if (!this.formData.prizeType) {
        this.$message.error('请选择奖品类型');
        return false;
      }
      if (!this.formData.prizeValue) {
        this.$message.error('请填写奖品信息');
        return false;
      }
      if (!this.formData.dateRange || this.formData.dateRange.length !== 2) {
        this.$message.error('请选择生效时间范围');
        return false;
      }
      return true;
    },

    open() {
      this.resetForm();
      this.$emit('update:visible', true);
    },

    close() {
      this.handleClose();
    },
  },
};
</script>

<style lang="scss" scoped>
.add-code-form {
  padding: 20px 0;
}

.form-input {
  width: 300px;
}

.input-suffix {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.tip-text {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.dialog-footer {
  text-align: right;
}
</style>
