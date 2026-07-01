<template>
  <div
    :data-id="annotationId"
    :class="['annotation-marker', `priority-${annotationPriority}`, { active: isActive }]"
    :style="markerStyle"
    @click="handleClick"
  >
    <span class="marker-id">{{ annotationId }}</span>
    
    <el-popover
      placement="right"
      width="300"
      trigger="hover"
      popper-class="annotation-popover"
    >
      <div class="annotation-tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-type">{{ annotationType }}</span>
          <span :class="['tooltip-priority', `priority-${annotationPriority}`]">
            {{ annotationPriority }}
          </span>
        </div>
        <div class="tooltip-title">{{ annotationTitle }}</div>
        <div class="tooltip-desc">{{ annotationDescription }}</div>
        <div class="tooltip-footer">
          <el-button size="mini" type="primary" @click="viewDetail">查看详情</el-button>
        </div>
      </div>
      
      <span slot="reference" class="marker-id">{{ annotationId }}</span>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'AnnotationMarker',
  props: {
    annotationId: {
      type: String,
      required: true
    },
    annotationType: {
      type: String,
      default: '字段说明'
    },
    annotationTitle: {
      type: String,
      default: ''
    },
    annotationPriority: {
      type: String,
      default: 'P0'
    },
    annotationDescription: {
      type: String,
      default: ''
    },
    position: {
      type: Object,
      default: () => ({ top: '0px', left: '0px' })
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    markerStyle() {
      const style = {
        '--marker-color': this.getMarkerColor()
      };
      if (this.position.top) style.top = this.position.top;
      if (this.position.left) style.left = this.position.left;
      if (this.position.right) style.right = this.position.right;
      if (this.position.bottom) style.bottom = this.position.bottom;
      return style;
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.annotationId);
    },
    viewDetail() {
      this.$emit('click', this.annotationId);
    }
  }
};
</script>

<style lang="scss" scoped>
.annotation-marker {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  .marker-id {
    pointer-events: none;
  }
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &.active {
    transform: scale(1.3);
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.4);
    animation: pulse 1.5s infinite;
  }
  
  &.priority-P0 {
    width: 28px;
    height: 28px;
    font-size: 11px;
    background: #f56c6c;
  }
  
  &.priority-P1 {
    width: 24px;
    height: 24px;
    font-size: 10px;
    background: #e6a23c;
    opacity: 0.9;
  }
  
  &.priority-P2 {
    width: 20px;
    height: 20px;
    font-size: 9px;
    background: #909399;
    opacity: 0.7;
  }
}

.annotation-tooltip-content {
  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .tooltip-type {
      font-size: 12px;
      color: #409eff;
      font-weight: 500;
    }
    
    .tooltip-priority {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      color: #fff;
      
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
  }
  
  .tooltip-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }
  
  .tooltip-desc {
    font-size: 12px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 12px;
  }
  
  .tooltip-footer {
    text-align: right;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0.2);
  }
}
</style>

<style lang="scss">
.annotation-popover {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>