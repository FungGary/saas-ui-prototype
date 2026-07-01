<template>
  <div class="agreement-edit">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
        <span class="page-title">协议编辑</span>
      </div>
    </div>

    <!-- 编辑表单区 -->
    <el-card :bordered="false" shadow="never" class="edit-card">
      <el-form
        ref="agreementForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        class="agreement-form"
      >
        <!-- 协议类型 -->
        <el-form-item label="协议类型" prop="categoryKey">
          <div class="form-item-content">
            <el-select v-model="formData.categoryKey" placeholder="请选择协议类型" style="width: 300px;">
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <annotation-point
              title="【新增】协议类型"
              content="优化前：没有协议类型概念，所有协议混在一起。&#10;&#10;优化后：新增协议类型字段，编辑协议时可选择所属类型（基础协议、玩法规则、权益规则、发货规则）。&#10;&#10;原因：对协议进行类型管理，便于后续按类型筛选和查找，提升维护效率。"
              priority="P1"
            />
          </div>
        </el-form-item>

        <!-- 版本号 -->
        <el-form-item label="版本号" prop="version">
          <div class="form-item-content">
            <el-input v-model="formData.version" disabled style="width: 200px;">
              <template slot="prepend">当前版本</template>
            </el-input>
            <annotation-point
              title="【新增】版本号显示"
              content="优化前：没有版本号概念，协议修改后直接覆盖，无法追溯。&#10;&#10;优化后：新增版本号显示，展示当前编辑的协议版本号，每次发布新版本号自动递增。&#10;&#10;原因：协议是法律性文件，需要版本管理来追溯变更历史，满足合规审计要求。"
              priority="P0"
            />
          </div>
        </el-form-item>

        <!-- 版本升级选择 -->
        <el-form-item label="版本升级">
          <div class="form-item-content">
            <el-radio-group v-model="formData.upgradeType" class="upgrade-radio-group">
              <el-radio label="minor">
                次版本升级
                <span class="upgrade-hint">（{{ formData.version }} → {{ nextMinorVersion }}）</span>
              </el-radio>
              <el-radio label="major">
                主版本升级
                <span class="upgrade-hint">（{{ formData.version }} → {{ nextMajorVersion }}）</span>
              </el-radio>
            </el-radio-group>
            <div class="upgrade-tip">
              <span>· <strong>次版本升级</strong>：局部修改、措辞调整、补充条款</span>
              <span>· <strong>主版本升级</strong>：重大结构调整、条款大面积变更</span>
            </div>
            <annotation-point
              title="【新增】版本升级选择"
              content="优化前：没有版本升级选择，版本号由系统自动递增，用户无法选择升级类型。&#10;&#10;优化后：在草稿状态下可选择版本升级类型（次版本/主版本），发布后版本号按所选类型递增。&#10;&#10;版本递增规则：&#10;· 次版本升级：次版本号+1，如 v1.0 → v1.1&#10;· 主版本升级：主版本号+1，次版本号归零，如 v1.9 → v2.0&#10;&#10;原因：由运营人员自主选择升级类型，更贴合实际业务场景。"
              priority="P0"
            />
          </div>
        </el-form-item>

        <!-- 发布状态 -->
        <el-form-item label="发布状态" prop="status">
          <div class="form-item-content">
            <el-tag
              :type="getStatusTagType(formData.status)"
              effect="light"
              size="medium"
            >
              {{ getStatusText(formData.status) }}
            </el-tag>
            <span class="status-desc">
              <template v-if="formData.status === 'draft'">当前为草稿状态，编辑后可保存为草稿或发布</template>
              <template v-else>当前为已发布状态，编辑后将生成新版本</template>
            </span>
            <annotation-point
              title="【新增】发布状态"
              content="优化前：没有状态管理，协议编辑后直接生效，无法区分草稿和已发布。&#10;&#10;优化后：新增发布状态字段，分为'草稿'和'已发布'两种状态，支持编辑中暂存草稿，确认无误后再发布。&#10;&#10;原因：协议变更需要审核流程，草稿态便于编辑过程中暂存，避免误操作直接影响线上协议。"
              priority="P0"
            />
          </div>
        </el-form-item>

        <!-- 协议标题 -->
        <el-form-item label="协议标题" prop="title">
          <div class="form-item-content">
            <el-input
              v-model="formData.title"
              placeholder="请输入协议标题"
              style="width: 500px;"
            ></el-input>
            <span class="red-star">*</span>
          </div>
        </el-form-item>

        <!-- 变更说明 -->
        <el-form-item label="变更说明" prop="remark">
          <div class="form-item-content">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入本次变更说明，便于后续查看历史版本时了解变更内容"
              style="width: 600px;"
            ></el-input>
            <span class="field-desc">发布新版本时必填，用于记录本次变更的原因和内容</span>
            <annotation-point
              title="【新增】变更说明"
              content="优化前：没有变更说明，协议修改后不知道改了什么，为什么改。&#10;&#10;优化后：新增变更说明字段，发布新版本时必填，用于记录本次变更的原因、内容和影响。&#10;&#10;原因：协议变更必须可追溯，变更说明是历史版本记录的重要组成部分，便于后续审计和回溯。"
              priority="P1"
            />
          </div>
        </el-form-item>

        <!-- 协议内容（富文本编辑器） -->
        <el-form-item label="内容" prop="content">
          <div class="form-item-content full-width">
            <div class="editor-wrapper">
              <div class="editor-toolbar">
                <span class="editor-toolbar-label">富文本编辑器</span>
                <span class="red-star">*</span>
              </div>
              <div class="editor-content">
                <div class="editor-placeholder" v-if="!formData.content">
                  请输入协议内容...
                </div>
                <div class="editor-preview" v-else v-html="formData.content"></div>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 底部操作按钮 -->
        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" @click="handleSaveDraft">保存草稿</el-button>
            <el-button type="success" @click="handlePublish">发布新版本</el-button>
            <el-button @click="handleBack">取消</el-button>
            <annotation-point
              title="【优化】操作按钮优化"
              content="优化前：只有'保存'和'取消'两个按钮，保存即生效，无法暂存草稿。&#10;&#10;优化后：&#10;1. '保存草稿'按钮：保存当前编辑内容为草稿，不发布，版本号不变&#10;2. '发布新版本'按钮：根据选择的升级类型递增版本号并发布，状态变为已发布&#10;3. '取消'按钮：放弃修改返回列表&#10;&#10;原因：协议是法律性文件，变更需谨慎，支持草稿暂存；由运营自主选择升级类型，更贴合实际业务场景。"
              priority="P0"
            />
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';

