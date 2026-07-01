<template>
  <div class="backpack-config" :class="{ 'annotation-mode': showAnnotation }">
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

    <div class="page-title">背包配置</div>
    <el-form
      ref="backpackForm"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      label-position="right"
      class="config-form"
    >
      <el-form-item id="backpack-expire-days" label="背包物品过期时间" prop="expireDays">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.expireDays"
            type="number"
            placeholder="请输入过期天数"
            class="form-input"
          >
            <template slot="append">天</template>
          </el-input>
          <span class="desc-text">奖品获得后 X 天未处理，自动过期并按规则兑换积分</span>
          <annotation-point
            title="【优化】过期时间说明优化"
            content="优化前：只显示'过期自动兑换成积分，单位天'，只说明结果，没有说明触发条件。&#10;&#10;优化后：明确说明：奖品获得后 X 天未处理，自动过期并按规则兑换积分。&#10;&#10;原因：让运营清楚地知道过期触发的条件和结果，避免误解。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="backpack-transfer-level" label="转赠等级限制" prop="transferLevel">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.transferLevel"
            type="number"
            placeholder="请输入等级限制"
            class="form-input"
          />
          <span class="desc-text">0表示不限制，大于等于该等级才可转赠</span>
          <annotation-point
            title="【优化】转赠等级限制说明"
            content="优化前：只显示'0'，表示什么不清楚，运营不理解0的含义。&#10;&#10;优化后：增加说明：0表示不限制，≥该等级才可转赠。&#10;&#10;原因：防止运营误解，明确配置含义，降低理解成本。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="backpack-cancel-min-amount" label="取消发货最低金额" prop="cancelMinAmount">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.cancelMinAmount"
            type="number"
            placeholder="请输入最低金额"
            class="form-input"
          >
            <template slot="append">元</template>
          </el-input>
          <span class="desc-text">允许取消发货的最低金额，或是退款门槛</span>
          <annotation-point
            title="【优化】取消发货说明补充"
            content="优化前：字段语义不清，当前不知道是限制用户取消，还是取消后退款门槛。&#10;&#10;优化后：补充规则说明：允许取消发货最低金额（或退款门槛）。&#10;&#10;原因：明确配置的作用场景，避免运营错误配置。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="backpack-gold-to-money" label="1金币折合" prop="goldToMoney">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.goldToMoney"
            type="number"
            placeholder="请输入折合金额"
            class="form-input"
          >
            <template slot="append">元</template>
          </el-input>
          <span class="desc-text">用于金币统计价值计算</span>
          <annotation-point
            title="【新增】金币折合说明"
            content="优化前：无提示文案，运营不知道这个字段是做什么用的。&#10;&#10;优化后：增加说明：用于金币统计价值计算。&#10;&#10;原因：该字段影响资产价值，需要明确使用场景，避免运营随意修改。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="backpack-points-to-money" label="1积分折合" prop="pointsToMoney">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.pointsToMoney"
            type="number"
            placeholder="请输入折合金额"
            class="form-input"
          >
            <template slot="append">元</template>
          </el-input>
          <span class="desc-text">用于积分统计价值计算</span>
          <annotation-point
            title="【新增】积分折合说明"
            content="优化前：无提示文案，运营不知道这个字段是做什么用的。&#10;&#10;优化后：增加说明：用于积分统计价值计算。&#10;&#10;原因：该字段影响用户权益结算，需要明确使用场景，避免运营随意修改。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item label="发货时间提醒" prop="shippingRemindDays">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.shippingRemindDays"
            type="number"
            placeholder="请输入提醒天数"
            class="form-input"
          >
            <template slot="append">天</template>
          </el-input>
          <span class="desc-text">发货时间提醒</span>
        </div>
      </el-form-item>

      <el-form-item id="backpack-timeout-days" label="发货超时时间" prop="timeoutDays">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.timeoutDays"
            type="number"
            placeholder="请输入超时天数"
            class="form-input"
          >
            <template slot="append">天</template>
          </el-input>
          <span class="desc-text">发货超时时间，用于统计超时发货数据</span>
          <annotation-point
            title="【优化】超时间字段改名+说明"
            content="优化前：字段名是'超时间'，无提示文案，运营不清楚用途。&#10;&#10;优化后：&#10;1. 改名为'发货超时时间'&#10;2. 增加说明：用于统计超时发货数据&#10;&#10;原因：时间配置必须有结果动作，让运营清楚配置的影响范围和结果。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item label="包邮件数" prop="freeShippingCount">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.freeShippingCount"
            type="number"
            placeholder="请输入包邮件数"
            class="form-input"
          >
            <template slot="append">件</template>
          </el-input>
          <span class="desc-text">单次发货满 X 件可包邮</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" v-loading="loading">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import AnnotationPanel from '@/components/annotation/AnnotationPanel.vue';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'BackpackConfig',
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
        expireDays: 45,
        shippingFee: 120,
        transferLevel: 2,
        cancelMinAmount: 20,
        goldToMoney: 0.1,
        pointsToMoney: 0.1,
        shippingRemindDays: 5,
        timeoutDays: 7,
        freeShippingCount: 2,
      },
      formRules: {
        expireDays: [
          { required: true, message: '请输入背包物品过期时间', trigger: 'blur' },
          { type: 'number', min: 1, message: '过期天数必须大于0', trigger: 'blur' },
        ],
        shippingFee: [
          { required: true, message: '请输入运费', trigger: 'blur' },
          { type: 'number', min: 0, message: '运费不能小于0', trigger: 'blur' },
        ],
        transferLevel: [
          { required: true, message: '请输入转赠等级限制', trigger: 'blur' },
          { type: 'number', min: 0, message: '等级限制不能小于0', trigger: 'blur' },
        ],
        cancelMinAmount: [
          { required: true, message: '请输入取消发货最低金额', trigger: 'blur' },
          { type: 'number', min: 0, message: '最低金额不能小于0', trigger: 'blur' },
        ],
        goldToMoney: [
          { required: true, message: '请输入1金币折合金额', trigger: 'blur' },
          { type: 'number', min: 0, message: '折合金额不能小于0', trigger: 'blur' },
        ],
        pointsToMoney: [
          { required: true, message: '请输入1积分折合金额', trigger: 'blur' },
          { type: 'number', min: 0, message: '折合金额不能小于0', trigger: 'blur' },
        ],
        shippingRemindDays: [
          { required: true, message: '请输入发货时间提醒天数', trigger: 'blur' },
          { type: 'number', min: 1, message: '提醒天数必须大于0', trigger: 'blur' },
        ],
        timeoutDays: [
          { required: true, message: '请输入超时间', trigger: 'blur' },
          { type: 'number', min: 1, message: '超时天数必须大于0', trigger: 'blur' },
        ],
        freeShippingCount: [
          { required: true, message: '请输入包邮件数', trigger: 'blur' },
          { type: 'number', min: 1, message: '包邮件数必须大于0', trigger: 'blur' },
        ],
      },
    };
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
        this.loading = false;
      }, 300);
    },
    handleSave() {
      this.$refs.backpackForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.$message.success('保存成功');
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
.backpack-config {
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
    max-width: 700px;
  }

  .form-item-content {
    display: flex;
    align-items: center;
    width: 100%;

    .form-input {
      width: 240px;
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

  ::v-deep .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  ::v-deep .el-input-group__append {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    color: #909399;
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
