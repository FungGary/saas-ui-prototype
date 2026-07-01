<template>
  <div class="annotation-detail">
    <div class="detail-header">
      <div class="detail-id" :class="`priority-${annotation.priority}`">
        {{ annotation.id }}
      </div>
      <div class="detail-meta">
        <span class="detail-type">{{ annotation.type }}</span>
        <span class="detail-priority">优先级: {{ annotation.priority }}</span>
        <span class="detail-status">{{ getStatusText(annotation.status) }}</span>
      </div>
    </div>
    
    <div class="detail-title">{{ annotation.title }}</div>
    
    <div class="detail-section">
      <div class="section-label">说明</div>
      <div class="section-content">{{ annotation.description }}</div>
    </div>
    
    <div v-if="annotation.businessRule && annotation.businessRule.length" class="detail-section">
      <div class="section-label">业务规则</div>
      <ul class="rule-list">
        <li v-for="(rule, index) in annotation.businessRule" :key="index">{{ rule }}</li>
      </ul>
    </div>
    
    <div v-if="annotation.interaction && annotation.interaction.length" class="detail-section">
      <div class="section-label">交互规则</div>
      <ul class="rule-list">
        <li v-for="(item, index) in annotation.interaction" :key="index">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="annotation.validation && annotation.validation.length" class="detail-section">
      <div class="section-label">校验规则</div>
      <ul class="rule-list validation">
        <li v-for="(item, index) in annotation.validation" :key="index">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="annotation.state && annotation.state.length" class="detail-section">
      <div class="section-label">状态说明</div>
      <div class="state-tags">
        <span v-for="(state, index) in annotation.state" :key="index" class="state-tag">{{ state }}</span>
      </div>
    </div>
    
    <div v-if="annotation.permission && annotation.permission.length" class="detail-section">
      <div class="section-label">权限说明</div>
      <ul class="rule-list">
        <li v-for="(item, index) in annotation.permission" :key="index">{{ item }}</li>
      </ul>
    </div>
    
    <div v-if="annotation.relatedFields && annotation.relatedFields.length" class="detail-section">
      <div class="section-label">关联字段</div>
      <div class="related-fields">
        <span v-for="(field, index) in annotation.relatedFields" :key="index" class="field-tag">{{ field }}</span>
      </div>
    </div>
    
    <div v-if="annotation.跳转说明" class="detail-section">
      <div class="section-label">跳转说明</div>
      <div class="section-content highlight">{{ annotation.跳转说明 }}</div>
    </div>
    
    <div v-if="annotation.todo && annotation.todo.length" class="detail-section todo">
      <div class="section-label">待确认事项</div>
      <ul class="rule-list">
        <li v-for="(item, index) in annotation.todo" :key="index">{{ item }}</li>
      </ul>
    </div>
    
    <div class="detail-footer">
      <div class="footer-info">
        <span class="source">来源: {{ annotation.source }}</span>
        <span class="version">版本: {{ annotation.version }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnotationDetail',
  props: {
    annotation: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStatusText(status) {
      const map = {
        confirmed: '已确认',
        inferred: '推断',
        pending_confirm: '待确认',
        changed: '已变更',
        deprecated: '已废弃'
      };
      return map[status] || status;
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-detail {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  
  .detail-id {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: #409eff;
    
    &.priority-P0 {
      background: #f56c6c;
    }
    
    &.priority-P1 {
      background: #e6a23c;
    }
    
    &.priority-P2 {
      background: #909399;
    }
  }
  
  .detail-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    
    .detail-type {
      color: #409eff;
      font-weight: 500;
    }
    
    .detail-priority {
      color: #f56c6c;
    }
    
    .detail-status {
      color: #67c23a;
    }
  }
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 16px;
  
  .section-label {
    font-size: 13px;
    font-weight: 600;
    color: #409eff;
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }
  
  .section-content {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    
    &.highlight {
      padding: 8px 12px;
      background: #f4f4f5;
      border-radius: 4px;
      color: #303133;
    }
  }
  
  &.todo {
    .section-label {
      color: #e6a23c;
      border-left-color: #e6a23c;
    }
  }
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    font-size: 13px;
    color: #606266;
    line-height: 1.8;
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
    
    &::before {
      content: '•';
      position: absolute;
      left: 4px;
      color: #409eff;
    }
  }
  
  &.validation li::before {
    color: #f56c6c;
  }
}

.state-tags,
.related-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.state-tag,
.field-tag {
  padding: 4px 10px;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.field-tag {
  background: #ecf5ff;
  color: #409eff;
}

.detail-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  
  .footer-info {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #909399;
  }
}
</style>