export default {
  name: 'AgreementEdit',
  components: {
    AnnotationPoint
  },
  data() {
    return {
      loading: false,
      formData: {
        id: 1,
        category: '基础协议',
        categoryKey: 'basic',
        title: '用户服务协议',
        version: 'v2.0',
        status: 'published',
        upgradeType: 'minor',
        remark: '',
        content: `<h2 style="text-align: center;">用户服务协议</h2>
<p><b>更新日期：</b>2025年6月1日</p>
<p><b>生效日期：</b>2025年6月1日</p>
<p>欢迎您使用我们的夹刻平台服务！在您开始使用之前，请仔细阅读以下条款。当您使用我们的服务时，即表示您已阅读、理解并同意遵守本协议的所有内容，同意作为本协议的一方当事人接受本协议约束。如果您不同意本协议，请停止使用我们的服务。如您未满18周岁，请您在法定监护人陪同下仔细阅读并充分理解本协议，尤其是其中的未成年人使用条款，并在征得法定监护人同意后使用夹刻。</p>
<h3>1.账号注册与使用</h3>
<p>1.1 您需要注册一个账号才能使用我们的服务。注册时需要提供真实、准确、完整的个人信息，并确保及时更新这些信息。您应保证所使用的第三方软件或平台的用户账号已完成真实身份信息认证，并符合相关法律法规要求。</p>
<p>1.2 您的夹刻账号仅限您本人使用，禁止以任何形式赠与、借用、出租、转让、售卖或以其他方式许可他人使用该账号。如果我们有合理理由认为使用者并非账号注册者的，为保障账号安全，我们有权暂停或终止向该账号提供服务。</p>
<p>1.3 您应当妥善保管您的账号和密码，不得将其泄露给他人，因您保管不当等自身原因导致您的账号被盗或密码丢失，相应损失需由您自行承担。若您发现他人未经许可适用您的账号，或发现其他任何安全漏洞时，请立即通知我们并采取修改密码等方式保护您的账号安全。</p>
<h3>2.用户权利和义务</h3>
<p>2.1 您有权根据我们的规定使用我们提供的服务，包括浏览商品、下单购买商品等。</p>
<p>2.2 您应当遵守国家法律法规、社会公共道德，不得利用我们的服务从事任何违法、侵权或损害他人利益的行为。</p>`
      },
      categoryOptions: [
        { label: '基础协议', value: 'basic' },
        { label: '玩法规则', value: 'gameplay' },
        { label: '权益规则', value: 'benefit' },
        { label: '发货规则', value: 'shipping' }
      ],
      // 表单校验规则已移除，仅保留必填标识（红色星号）
      formRules: {},
    };
  },
  computed: {
    /**
     * 计算次版本升级后的版本号
     */
    nextMinorVersion() {
      return this.getNextVersion(this.formData.version, 'minor');
    },
    /**
     * 计算主版本升级后的版本号
     */
    nextMajorVersion() {
      return this.getNextVersion(this.formData.version, 'major');
    },
  },
  created() {
    const id = this.$route.params.id;
    if (id) {
      this.loadAgreementDetail(id);
    }
  },
  methods: {
    /**
     * 计算下一个版本号
     * type: minor 次版本升级, major 主版本升级
     */
    getNextVersion(version, type) {
      const parts = version.replace('v', '').split('.');
      const major = parseInt(parts[0]) || 0;
      const minor = parseInt(parts[1]) || 0;
      if (type === 'major') {
        return 'v' + (major + 1) + '.0';
      }
      return 'v' + major + '.' + (minor + 1);
    },
    loadAgreementDetail(id) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    getStatusTagType(status) {
      const statusMap = {
        published: 'success',
        draft: 'info'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const textMap = {
        published: '已发布',
        draft: '草稿'
      };
      return textMap[status] || status;
    },
    handleSaveDraft() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.$message.success('草稿保存成功');
      }, 500);
    },
    /**
     * 发布新版本
     * 根据选择的升级类型递增版本号并发布
     */
    handlePublish() {
      const newVersion = this.formData.upgradeType === 'major'
        ? this.nextMajorVersion
        : this.nextMinorVersion;
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.formData.version = newVersion;
        this.formData.status = 'published';
        this.$message.success('发布成功，版本已升级为 ' + newVersion);
      }, 500);
    },
    handleBack() {
      this.$router.back();
    }
  }
};
</script>

