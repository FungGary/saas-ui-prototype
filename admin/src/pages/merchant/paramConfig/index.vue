<template>
  <div class="merchant-config-page">
    <el-tabs v-model="activeTab" class="config-tabs">
      <el-tab-pane label="机台币数配置" name="machineCurrency">
        <el-form
          ref="machineCurrencyFormRef"
          :model="machineCurrencyForm"
          :rules="machineCurrencyRules"
          label-width="200px"
          @submit.native.prevent
        >
          <el-form-item label="截图币数最小值:" prop="minMachineCurrencyJietuSh">
            <el-input
              v-model.number="machineCurrencyForm.minMachineCurrencyJietuSh"
              placeholder="请输入截图玩法房间最低币数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">币</template>
            </el-input>
            <div class="field-desc">商户创建或编辑截图玩法房间时，允许填写的最低币数。</div>
          </el-form-item>
          <el-form-item label="截图币数最大值:" prop="maxMachineCurrencyJietuSh">
            <el-input
              v-model.number="machineCurrencyForm.maxMachineCurrencyJietuSh"
              placeholder="请输入截图玩法房间最高币数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">币</template>
            </el-input>
            <div class="field-desc">商户创建或编辑截图玩法房间时，允许填写的最高币数。</div>
          </el-form-item>
          <el-form-item label="币数最小值:" prop="minMachineCurrencySh">
            <el-input
              v-model.number="machineCurrencyForm.minMachineCurrencySh"
              placeholder="请输入普通房间最低币数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">币</template>
            </el-input>
            <div class="field-desc">商户创建或编辑房间时，允许填写的最低币数。</div>
          </el-form-item>
          <el-form-item label="币数最大值:" prop="maxMachineCurrencySh">
            <el-input
              v-model.number="machineCurrencyForm.maxMachineCurrencySh"
              placeholder="请输入房间最高币数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">币</template>
            </el-input>
            <div class="field-desc">商户创建或编辑房间时，允许填写的最高币数。</div>
          </el-form-item>
          <el-form-item label="运气台投币最大倍数:" prop="maxMultipleBetSh">
            <el-input
              v-model.number="machineCurrencyForm.maxMultipleBetSh"
              placeholder="请输入最大投币倍数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">倍</template>
            </el-input>
            <div class="field-desc">商户配置运气台房间时，允许设置的最大投币倍数。</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave('machineCurrency')">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="刮板房间配置" name="scraper">
        <el-form
          ref="scraperFormRef"
          :model="scraperForm"
          :rules="scraperRules"
          label-width="200px"
          @submit.native.prevent
        >
          <el-form-item label="刮板次数最小值:" prop="minNumScratch">
            <el-input
              v-model.number="scraperForm.minNumScratch"
              placeholder="请输入最小刮板次数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">次</template>
            </el-input>
            <div class="field-desc">商户创建或编辑刮板时，允许填写的最小刮板次数。</div>
          </el-form-item>
          <el-form-item label="刮板次数最大值:" prop="maxNumScratch">
            <el-input
              v-model.number="scraperForm.maxNumScratch"
              placeholder="请输入最大刮板次数"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">次</template>
            </el-input>
            <div class="field-desc">商户创建或编辑刮板时，允许填写的最大刮板次数。</div>
          </el-form-item>
          <el-form-item label="刮板积分最小值:" prop="minScraperIntegral">
            <el-input
              v-model.number="scraperForm.minScraperIntegral"
              placeholder="请输入刮板积分最低值"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">商户配置刮板时，允许填写的最低积分值。</div>
          </el-form-item>
          <el-form-item label="刮板积分最大值:" prop="maxScraperIntegral">
            <el-input
              v-model.number="scraperForm.maxScraperIntegral"
              placeholder="请输入刮板积分最高值"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">商户配置刮板时，允许填写的最高积分值。</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave('scraper')">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="截图审核配置" name="screenshot">
        <el-form
          ref="screenshotFormRef"
          :model="screenshotForm"
          :rules="screenshotRules"
          label-width="200px"
          @submit.native.prevent
        >
          <el-form-item label="截图积分最小值:" prop="minScreenshotPointsSh">
            <el-input
              v-model.number="screenshotForm.minScreenshotPointsSh"
              placeholder="请输入截图审核最低积分"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">审核截图时，奖品选择为积分的情况下，商户可填写的最低积分。</div>
          </el-form-item>
          <el-form-item label="截图积分最大值:" prop="maxScreenshotPointsSh">
            <el-input
              v-model.number="screenshotForm.maxScreenshotPointsSh"
              placeholder="请输入截图审核最高积分"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">审核截图时，奖品选择为积分的情况下，商户可填写的最高积分。</div>
          </el-form-item>
          <el-form-item label="运气台百分比:" prop="luckRatio">
            <el-input
              v-model.number="screenshotForm.luckRatio"
              placeholder="请输入运气台占比"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">%</template>
            </el-input>
            <div class="field-desc">
              商户配置运气台时，可设置的占比。系统会根据商户房间总数计算，结果向下取整。
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave('screenshot')">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="转盘房间配置" name="wheel">
        <el-form
          ref="wheelFormRef"
          :model="wheelForm"
          :rules="wheelRules"
          label-width="200px"
          @submit.native.prevent
        >
          <el-form-item label="转盘积分最大值:" prop="maxWheelIntegral">
            <el-input
              v-model.number="wheelForm.maxWheelIntegral"
              placeholder="请输入转盘玩法最高积分"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">商户配置转盘时，允许填写的最高积分值。</div>
          </el-form-item>
          <el-form-item label="转盘积分最小值:" prop="minWheelIntegral">
            <el-input
              v-model.number="wheelForm.minWheelIntegral"
              placeholder="请输入转盘玩法最低积分"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">积分</template>
            </el-input>
            <div class="field-desc">商户配置转盘时，允许填写的最低积分值。</div>
          </el-form-item>
          <el-form-item label="转盘台百分比:" prop="wheelRatio">
            <el-input
              v-model.number="wheelForm.wheelRatio"
              placeholder="请输入转盘台占比"
              class="form-input-width"
              size="small"
            >
              <template slot="suffix">%</template>
            </el-input>
            <div class="field-desc">
              商户配置转盘台时，可设置的占比。系统会根据商户房间总数计算，结果向下取整。
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave('wheel')">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'MerchantParamConfig',
  data() {
    const validateNonNegativeInt = (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback(new Error('请输入数值'));
      } else if (!/^\d+$/.test(String(value))) {
        callback(new Error('请输入非负整数'));
      } else if (Number(value) < 0) {
        callback(new Error('请输入非负整数'));
      } else {
        callback();
      }
    };

    const validatePositiveInt = (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback(new Error('请输入数值'));
      } else if (!/^\d+$/.test(String(value))) {
        callback(new Error('请输入正整数'));
      } else if (Number(value) < 1) {
        callback(new Error('请输入大于等于 1 的整数'));
      } else {
        callback();
      }
    };

    const validatePercent = (rule, value, callback) => {
      if (value === '' || value === null || value === undefined) {
        callback(new Error('请输入数值'));
      } else if (!/^\d+$/.test(String(value))) {
        callback(new Error('请输入 0–100 之间的整数'));
      } else if (Number(value) < 0 || Number(value) > 100) {
        callback(new Error('请输入 0–100 之间的整数'));
      } else {
        callback();
      }
    };

    const validateMinLessThanMax = (minField, maxField, label) => (rule, value, callback) => {
      const formRef = this.getFormRefByTab(rule.tab);
      const minVal = Number(this.getFormByTab(rule.tab)[minField]);
      const maxVal = Number(this.getFormByTab(rule.tab)[maxField]);
      if (minVal > maxVal) {
        callback(new Error(`${label}不能大于最大值`));
      } else {
        callback();
      }
    };

    const validateMaxGreaterThanMin = (minField, maxField, label) => (rule, value, callback) => {
      const minVal = Number(this.getFormByTab(rule.tab)[minField]);
      const maxVal = Number(this.getFormByTab(rule.tab)[maxField]);
      if (maxVal < minVal) {
        callback(new Error(`${label}不能小于最小值`));
      } else {
        callback();
      }
    };

    return {
      activeTab: 'machineCurrency',
      machineCurrencyForm: {
        minMachineCurrencyJietuSh: 99,
        maxMachineCurrencyJietuSh: 399,
        minMachineCurrencySh: 59,
        maxMachineCurrencySh: 1229,
        maxMultipleBetSh: 5,
      },
      scraperForm: {
        minNumScratch: 2,
        maxNumScratch: 100,
        minScraperIntegral: 3,
        maxScraperIntegral: 8,
      },
      screenshotForm: {
        minScreenshotPointsSh: 200,
        maxScreenshotPointsSh: 2000,
        luckRatio: 100,
      },
      wheelForm: {
        maxWheelIntegral: 1000,
        minWheelIntegral: 3,
        wheelRatio: 100,
      },
      machineCurrencyRules: {
        minMachineCurrencyJietuSh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minMachineCurrencyJietuSh', 'maxMachineCurrencyJietuSh', '截图币数最小值'), tab: 'machineCurrency', trigger: 'blur' },
        ],
        maxMachineCurrencyJietuSh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minMachineCurrencyJietuSh', 'maxMachineCurrencyJietuSh', '截图币数最大值'), tab: 'machineCurrency', trigger: 'blur' },
        ],
        minMachineCurrencySh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minMachineCurrencySh', 'maxMachineCurrencySh', '币数最小值'), tab: 'machineCurrency', trigger: 'blur' },
        ],
        maxMachineCurrencySh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minMachineCurrencySh', 'maxMachineCurrencySh', '币数最大值'), tab: 'machineCurrency', trigger: 'blur' },
        ],
        maxMultipleBetSh: [
          { validator: validatePositiveInt, trigger: 'blur' },
        ],
      },
      scraperRules: {
        minNumScratch: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minNumScratch', 'maxNumScratch', '刮板次数最小值'), tab: 'scraper', trigger: 'blur' },
        ],
        maxNumScratch: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minNumScratch', 'maxNumScratch', '刮板次数最大值'), tab: 'scraper', trigger: 'blur' },
        ],
        minScraperIntegral: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minScraperIntegral', 'maxScraperIntegral', '刮板积分最小值'), tab: 'scraper', trigger: 'blur' },
        ],
        maxScraperIntegral: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minScraperIntegral', 'maxScraperIntegral', '刮板积分最大值'), tab: 'scraper', trigger: 'blur' },
        ],
      },
      screenshotRules: {
        minScreenshotPointsSh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minScreenshotPointsSh', 'maxScreenshotPointsSh', '截图积分最小值'), tab: 'screenshot', trigger: 'blur' },
        ],
        maxScreenshotPointsSh: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minScreenshotPointsSh', 'maxScreenshotPointsSh', '截图积分最大值'), tab: 'screenshot', trigger: 'blur' },
        ],
        luckRatio: [
          { validator: validatePercent, trigger: 'blur' },
        ],
      },
      wheelRules: {
        maxWheelIntegral: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMaxGreaterThanMin('minWheelIntegral', 'maxWheelIntegral', '转盘积分最大值'), tab: 'wheel', trigger: 'blur' },
        ],
        minWheelIntegral: [
          { validator: validateNonNegativeInt, trigger: 'blur' },
          { validator: validateMinLessThanMax('minWheelIntegral', 'maxWheelIntegral', '转盘积分最小值'), tab: 'wheel', trigger: 'blur' },
        ],
        wheelRatio: [
          { validator: validatePercent, trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    getFormByTab(tab) {
      const formMap = {
        machineCurrency: this.machineCurrencyForm,
        scraper: this.scraperForm,
        screenshot: this.screenshotForm,
        wheel: this.wheelForm,
      };
      return formMap[tab] || {};
    },
    getFormRefByTab(tab) {
      const refMap = {
        machineCurrency: this.$refs.machineCurrencyFormRef,
        scraper: this.$refs.scraperFormRef,
        screenshot: this.$refs.screenshotFormRef,
        wheel: this.$refs.wheelFormRef,
      };
      return refMap[tab];
    },
    handleSave(tab) {
      const formRef = this.getFormRefByTab(tab);
      if (!formRef) return;
      formRef.validate((valid) => {
        if (valid) {
          this.$confirm('本次修改将影响商户侧后续创建房间、编辑房间和配置房间玩法时可填写的参数范围，请确认配置无误后保存。', '确认保存商户房间玩法配置？', {
            confirmButtonText: '确认保存',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.doSave(tab);
          }).catch(() => {});
        } else {
          this.$message.warning('请检查填写内容是否正确');
        }
      });
    },
    doSave(tab) {
      try {
        this.$message.success('商户房间玩法配置保存成功');
      } catch (e) {
        this.$message.error('商户房间玩法配置保存失败，请稍后重试');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.merchant-config-page {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.config-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 24px;
  }
}

.form-input-width {
  width: 400px;
}

.field-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin-top: 6px;
  max-width: 400px;
}

::v-deep .el-form-item {
  margin-bottom: 22px;
}

::v-deep .el-form-item__error {
  padding-top: 4px;
}
</style>
