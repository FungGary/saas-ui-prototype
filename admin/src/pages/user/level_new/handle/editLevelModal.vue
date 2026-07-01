<template>
  <el-dialog
    :title="modalTitle"
    :visible.sync="visible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="等级名称：" prop="levelName">
        <el-input v-model="formData.levelName" placeholder="请输入等级名称" maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="等级成长值：" prop="growthValue">
        <el-input-number v-model="formData.growthValue" :min="0" :max="999999" placeholder="请输入成长值"></el-input-number>
      </el-form-item>
      <el-form-item label="等级权益：" prop="benefits">
        <el-input v-model="formData.benefits" placeholder="请输入等级权益" maxlength="100"></el-input>
      </el-form-item>
      <el-form-item label="等级礼包：" prop="giftPackages">
        <el-input
          type="textarea"
          v-model="giftPackagesText"
          :rows="4"
          placeholder="请输入礼包内容，每行一个"
          maxlength="500"
        ></el-input>
        <div class="form-tip">每行输入一个礼包项目，例如：2金币</div>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditLevelModal',
  data() {
    return {
      visible: false,
      modalTitle: '添加用户等级',
      submitting: false,
      formData: {
        id: null,
        levelName: '',
        growthValue: 0,
        benefits: '',
        giftPackages: [],
        status: 'enabled'
      },
      giftPackagesText: '',
      rules: {
        levelName: [
          { required: true, message: '请输入等级名称', trigger: 'blur' }
        ],
        growthValue: [
          { required: true, message: '请输入等级成长值', trigger: 'blur' }
        ],
        benefits: [
          { required: true, message: '请输入等级权益', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    };
  },
  watch: {
    giftPackagesText(val) {
      if (val) {
        this.formData.giftPackages = val.split('\n').filter(item => item.trim());
      } else {
        this.formData.giftPackages = [];
      }
    }
  },
  methods: {
    open(row) {
      this.visible = true;
      if (row) {
        this.modalTitle = '编辑用户等级';
        this.formData = {
          id: row.id,
          levelName: row.levelName,
          growthValue: row.growthValue,
          benefits: row.benefits,
          giftPackages: row.giftPackages || [],
          status: row.status
        };
        this.giftPackagesText = (row.giftPackages || []).join('\n');
      } else {
        this.modalTitle = '添加用户等级';
        this.formData = {
          id: null,
          levelName: '',
          growthValue: 0,
          benefits: '',
          giftPackages: [],
          status: 'enabled'
        };
        this.giftPackagesText = '';
      }
    },
    handleClose() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.giftPackagesText = '';
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitting = true;
          setTimeout(() => {
            this.$message.success(this.formData.id ? '编辑成功' : '添加成功');
            this.submitting = false;
            this.visible = false;
            this.$emit('success');
          }, 500);
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dialog-footer {
  text-align: right;
}
</style>