<style lang="scss" scoped>
.agreement-edit {
  padding: 0;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;

    .header-left {
      display: flex;
      align-items: center;

      .page-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin-left: 8px;
      }
    }
  }

  .edit-card {
    margin: 16px;
  }

  .agreement-form {
    padding: 16px 0;

    .form-item-content {
      display: flex;
      align-items: center;
      position: relative;

      &.full-width {
        width: 100%;
        display: block;
      }

      .red-star {
        color: #f56c6c;
        margin-left: 4px;
      }

      .field-desc {
        margin-left: 12px;
        font-size: 12px;
        color: #909399;
      }

      .status-desc {
        margin-left: 12px;
        font-size: 13px;
        color: #606266;
      }
    }

    .editor-wrapper {
      width: 100%;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;

      .editor-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        .editor-toolbar-label {
          font-size: 13px;
          color: #606266;
        }
      }

      .editor-content {
        min-height: 400px;
        padding: 20px;

        .editor-placeholder {
          color: #c0c4cc;
          font-size: 14px;
        }

        .editor-preview {
          font-size: 14px;
          line-height: 1.8;
          color: #303133;

          h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 24px 0 16px;
          }

          h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0 12px;
          }

          p {
            margin: 12px 0;
          }
        }
      }
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 100px;
    }
  }

  .upgrade-radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .upgrade-hint {
      color: #909399;
      font-size: 13px;
      margin-left: 4px;
    }
  }

  .upgrade-tip {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
