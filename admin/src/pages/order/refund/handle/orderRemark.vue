<template>
  <el-dialog
    :visible.sync="modals"
    title="修改备注"
    width="500px"
    append-to-body
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formValidate"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formValidate.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注内容"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="modals = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { putRefundRemarkData } from '@/api/order';

export default {
  name: 'orderRemark',
  props: {
    remarkType: {
      type: String,
      default: '',
    },
    orderId: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      modals: false,
      loading: false,
      formValidate: {
        remark: '',
      },
      rules: {
        remark: [{ required: true, message: '请输入备注', trigger: 'blur' }],
      },
    };
  },
  methods: {
    handleClose() {
      this.formValidate.remark = '';
      this.$refs.formRef && this.$refs.formRef.resetFields();
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        if (this.remarkType !== 'refund') {
          this.loading = false;
          this.$emit('submitFail');
          return;
        }
        putRefundRemarkData({ id: this.orderId, remark: this.formValidate.remark })
          .then((res) => {
            this.$message.success(res.msg || '修改成功');
            this.modals = false;
            this.$emit('submitFail');
          })
          .catch((err) => {
            this.$message.error(err.msg || '修改失败');
            this.$emit('submitFail');
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>
