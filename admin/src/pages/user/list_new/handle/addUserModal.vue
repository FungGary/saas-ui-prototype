<template>
  <el-drawer title="添加用户" :visible.sync="visible" :size="550" :mask-opacity="0.5" @closed="onClose">
    <AnnotationHighlight />
    <div class="drawer-content">
      <div class="section">
        <div class="section-title">
          <i class="el-icon-user"></i>
          <span>基本信息</span>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <span class="form-label">真实姓名</span>
            <el-input v-model="form.realName" placeholder="请输入真实姓名" class="form-input"></el-input>
          </div>
          <div class="form-item required">
            <span class="form-label">手机号码 *</span>
            <el-input v-model="form.phone" placeholder="请输入手机号码" class="form-input"></el-input>
          </div>
          <div class="form-item">
            <span class="form-label">生日</span>
            <el-date-picker v-model="form.birthday" type="date" placeholder="请选择生日" class="form-input"></el-date-picker>
          </div>
          <div class="form-item">
            <span class="form-label">身份证号</span>
            <el-input v-model="form.idCard" placeholder="请输入身份证号" class="form-input"></el-input>
          </div>
          <div class="form-item">
            <span class="form-label">用户地址</span>
            <el-input v-model="form.address" placeholder="请输入用户地址" class="form-input"></el-input>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <i class="el-icon-lock"></i>
          <span>密码</span>
        </div>
        <div class="form-grid">
          <div class="form-item required">
            <span class="form-label">登录密码 *</span>
            <el-input v-model="form.password" type="password" placeholder="请输入登录密码" class="form-input"></el-input>
          </div>
          <div class="form-item required">
            <span class="form-label">确认密码 *</span>
            <el-input v-model="form.confirmPassword" type="password" placeholder="请输入确认密码" class="form-input"></el-input>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <i class="el-icon-user-solid"></i>
          <span>用户概况</span>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <span class="form-label">用户等级</span>
            <el-select v-model="form.level" placeholder="请选择" class="form-input">
              <el-option value="Lv1" label="Lv1"></el-option>
              <el-option value="Lv2" label="Lv2"></el-option>
              <el-option value="Lv3" label="Lv3"></el-option>
              <el-option value="Lv4" label="Lv4"></el-option>
              <el-option value="Lv5" label="Lv5"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <span class="form-label">用户标签</span>
            <div class="label-row">
              <el-select v-model="form.label" placeholder="选择用户关联标签" class="form-input label-select">
                <el-option value="" label="请选择"></el-option>
                <el-option
                  v-for="item in labelOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                ></el-option>
              </el-select>
              <el-button type="text" class="add-label-btn" @click="showAddLabel = true">新增标签</el-button>
            </div>
          </div>
          <div id="adduser-identity-optimize">
            <div class="form-item" id="adduser-identity">
              <span class="form-label">
                身份
                <annotation-point 
                  title="【新增】用户身份选择" 
                  content="优化前：新增用户时无法直接选择身份，需要创建后再单独修改。&#10;&#10;优化后：增加'身份'下拉选择框，支持新增时直接选择用户身份（用户/主播）。&#10;&#10;原因：提升运营效率，减少操作步骤，新增用户时即可设置身份，无需后续二次操作。" 
                  priority="P0"
                />
              </span>
              <el-select v-model="form.identity" placeholder="请选择身份" class="form-input">
                <el-option value="user" label="用户"></el-option>
                <el-option value="anchor" label="主播"></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <span class="form-label">用户状态</span>
            <div class="radio-group">
              <label :class="['radio-label', { active: form.status === 'normal' }]">
                <input type="radio" v-model="form.status" value="normal" />
                <span>开启</span>
              </label>
              <label :class="['radio-label', { active: form.status === 'locked' }]">
                <input type="radio" v-model="form.status" value="locked" />
                <span>锁定</span>
              </label>
            </div>
          </div>
        </div>

        <div class="identity-tips" v-if="form.identity === 'anchor'">
          <div class="tips-title">
            <i class="el-icon-info"></i>
            <span>主播身份影响说明</span>
          </div>
          <ul class="tips-list">
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
              <span>奖品到期不自动兑换积分</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <i class="el-icon-edit"></i>
          <span>用户备注</span>
        </div>
        <div class="form-item full">
          <span class="form-label">用户备注</span>
          <el-input v-model="form.remark" type="textarea" placeholder="请输入用户备注" :rows="3" class="form-input"></el-input>
        </div>
      </div>
    </div>

    <el-dialog title="新增标签" :visible.sync="showAddLabel" width="350px">
      <div class="add-label-form">
        <el-form-item label="标签名称" label-width="80px">
          <el-input v-model="newLabelName" placeholder="请输入标签名称"></el-input>
        </el-form-item>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddLabel = false">取消</el-button>
        <el-button type="primary" @click="addLabel">确定</el-button>
      </div>
    </el-dialog>

    <div class="drawer-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'AddUserModal',
  components: { AnnotationHighlight, AnnotationPoint },
  data() {
    return {
      visible: false,
      showAddLabel: false,
      newLabelName: '',
      labelOptions: [
        { value: 'vip', label: 'VIP用户' },
        { value: 'new', label: '新用户' },
        { value: 'active', label: '活跃用户' }
      ],
      form: {
        realName: '',
        phone: '',
        birthday: '',
        idCard: '',
        address: '',
        password: '',
        confirmPassword: '',
        level: '',
        label: '',
        identity: 'user',
        status: 'normal',
        remark: ''
      }
    };
  },
  methods: {
    open() {
      this.form = {
        realName: '',
        phone: '',
        birthday: '',
        idCard: '',
        address: '',
        password: '',
        confirmPassword: '',
        level: '',
        label: '',
        identity: 'user',
        status: 'normal',
        remark: ''
      };
      this.showAddLabel = false;
      this.newLabelName = '';
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },
    addLabel() {
      if (!this.newLabelName.trim()) {
        this.$message.error('请输入标签名称');
        return;
      }
      const newLabel = {
        value: this.newLabelName.toLowerCase().replace(/\s+/g, ''),
        label: this.newLabelName.trim()
      };
      this.labelOptions.push(newLabel);
      this.form.label = newLabel.value;
      this.showAddLabel = false;
      this.newLabelName = '';
      this.$message.success('标签添加成功');
    },
    confirm() {
      if (!this.form.phone) {
        this.$message.error('请输入手机号码');
        return;
      }
      if (!this.form.password) {
        this.$message.error('请输入登录密码');
        return;
      }
      if (!this.form.confirmPassword) {
        this.$message.error('请输入确认密码');
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.$message.error('两次输入的密码不一致');
        return;
      }
      this.$message.success('用户添加成功');
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.drawer-content {
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full {
    grid-column: span 2;
  }

  &.required .form-label::after {
    content: '*';
    color: #f56c6c;
    margin-left: 4px;
  }
}

.form-label {
  font-size: 13px;
  color: #606266;
}

.form-input {
  width: 100%;
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

.identity-tips {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff7e6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}

.tips-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #d4a574;
  margin-bottom: 12px;

  i {
    margin-right: 8px;
  }
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
  color: #606266;
}

.el-icon-warning {
  &.orange {
    color: #e6a23c;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  margin-top: 24px;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label-select {
  flex: 1;
  width: auto;
}

.add-label-btn {
  padding: 0;
  color: #409eff;
  font-size: 13px;
}

.add-label-form {
  padding: 10px 0;
}
</style>