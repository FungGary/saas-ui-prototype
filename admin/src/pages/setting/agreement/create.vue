<template>
  <div class="agreement-create">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
        <span class="page-title">新增协议</span>
      </div>
    </div>

    <!-- 新增表单区 -->
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
              content="协议类型用于对协议进行归组管理，便于后续按类型筛选和查找。可在'设置-协议类型管理'中维护类型字典。&#10;&#10;可选类型：基础协议、玩法规则、权益规则、发货规则。"
              priority="P1"
            />
          </div>
        </el-form-item>

        <!-- 初始版本 -->
        <el-form-item label="初始版本">
          <div class="form-item-content">
            <el-tag size="medium">v1.0（草稿）</el-tag>
            <span class="version-tip">新协议默认版本号为 v1.0，状态为草稿，编辑内容后需点击发布才会在客户端展示</span>
            <annotation-point
              title="【新增】初始版本说明"
              content="新创建的协议默认为 v1.0 草稿状态，此时仅后台可见，客户端不展示。&#10;&#10;完整发布流程：&#10;1. 选择协议类型并编辑协议标题、内容&#10;2. 点击'保存草稿'暂存，或点击'去发布'直接进入发布流程&#10;3. 在发布弹窗中选择版本升级类型（次版本/主版本）并填写变更说明&#10;4. 确认发布后，协议状态变为'已发布'，客户端可见&#10;&#10;原因：协议是法律性文件，变更需谨慎，支持草稿暂存和分步确认，降低误操作风险。"
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
            <el-button type="success" @click="handlePublish">去发布</el-button>
            <el-button @click="handleBack">取消</el-button>
            <annotation-point
              title="【新增】操作按钮"
              content="优化后提供三个操作按钮：&#10;1. '保存草稿'：保存当前编辑内容为草稿，不跳转&#10;2. '去发布'：保存后跳转到协议编辑页面进行发布流程（选择版本升级类型、填写变更说明）&#10;3. '取消'：放弃新增，返回协议列表&#10;&#10;原因：支持分步操作，草稿可暂存后继续编辑，降低创建协议的操作复杂度。"
              priority="P1"
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
  name: 'AgreementCreate',
  components: {
    AnnotationPoint
  },
  data() {
    return {
      loading: false,
      formData: {
        categoryKey: '',
        title: '',
        content: ''
      },
      categoryOptions: [
        { label: '基础协议', value: 'basic' },
        { label: '玩法规则', value: 'gameplay' },
        { label: '权益规则', value: 'benefit' },
        { label: '发货规则', value: 'shipping' }
      ],
      formRules: {},
    };
  },
  methods: {
    handleSaveDraft() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.$message.success('草稿保存成功');
      }, 500);
    },
    handlePublish() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        // 跳转到协议编辑页面进行发布
        const newId = Date.now();
        this.$router.push({
          path: `/admin/setting/agreement/edit/${newId}`,
          query: {
            isNew: '1',
            type: this.formData.type,
            categoryKey: this.formData.categoryKey,
            title: this.formData.title,
            content: this.formData.content
          }
        });
      }, 500);
    },
    handleBack() {
      this.$router.back();
    }
  }
};
</script>

<style lang="scss" scoped>
.agreement-create {
  padding: 0;

  .page-header {
    padding: 16px 20px;
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

      .version-tip {
        margin-left: 12px;
        font-size: 13px;
        color: #909399;
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
}
</style>
