<template>
  <el-dialog title="修改身份" :visible.sync="visible" width="450px" :close-on-click-modal="false">
    <AnnotationHighlight />
    <div class="modal-content">
      <div class="form-item">
        <span class="form-label required">身份</span>
        <el-select v-model="form.identity" placeholder="请选择身份" class="identity-select">
          <el-option value="user" label="用户"></el-option>
          <el-option value="anchor" label="主播"></el-option>
        </el-select>
      </div>

      <div id="identity-notice-optimize">
        <div class="impact-section" id="identity-change-notice">
          <div class="section-title">
            <i class="el-icon-info"></i>
            <span>修改影响说明</span>
            <annotation-point 
              title="【新增】身份影响说明" 
              content="优化前：修改身份时没有明确的影响说明，运营不清楚修改后会产生什么影响。&#10;&#10;优化后：增加说明：'主推充值的币不计入统计、账号奖品不发货、奖品到期不自动兑换积分'等。&#10;&#10;原因：让运营在修改身份前清楚了解可能产生的影响，避免误操作，提升操作安全性。" 
              priority="P0"
            />
          </div>
          <div class="impact-content">
            <p>修改为主播身份后，将产生以下影响，请确认后再操作。</p>
            <ul class="impact-list">
              <li>
                <i class="el-icon-warning orange"></i>
                <span>主播充值的币不计入统计</span>
              </li>
              <li>
                <i class="el-icon-warning orange"></i>
                <span>账号奖品不发货</span>
              </li>
              <li>
                <i class="el-icon-warning orange"></i>
                <span>账号奖品不发货兑换积分</span>
              </li>
              <li>
                <i class="el-icon-warning orange"></i>
                <span>奖品到期不自动兑换积分</span>
              </li>
            </ul>
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
  name: 'ChangeIdentityModal',
  components: { AnnotationHighlight, AnnotationPoint },
  data() {
    return {
      visible: false,
      user: {},
      form: {
        identity: ''
      }
    };
  },
  methods: {
    open(user) {
      this.user = user;
      this.form.identity = user.identity || 'user';
      this.visible = true;
    },
    confirm() {
      this.$message.success('身份修改成功');
      this.visible = false;
      if (this.$parent && this.$parent.changeUserIdentity) {
        this.$parent.changeUserIdentityDirect(this.user, this.form.identity);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 10px 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.form-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;

  &.required::after {
    content: '*';
    color: #f56c6c;
    margin-left: 4px;
  }
}

.identity-select {
  flex: 1;
  width: auto;
}

.impact-section {
  background: #fff7e6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #d4a574;
  margin-bottom: 12px;

  i {
    margin-right: 8px;
  }
}

.impact-content {
  p {
    font-size: 13px;
    color: #606266;
    margin-bottom: 12px;
  }
}

.impact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.impact-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: #606266;
  border-bottom: 1px dashed #ffe58f;

  &:last-child {
    border-bottom: none;
  }
}

.el-icon-warning {
  &.orange {
    color: #e6a23c;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>