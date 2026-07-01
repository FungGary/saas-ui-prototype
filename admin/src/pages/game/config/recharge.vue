<template>
  <div class="recharge-config" :class="{ 'annotation-mode': showAnnotation }">
    <!-- 标注面板 -->
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
          @toggle-markers="handleToggleMarkers"
        />
      </div>
    </transition>

    <!-- 标注高亮热区 -->
    <AnnotationHighlight />

    <div class="page-title">充值配置</div>
    <el-form
      ref="rechargeForm"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      label-position="right"
      class="config-form"
    >
      <el-form-item id="recharge-switch" label="充值开关" prop="rechargeSwitch">
        <div class="form-item-content">
          <el-switch
            v-model="formData.rechargeSwitch"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            @change="handleRechargeSwitchChange"
          />
          <span class="desc-text">全局充值总开关，关闭后所有充值渠道均不可用</span>
          <annotation-point
            title="【优化】充值开关层级说明"
            content="优化前：有充值开关、小程序充值开关，开关层级关系不明确。&#10;&#10;优化后：明确充值开关层级：&#10;· 充值开关：全局总开关，关闭后所有充值渠道均不可用&#10;· 小程序充值开关：子开关，仅控制小程序端充值&#10;&#10;原因：避免开关之间逻辑冲突，让运营清楚开关的层级关系。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="recharge-mini-program-switch" label="小程序充值开关" prop="miniProgramSwitch">
        <div class="form-item-content">
          <el-switch
            v-model="formData.miniProgramSwitch"
            :disabled="!formData.rechargeSwitch"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            @change="handleMiniProgramSwitchChange"
          />
          <span class="desc-text">
            {{ formData.rechargeSwitch ? '控制小程序端充值功能的开启与关闭' : '总开关已关闭，小程序充值开关自动禁用' }}
          </span>
          <annotation-point
            title="【优化】小程序充值开关联动"
            content="优化前：小程序开关独立展示，总开关关闭时仍可操作，容易造成误解。&#10;&#10;优化后：当总充值开关关闭时，小程序充值开关：&#10;1. 自动置为关闭状态&#10;2. 自动禁用（灰色不可点击）&#10;3. 提示文案变更为'总开关已关闭，小程序充值开关自动禁用'&#10;&#10;原因：防止配置无效但界面仍可操作，避免运营误解。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item label="充值说明" prop="rechargeDesc">
        <div class="form-item-content form-item-textarea">
          <el-input
            v-model="formData.rechargeDesc"
            type="textarea"
            :rows="4"
            placeholder="请输入充值说明"
            class="form-textarea"
            maxlength="500"
            show-word-limit
          />
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" v-loading="loading">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import AnnotationPanel from '@/components/annotation/AnnotationPanel.vue';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'RechargeConfig',
  components: {
    AnnotationPanel,
    AnnotationHighlight,
    AnnotationPoint,
  },
  data() {
    return {
      loading: false,
      labelWidth: '140px',
      showAnnotation: false,
      formData: {
        rechargeSwitch: true,
        miniProgramSwitch: false,
        rechargeDesc: '',
      },
      formRules: {
        rechargeSwitch: [
          { required: true, message: '请设置充值开关', trigger: 'change' },
        ],
        rechargeDesc: [
          { required: true, message: '请输入充值说明', trigger: 'blur' },
          { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' },
        ],
      },
    };
  },
  watch: {
    'formData.rechargeSwitch': {
      handler(newVal) {
        if (!newVal) {
          this.formData.miniProgramSwitch = false;
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    fetchConfig() {
      this.loading = true;
      setTimeout(() => {
        this.formData = {
          rechargeSwitch: true,
          miniProgramSwitch: false,
          rechargeDesc: '1. 充值金额仅限在本平台使用，不可提现或转让。\n2. 充值后金币即时到账，请确认充值金额。\n3. 如有疑问请联系客服。',
        };
        this.loading = false;
      }, 300);
    },
    handleRechargeSwitchChange(val) {
      if (!val) {
        this.$message.warning('充值总开关已关闭，所有充值渠道将不可用');
      }
    },
    handleMiniProgramSwitchChange(val) {
    },
    handleSubmit() {
      this.$refs.rechargeForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.$message.success('提交成功');
          }, 500);
        } else {
          return false;
        }
      });
    },
    handleAnnotationToggle(show) {
      this.showAnnotation = show;
    },
    handleAnnotationSelect(annotation) {
      // 选中标注时的处理
    },
    handleToggleMarkers(show) {
      // 切换标记点显示
    },
  },
};
</script>

<style scoped lang="scss">
.recharge-config {
  position: relative;
  min-height: 100%;

  &.annotation-mode {
    padding-right: 380px;
  }

  .page-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 24px;
  }

  .config-form {
    max-width: 600px;
  }

  .form-item-content {
    display: flex;
    align-items: center;
    width: 100%;

    &.form-item-textarea {
      align-items: flex-start;

      .desc-text {
        margin-top: 8px;
      }
    }

    .form-textarea {
      width: 360px;
      flex-shrink: 0;
    }

    .desc-text {
      margin-left: 12px;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }
  }

  ::v-deep .el-form-item__content {
    line-height: 40px;
  }

  ::v-deep .el-switch.is-disabled .el-switch__core,
  ::v-deep .el-switch.is-disabled .el-switch__label {
    cursor: not-allowed;
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
