<template>
  <div class="copyright-page">
    <el-card shadow="never" class="mt16">
      <div class="section-title">基础设置</div>
      <el-form
        ref="copyrightForm"
        :model="copyrightForm"
        label-width="120px"
        label-position="right"
        @submit.native.prevent
      >
        <el-form-item label="logo">
          <div class="logo-uploader" :class="{ 'is-empty': !copyrightForm.logo }" @click="handleUploadLogo">
            <i v-if="!copyrightForm.logo" class="el-icon-plus avatar-uploader-icon"></i>
            <img v-else :src="copyrightForm.logo" class="logo-image" />
            <div v-if="!copyrightForm.logo" class="upload-text">上传</div>
          </div>
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input
            v-model="copyrightForm.companyName"
            placeholder="请输入公司名称"
            class="form-content-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="版权信息">
          <el-input
            v-model="copyrightForm.copyrightInfo"
            type="textarea"
            :rows="4"
            placeholder="请输入版权信息"
            class="form-content-width"
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt16" :body-style="{ padding: '24px 32px' }">
      <div class="section-title">备案设置</div>
      <el-form
        :model="copyrightForm"
        label-width="120px"
        label-position="right"
        @submit.native.prevent
      >
        <el-form-item label="网站ICP备案号">
          <el-input
            v-model="copyrightForm.icpNumber"
            placeholder="请输入网站ICP备案号"
            class="form-content-width"
          ></el-input>
        </el-form-item>
        <el-form-item label="网站公安备案">
          <el-input
            v-model="copyrightForm.publicSecurityNumber"
            placeholder="请输入网站公安备案"
            class="form-content-width"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-db-click @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CopyrightSetting',
  data() {
    return {
      copyrightForm: {
        logo: '',
        companyName: '',
        copyrightInfo: '',
        icpNumber: '',
        publicSecurityNumber: '',
      },
    };
  },
  methods: {
    handleUploadLogo() {
      this.$message.info('上传logo');
    },
    handleSave() {
      this.$message.success('保存成功');
    },
  },
};
</script>

<style lang="scss" scoped>
.copyright-page {
  padding: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  background: #f5f7fa;
  padding: 10px 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.form-content-width {
  width: 360px;
}

.logo-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: border-color 0.3s;

  &:hover {
    border-color: #1890ff;
  }

  &.is-empty {
    background: #fff;
  }
}

.avatar-uploader-icon {
  font-size: 22px;
  color: #8c939d;
  line-height: 1;
}

.upload-text {
  font-size: 12px;
  color: #8c939d;
  margin-top: 6px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

::v-deep .el-form-item {
  margin-bottom: 22px;
}
</style>
