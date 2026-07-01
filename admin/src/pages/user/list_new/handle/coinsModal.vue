<template>
  <el-dialog title="修改金币积分" :visible.sync="visible" width="600px" :close-on-click-modal="false">
    <AnnotationHighlight />
    <div class="modal-content">
      <div class="section">
        <div class="section-title" id="coins-user-info">
          <i class="el-icon-user"></i>
          <span>当前用户</span>
          <annotation-point 
            title="【新增】用户信息展示" 
            content="优化前：弹窗中没有用户信息展示，运营操作时不清楚当前操作对象，容易搞错用户。&#10;&#10;优化后：弹窗顶部新增当前用户信息展示，包括头像、昵称、用户编号，支持点击复制编号。&#10;&#10;原因：确保运营在进行金币积分调整前能准确确认操作对象，避免误操作，提升操作安全性。" 
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

      <div class="section">
        <div class="section-title" id="coins-current-assets">
          <i class="el-icon-wallet"></i>
          <span>当前资产</span>
          <annotation-point 
            title="【优化】余额实时计算" 
            content="优化前：弹窗中余额展示不明确，无法实时预览操作后的余额变化。&#10;&#10;优化后：弹窗明确显示当前金币和积分余额，并在调整设置中实时计算操作后预期余额。&#10;&#10;原因：帮助运营在确认操作前直观了解余额变化，避免误操作，提升操作准确性。" 
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

      <div class="section" id="coins-adjusted-assets">
        <div class="section-title">
          <i class="el-icon-settings"></i>
          <span>调整设置</span>
          <annotation-point 
            title="【优化】多资产批量调整" 
            content="优化前：金币、经验值、积分需要分别在不同页面或弹窗中调整，操作繁琐，效率低。&#10;&#10;优化后：同一弹窗内支持同时调整金币、经验值、积分三种资产，每项独立设置增加/减少和数量，右侧实时显示操作后余额。&#10;&#10;原因：提升运营效率，减少操作步骤，一次打开弹窗即可完成多种资产的调整，同时实时预览结果避免误操作。" 
            priority="P0"
          />
        </div>
        <div class="adjust-table">
          <div class="adjust-row">
            <div class="adjust-item property">
              <i class="el-icon-coins gold-icon"></i>
              <span>金币</span>
            </div>
            <div class="adjust-item operation">
              <label class="radio-label">
                <input type="radio" v-model="adjustments.gold.type" value="add" />
                <span>增加</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="adjustments.gold.type" value="subtract" />
                <span>减少</span>
              </label>
            </div>
            <div class="adjust-item amount">
              <el-input v-model="adjustments.gold.amount" placeholder="请输入数量" class="amount-input" />
              <span class="unit">币</span>
            </div>
            <div class="adjust-item arrow">→</div>
            <div class="adjust-item result gold">
              {{ getGoldResult() }} 币
            </div>
          </div>

          <div class="adjust-row">
            <div class="adjust-item property">
              <i class="el-icon-trending-up exp-icon"></i>
              <span>经验值</span>
            </div>
            <div class="adjust-item operation">
              <label class="radio-label">
                <input type="radio" v-model="adjustments.exp.type" value="add" />
                <span>增加</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="adjustments.exp.type" value="subtract" />
                <span>减少</span>
              </label>
            </div>
            <div class="adjust-item amount">
              <el-input v-model="adjustments.exp.amount" placeholder="请输入数量" class="amount-input" />
            </div>
            <div class="adjust-item arrow">→</div>
            <div class="adjust-item result exp">
              操作后余额
            </div>
          </div>

          <div class="adjust-row">
            <div class="adjust-item property">
              <i class="el-icon-star-off integral-icon"></i>
              <span>积分</span>
            </div>
            <div class="adjust-item operation">
              <label class="radio-label">
                <input type="radio" v-model="adjustments.integral.type" value="add" />
                <span>增加</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="adjustments.integral.type" value="subtract" />
                <span>减少</span>
              </label>
            </div>
            <div class="adjust-item amount">
              <el-input v-model="adjustments.integral.amount" placeholder="请输入数量" class="amount-input" />
              <span class="unit">分</span>
            </div>
            <div class="adjust-item arrow">→</div>
            <div class="adjust-item result integral">
              {{ getIntegralResult() }} 分
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
  name: 'CoinsModal',
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
      adjustments: {
        gold: { type: 'add', amount: '' },
        exp: { type: 'add', amount: '' },
        integral: { type: 'add', amount: '' }
      }
    };
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
      this.adjustments = {
        gold: { type: 'add', amount: '' },
        exp: { type: 'add', amount: '' },
        integral: { type: 'add', amount: '' }
      };
      this.visible = true;
    },
    getGoldResult() {
      const amount = parseInt(this.adjustments.gold.amount) || 0;
      if (this.adjustments.gold.type === 'add') {
        return this.user.gold + amount;
      }
      return Math.max(0, this.user.gold - amount);
    },
    getIntegralResult() {
      const amount = parseInt(this.adjustments.integral.amount) || 0;
      if (this.adjustments.integral.type === 'add') {
        return this.user.integral + amount;
      }
      return Math.max(0, this.user.integral - amount);
    },
    confirm() {
      this.$message.success('金币积分修改成功');
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

.adjust-table {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.adjust-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: none;
  }
}

.adjust-item {
  flex: 1;
  display: flex;
  align-items: center;

  &.property {
    flex: 0.8;
    gap: 8px;
    font-size: 14px;
    color: #303133;
  }

  &.operation {
    flex: 1;
    gap: 16px;
  }

  &.amount {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &.arrow {
    flex: 0.3;
    text-align: center;
    color: #909399;
  }

  &.result {
    flex: 1;
    font-weight: 600;
    font-size: 16px;
    text-align: right;

    &.gold {
      color: #d4a574;
    }

    &.exp {
      color: #409eff;
    }

    &.integral {
      color: #67c23a;
    }
  }
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;

  input[type="radio"] {
    margin: 0;
  }
}

.amount-input {
  width: 120px;
}

.unit {
  font-size: 14px;
  color: #909399;
}

.gold-icon {
  color: #d4a574;
}

.exp-icon {
  color: #409eff;
}

.integral-icon {
  color: #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>