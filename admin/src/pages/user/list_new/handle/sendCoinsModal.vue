<template>
  <el-dialog title="客服派币" :visible.sync="visible" width="550px" :close-on-click-modal="false">
    <AnnotationHighlight />
    <div class="modal-content">
      <div class="section">
        <div class="section-title">
          <i class="el-icon-user"></i>
          <span>当前用户</span>
          <annotation-point 
            title="【新增】用户信息展示" 
            content="优化前：弹窗中没有用户信息展示，运营派币时不清楚当前操作对象，容易搞错用户。&#10;&#10;优化后：弹窗顶部新增当前用户信息展示，包括头像、昵称、用户编号，支持点击复制编号。&#10;&#10;原因：确保运营在派币前能准确确认操作对象，避免误操作，提升资金安全性。" 
            priority="P0"
          />
        </div>
        <div class="user-info">
          <img :src="user.avatar" class="avatar" />
          <div class="user-detail">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-id">用户编号: {{ user.userId }} <i class="el-icon-copy-document"></i></div>
          </div>
        </div>
      </div>

      <div class="section" id="sendcoins-balance-optimize">
        <div class="section-title" id="sendcoins-current-assets">
          <i class="el-icon-wallet"></i>
          <span>当前资产</span>
          <annotation-point 
            title="【优化】余额实时计算" 
            content="优化前：派币弹窗中余额展示不明确，无法实时预览操作后的余额。&#10;&#10;优化后：弹窗明确显示当前余额，并实时计算操作后预期余额。&#10;&#10;原因：帮助运营在确认操作前直观了解余额变化，避免误操作，提升操作准确性。" 
            priority="P0"
          />
        </div>
        <div class="assets-row">
          <div class="asset-item gold">
            <i class="el-icon-coins"></i>
            <span class="asset-label">金币</span>
            <span class="asset-value">{{ user.gold }} 币</span>
          </div>
          <div class="asset-item integral">
            <i class="el-icon-star-off"></i>
            <span class="asset-label">积分</span>
            <span class="asset-value">{{ user.integral }} 分</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <i class="el-icon-settings"></i>
          <span>调整设置</span>
        </div>
        <div class="adjust-form">
          <div class="form-row">
            <div class="form-item">
              <span class="form-label">属性</span>
              <div class="radio-group">
                <label :class="['radio-label', { active: form.property === 'gold' }]">
                  <input type="radio" v-model="form.property" value="gold" />
                  <span>金币</span>
                </label>
                <label :class="['radio-label', { active: form.property === 'integral' }]">
                  <input type="radio" v-model="form.property" value="integral" />
                  <span>积分</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <span class="form-label">
                增减
                <annotation-point 
                  title="【新增】派币类型分类" 
                  content="优化前：派币原因分类不清晰，无法按类型统计和分析。&#10;&#10;优化后：派币类型分为增加和减少两大类，每类包含多种具体原因：&#10;- 增加类：平台补偿、商户补偿、活动奖励、售后补偿、运营赠送、异常补发、测试派币、其他&#10;- 减少类：误发扣回、活动奖励回收、订单退款扣回、作弊处罚、售后扣回、系统修正、测试扣回、其他&#10;&#10;原因：便于按类型统计派币数据，分析资金流向，满足财务和运营分析需求。" 
                  priority="P0"
                />
              </span>
              <div class="radio-group">
                <label :class="['radio-label', { active: form.type === 'add' }]" id="sendcoins-add-reasons">
                  <input type="radio" v-model="form.type" value="add" />
                  <span>增加</span>
                </label>
                <label :class="['radio-label', { active: form.type === 'subtract' }]" id="sendcoins-subtract-reasons">
                  <input type="radio" v-model="form.type" value="subtract" />
                  <span>减少</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item full" id="sendcoins-reason-optimize">
              <span class="form-label required">
                调整原因 *
                <annotation-point 
                  title="【新增】调整原因必填" 
                  content="优化前：派币时可以不填写原因，操作无记录可追溯。&#10;&#10;优化后：派币时强制填写原因、操作备注，系统自动记录操作人。&#10;&#10;原因：确保每一笔派币操作都有明确的原因和责任人，便于后续审计和问题追溯，提升资金安全性。" 
                  priority="P0"
                />
              </span>
              <el-select v-model="form.reason" placeholder="请选择调整原因" class="reason-select" id="sendcoins-reason">
                <el-option
                  v-for="item in reasonOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                ></el-option>
              </el-select>
            </div>
          </div>

          <div class="form-row" v-if="form.reason && (form.reason.endsWith('_add') || form.reason.endsWith('_subtract'))">
            <div class="form-item full">
              <span class="form-label required">具体原因 *</span>
              <el-input
                v-model="form.customReason"
                placeholder="请输入具体原因"
                class="custom-reason-input"
              ></el-input>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <span class="form-label">{{ form.property === 'gold' ? '金币数量' : '积分数量' }}</span>
              <div class="amount-wrapper">
                <el-input v-model="form.amount" placeholder="请输入要调整的数量" class="amount-input" />
                <span class="unit">{{ form.property === 'gold' ? '币' : '分' }}</span>
              </div>
            </div>
          </div>

          <div class="result-box" id="sendcoins-adjusted-assets">
            <div class="result-label">操作后余额</div>
            <div class="result-value" :class="form.property">{{ getResult() }} {{ form.property === 'gold' ? '币' : '分' }}</div>
            <div class="result-detail">
              当前余额 {{ user.gold }} {{ form.property === 'gold' ? '币' : '分' }}
              {{ form.type === 'add' ? '+' : '-' }}
              {{ parseInt(form.amount) || 0 }} {{ form.property === 'gold' ? '币' : '分' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'SendCoinsModal',
  components: { AnnotationHighlight, AnnotationPoint },
  data() {
    return {
      visible: false,
      user: {
        avatar: '',
        nickname: '',
        userId: '',
        gold: 0,
        integral: 0
      },
      form: {
        property: 'gold',
        type: 'add',
        reason: '',
        customReason: '',
        amount: ''
      },
      addReasons: [
        { value: 'platform', label: '平台补偿' },
        { value: 'merchant', label: '商户补偿' },
        { value: 'activity', label: '活动奖励' },
        { value: 'aftersale', label: '售后补偿' },
        { value: 'operation', label: '运营赠送' },
        { value: 'abnormal', label: '异常补发' },
        { value: 'test', label: '测试派币' },
        { value: 'other_add', label: '其他' }
      ],
      subtractReasons: [
        { value: 'wrong', label: '误发扣回' },
        { value: 'activity_recycle', label: '活动奖励回收' },
        { value: 'refund', label: '订单退款扣回' },
        { value: 'cheat', label: '作弊处罚' },
        { value: 'aftersale_deduct', label: '售后扣回' },
        { value: 'system', label: '系统修正' },
        { value: 'test_deduct', label: '测试扣回' },
        { value: 'other_subtract', label: '其他' }
      ]
    };
  },
  computed: {
    reasonOptions() {
      return this.form.type === 'add' ? this.addReasons : this.subtractReasons;
    }
  },
  watch: {
    'form.type'() {
      this.form.reason = '';
      this.form.customReason = '';
    }
  },
  methods: {
    open(user) {
      this.user = {
        avatar: user.avatar,
        nickname: user.nickname,
        userId: user.userId,
        gold: user.balance ? user.balance * 10 : 0,
        integral: user.balance ? Math.floor(user.balance * 10) : 0
      };
      this.form = {
        property: 'gold',
        type: 'add',
        reason: '',
        customReason: '',
        amount: ''
      };
      this.visible = true;
    },
    getResult() {
      const amount = parseInt(this.form.amount) || 0;
      const current = this.form.property === 'gold' ? this.user.gold : this.user.integral;
      if (this.form.type === 'add') {
        return current + amount;
      }
      return Math.max(0, current - amount);
    },
    confirm() {
      if (!this.form.reason) {
        this.$message.error('请选择调整原因');
        return;
      }
      if ((this.form.reason.endsWith('_add') || this.form.reason.endsWith('_subtract')) && !this.form.customReason) {
        this.$message.error('请输入具体原因');
        return;
      }
      if (!this.form.amount || parseInt(this.form.amount) <= 0) {
        this.$message.error('请输入有效的数量');
        return;
      }
      this.$message.success('客服派币成功');
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 10px 0;
}

.section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;

  i {
    margin-right: 8px;
    color: #409eff;
  }
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.assets-row {
  display: flex;
  gap: 16px;
}

.asset-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;

  &.gold {
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
    border: 1px solid #ffe58f;
    color: #d4a574;
  }

  &.integral {
    background: linear-gradient(135deg, #f6ffed 0%, #e8f5e9 100%);
    border: 1px solid #b7eb8f;
    color: #67c23a;
  }

  i {
    font-size: 24px;
    margin-right: 12px;
  }

  .asset-label {
    font-size: 14px;
    color: #909399;
    margin-right: 8px;
  }

  .asset-value {
    font-size: 18px;
    font-weight: 600;
  }
}

.adjust-form {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.form-row {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;

  &.full {
    flex: 1;
  }
}

.form-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;

  &.required::after {
    content: '*';
    color: #f56c6c;
    margin-left: 4px;
  }
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  padding: 6px 12px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;

  &.active {
    background: #e8f5fd;
    border-color: #409eff;
    color: #409eff;
  }

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.reason-select {
  flex: 1;
  width: auto;
}

.custom-reason-input {
  flex: 1;
}

.amount-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-input {
  width: 150px;
}

.unit {
  font-size: 14px;
  color: #909399;
}

.result-box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.result-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;

  &.gold {
    color: #d4a574;
  }

  &.integral {
    color: #67c23a;
  }
}

.result-detail {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>