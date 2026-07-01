<template>
  <div class="claw-machine-config" :class="{ 'annotation-mode': showAnnotation }">
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

    <div class="page-title">娃娃机配置</div>
    <el-form
      ref="clawMachineForm"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      label-position="right"
      class="config-form"
    >
      <el-form-item id="claw-hot-threshold" label="上热门门槛" prop="hotThreshold">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.hotThreshold"
            type="number"
            placeholder="请输入上热门门槛"
            class="form-input"
          >
            <template slot="append">币</template>
          </el-input>
          <span class="desc-text">每日房间累积投币数达到该值后，可自动标记为热门房间</span>
          <annotation-point
            title="【优化】上热门门槛说明优化"
            content="优化前：只显示'上热门标签最低投币数，单位币'，说明不够完整。&#10;&#10;优化后：说明优化：每日房间累计投币数达到该值后，可自动标记为热门房间；用于首页→最热tab。&#10;&#10;原因：降低运营理解成本，清楚知道配置的作用和展示位置。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-luck-level-limit" label="运气台等级限制" prop="luckLevelLimit">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.luckLevelLimit"
            type="number"
            placeholder="请输入等级限制"
            class="form-input"
          />
          <span class="desc-text">用户等级 ≥ X 才可展示运气台</span>
          <annotation-point
            title="【新增】运气台等级限制说明"
            content="优化前：只显示'展示运气台的最低等级限制'，说明不够清晰。&#10;&#10;优化后：增加说明：用户等级≥X才展示运气台。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响范围。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-luck-play-type" label="运气台玩法类型" prop="luckPlayType">
        <div class="form-item-content">
          <el-select
            v-model="formData.luckPlayType"
            placeholder="请选择玩法类型"
            class="form-input"
          >
            <el-option
              v-for="item in luckPlayTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="desc-text">该玩法类型会被系统自动识别为运气台</span>
          <annotation-point
            title="【新增】运气台玩法类型说明"
            content="优化前：无说明，运营不知道选择这个类型的作用。&#10;&#10;优化后：增加说明：该玩法类型会被识别为运气台。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item label="上新属性" prop="newArrivalAttr">
        <div class="form-item-content">
          <el-select
            v-model="formData.newArrivalAttr"
            placeholder="请选择上新属性"
            class="form-input"
          >
            <el-option
              v-for="item in newArrivalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="热门属性" prop="hotAttr">
        <div class="form-item-content">
          <el-select
            v-model="formData.hotAttr"
            placeholder="请选择热门属性"
            class="form-input"
          >
            <el-option
              v-for="item in hotAttrOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item id="claw-danmaku-level" label="开启弹幕等级" prop="danmakuLevel">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.danmakuLevel"
            type="number"
            placeholder="请输入弹幕等级"
            class="form-input"
          />
          <span class="desc-text">0表示不限制，用户等级 ≥ X 才可发送弹幕</span>
          <annotation-point
            title="【新增】开启弹幕等级说明"
            content="优化前：无说明，运营不知道这个配置的作用。&#10;&#10;优化后：增加说明：0表示不限制，用户等级≥X可发弹幕。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-screenshot-review-remind" label="截图审核提醒" prop="screenshotReviewRemind">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.screenshotReviewRemind"
            type="number"
            placeholder="请输入提醒时间"
            class="form-input"
          >
            <template slot="append">小时</template>
          </el-input>
          <span class="desc-text">用于后台提醒截图审核的时间</span>
          <annotation-point
            title="【新增】截图审核提醒说明"
            content="优化前：无说明，运营不知道这个配置的作用。&#10;&#10;优化后：增加说明：用于后台提醒截图审核的时间。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-screenshot-review-timeout" label="截图审核超时" prop="screenshotReviewTimeout">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.screenshotReviewTimeout"
            type="number"
            placeholder="请输入超时时间"
            class="form-input"
          >
            <template slot="append">小时</template>
          </el-input>
          <span class="desc-text">用于后台统计截图审核超时的时间</span>
          <annotation-point
            title="【新增】截图审核超时说明"
            content="优化前：无说明，运营不知道这个配置的作用。&#10;&#10;优化后：增加说明：用于后台统计截图审核超时的时间。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-reset-cooldown" label="复位冷却时间" prop="resetCooldown">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.resetCooldown"
            type="number"
            placeholder="请输入冷却时间"
            class="form-input"
          >
            <template slot="append">秒</template>
          </el-input>
          <span class="desc-text">用户发起复位呼叫后，需等待该秒数后才能再次发起</span>
          <annotation-point
            title="【新增】复位冷却时间说明"
            content="优化前：无说明，运营不知道这个配置的作用。&#10;&#10;优化后：增加说明：用户发起复位呼叫后，需等待该秒数后才能再次发起。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-guarantee-progress-expire" label="保送进度过期时间" prop="guaranteeProgressExpire">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.guaranteeProgressExpire"
            type="number"
            placeholder="请输入过期时间"
            class="form-input"
          >
            <template slot="append">小时</template>
          </el-input>
          <span class="desc-text">用户保送进度超过该时间未继续游戏，将自动清空进度</span>
          <annotation-point
            title="【新增】保送进度过期时间说明"
            content="优化前：无说明，运营不知道这个配置的作用。&#10;&#10;优化后：增加说明：用户保送进度超过该时间未继续游戏，将自动清空进度。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
        </div>
      </el-form-item>

      <el-form-item id="claw-daily-appeal-limit" label="单日申诉上限" prop="dailyAppealLimit">
        <div class="form-item-content">
          <el-input
            v-model.number="formData.dailyAppealLimit"
            type="number"
            placeholder="请输入申诉上限"
            class="form-input"
          />
          <span class="desc-text">单日游戏记录申诉上限数量</span>
          <annotation-point
            title="【新增】单日申诉上限说明"
            content="优化前：只显示'配置30'，没有说明含义。&#10;&#10;优化后：增加说明：每用户每日申诉上限次数。&#10;&#10;原因：降低运营理解成本，明确配置的作用和影响。"
            priority="P0"
          />
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
  name: 'ClawMachineConfig',
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
      luckPlayTypeOptions: [
        { value: 'ouhuang', label: '欧皇台' },
        { value: 'play', label: '玩法台' },
        { value: 'skill', label: '技巧台' },
        { value: 'lucky', label: '幸运台' },
      ],
      newArrivalOptions: [
        { value: 'new', label: '上新' },
        { value: 'new_arrival', label: '新品' },
        { value: 'hot_new', label: '热门新品' },
      ],
      hotAttrOptions: [
        { value: 'hot', label: '热门' },
        { value: 'super_hot', label: '超级热门' },
        { value: 'recommend', label: '推荐' },
      ],
      formData: {
        hotThreshold: 100000,
        luckLevelLimit: 2,
        luckPlayType: 'ouhuang',
        newArrivalAttr: 'new',
        hotAttr: 'hot',
        danmakuLevel: 2,
        screenshotReviewRemind: 16,
        screenshotReviewTimeout: 24,
        resetCooldown: 300,
        guaranteeProgressExpire: 3,
        dailyAppealLimit: 50,
      },
      formRules: {
        hotThreshold: [
          { required: true, message: '请输入上热门门槛', trigger: 'blur' },
          { type: 'number', min: 0, message: '门槛值不能小于0', trigger: 'blur' },
        ],
        luckLevelLimit: [
          { required: true, message: '请输入运气台等级限制', trigger: 'blur' },
          { type: 'number', min: 0, message: '等级限制不能小于0', trigger: 'blur' },
        ],
        luckPlayType: [
          { required: true, message: '请选择运气台玩法类型', trigger: 'change' },
        ],
        newArrivalAttr: [
          { required: true, message: '请选择上新属性', trigger: 'change' },
        ],
        hotAttr: [
          { required: true, message: '请选择热门属性', trigger: 'change' },
        ],
        danmakuLevel: [
          { required: true, message: '请输入开启弹幕等级', trigger: 'blur' },
          { type: 'number', min: 0, message: '等级不能小于0', trigger: 'blur' },
        ],
        screenshotReviewRemind: [
          { required: true, message: '请输入截图审核提醒时间', trigger: 'blur' },
          { type: 'number', min: 1, message: '提醒时间必须大于0', trigger: 'blur' },
        ],
        screenshotReviewTimeout: [
          { required: true, message: '请输入截图审核超时时间', trigger: 'blur' },
          { type: 'number', min: 1, message: '超时时间必须大于0', trigger: 'blur' },
        ],
        resetCooldown: [
          { required: true, message: '请输入复位冷却时间', trigger: 'blur' },
          { type: 'number', min: 0, message: '冷却时间不能小于0', trigger: 'blur' },
        ],
        guaranteeProgressExpire: [
          { required: true, message: '请输入保送进度过期时间', trigger: 'blur' },
          { type: 'number', min: 1, message: '过期时间必须大于0', trigger: 'blur' },
        ],
        dailyAppealLimit: [
          { required: true, message: '请输入单日申诉上限', trigger: 'blur' },
          { type: 'number', min: 1, message: '申诉上限必须大于0', trigger: 'blur' },
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
      this.$refs.clawMachineForm.validate((valid) => {
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
.claw-machine-config {
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
    max-width: 750px;
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

  ::v-deep .el-select .el-input__inner {
    height: 36px;
    line-height: 36px;
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
