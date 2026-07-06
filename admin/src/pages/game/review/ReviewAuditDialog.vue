<template>
  <el-dialog
    :visible.sync="visible"
    title="截图审核"
    width="760px"
    :close-on-click-modal="false"
    class="review-audit-dialog"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="audit-content">
      <!-- 审核信息 -->
      <el-card :bordered="false" shadow="never" class="info-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-info card-icon"></i>
          <span class="card-title">审核信息</span>
        </div>
        <div class="rule-label">规则详情</div>
        <div class="media-row">
          <div class="media-item">
            <img :src="ruleImageUrl" class="media-img" />
          </div>
          <div class="media-item video-item">
            <video
              v-if="currentRow.videoUrl"
              ref="reviewVideoPlayer"
              :src="currentRow.videoUrl"
              controls
              class="review-video"
              preload="metadata"
            >
              您的浏览器不支持视频播放
            </video>
            <div v-else class="video-placeholder">
              <i class="el-icon-video-camera"></i>
              <span>暂无视频</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 审核状态 -->
      <el-card :bordered="false" shadow="never" class="status-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-circle-check card-icon"></i>
          <span class="card-title">审核状态</span>
        </div>
        <div class="audit-status-section">
          <el-radio-group v-model="auditForm.auditResult" class="audit-radio-group">
            <el-radio label="pass" class="audit-radio pass">
              <span class="radio-text">通过</span>
            </el-radio>
            <el-radio label="reject" class="audit-radio reject">
              <span class="radio-text">不通过</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 驳回原因（仅不通过时显示） -->
        <div v-if="auditForm.auditResult === 'reject'" class="reject-section">
          <span class="reject-label">驳回原因</span>
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因"
            maxlength="50"
            show-word-limit
            class="reject-textarea"
          ></el-input>
        </div>
      </el-card>

      <!-- 奖品信息（仅通过时显示） -->
      <el-card
        v-if="auditForm.auditResult === 'pass'"
        :bordered="false"
        shadow="never"
        class="prize-card"
        :body-style="{ padding: '16px 20px' }"
      >
        <div slot="header" class="card-header">
          <i class="el-icon-present card-icon"></i>
          <span class="card-title">奖品信息</span>
        </div>

        <div class="prize-type-section">
          <el-radio-group v-model="auditForm.prizeType" class="prize-type-group">
            <el-radio label="physical" class="prize-radio">
              <span class="radio-text">实物奖品</span>
            </el-radio>
            <el-radio label="points" class="prize-radio">
              <span class="radio-text">积分</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 倍数说明 -->
        <div class="multiple-tip">
          <i class="el-icon-info"></i>
          <span>倍数说明：根据投币倍数或玩法规则计算最终奖品数</span>
        </div>

        <!-- 实物奖品表格 -->
        <div v-if="auditForm.prizeType === 'physical'" class="prize-table-wrapper">
          <el-table :data="auditForm.prizeList" border size="small" class="prize-table">
            <el-table-column label="奖品" min-width="180">
              <template slot-scope="scope">
                <div class="prize-info" v-if="scope.row.prizeId">
                  <img :src="getPrizeImage(scope.row.prizeId)" class="prize-thumb" />
                  <div class="prize-detail">
                    <div class="prize-name">{{ scope.row.prizeName }}</div>
                    <div class="prize-id">商品ID: {{ scope.row.prizeId }}</div>
                  </div>
                </div>
                <span v-else class="text-gray">选择奖品</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.quantity"
                  size="small"
                  type="number"
                  min="1"
                  @change="calculateTotal(scope.row)"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="倍数" width="80" align="center">
              <template slot-scope="scope">
                <span class="multiple-tag">x{{ scope.row.multiple }}</span>
              </template>
            </el-table-column>
            <el-table-column label="礼品总数" width="100" align="center">
              <template slot-scope="scope">
                <span class="total-text">{{ scope.row.total }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" align="center">
              <template slot-scope="scope">
                <i
                  class="el-icon-delete delete-icon"
                  @click="handleDeletePrize(scope.$index)"
                ></i>
              </template>
            </el-table-column>
          </el-table>

          <!-- 添加奖品 -->
          <div class="prize-actions">
            <el-button type="primary" size="small" @click="handleAddPrize">添加奖品</el-button>
          </div>
        </div>

        <!-- 积分奖品 -->
        <div v-if="auditForm.prizeType === 'points'" class="points-form">
          <el-table :data="pointsFormList" border size="small" class="prize-table">
            <el-table-column label="积分数量" width="160">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.quantity"
                  size="small"
                  type="number"
                  min="0"
                  @change="calculatePointsTotal(scope.row)"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="倍数" width="80" align="center">
              <template slot-scope="scope">
                <span class="multiple-tag">x{{ scope.row.multiple }}</span>
              </template>
            </el-table-column>
            <el-table-column label="积分总数" width="120" align="center">
              <template slot-scope="scope">
                <span class="total-text">{{ scope.row.total }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ReviewAuditDialog',
  data() {
    return {
      visible: false,
      currentRow: null,
      ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
      prizeOptions: [
        { id: 1, name: 'LEOBOG GM5无线品', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        { id: 2, name: '毛绒玩具熊', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        { id: 3, name: '精美钥匙扣套装', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
        { id: 4, name: '限定手办', image: 'https://img.yzcdn.cn/vant/cat.jpeg' },
      ],
      auditForm: {
        auditResult: 'pass',
        prizeType: 'physical',
        prizeList: [],
        rejectReason: '',
      },
    };
  },
  computed: {
    coinMultiple() {
      return this.currentRow?.coinMultiple || 1;
    },
    pointsFormList() {
      return [{
        quantity: 0,
        multiple: this.coinMultiple,
        total: 0,
      }];
    },
  },
  methods: {
    open(row) {
      this.currentRow = row;
      this.visible = true;
      this.ruleImageUrl = row.ruleImageUrl || 'https://img.yzcdn.cn/vant/cat.jpeg';
      this.resetForm(row);
      this.$nextTick(() => {
        if (this.$refs.reviewVideoPlayer) {
          this.$refs.reviewVideoPlayer.load();
        }
      });
    },
    resetForm(row) {
      let initPrizeList = [];
      if (row?.prizeList && row.prizeList.length > 0) {
        initPrizeList = JSON.parse(JSON.stringify(row.prizeList));
      } else {
        initPrizeList = [
          {
            prizeId: 1,
            prizeName: 'LEOBOG GM5无线品',
            quantity: 1,
            multiple: this.coinMultiple,
            total: this.coinMultiple,
          },
          {
            prizeId: '',
            prizeName: '',
            quantity: 1,
            multiple: this.coinMultiple,
            total: this.coinMultiple,
          },
        ];
      }
      this.auditForm = {
        auditResult: 'pass',
        prizeType: 'physical',
        prizeList: initPrizeList,
        rejectReason: '',
      };
    },
    getPrizeImage(prizeId) {
      const prize = this.prizeOptions.find(p => p.id === prizeId);
      return prize?.image || '';
    },
    calculateTotal(row) {
      row.total = row.quantity * row.multiple;
    },
    calculatePointsTotal(row) {
      row.total = row.quantity * row.multiple;
    },
    handleAddPrize() {
      this.auditForm.prizeList.push({
        prizeId: '',
        prizeName: '',
        quantity: 1,
        multiple: this.coinMultiple,
        total: this.coinMultiple,
      });
    },
    handleDeletePrize(index) {
      this.auditForm.prizeList.splice(index, 1);
    },
    handleCancel() {
      this.visible = false;
    },
    handleClosed() {
      if (this.$refs.reviewVideoPlayer) {
        this.$refs.reviewVideoPlayer.pause();
        this.$refs.reviewVideoPlayer.currentTime = 0;
      }
      this.currentRow = null;
    },
    handleConfirm() {
      if (this.auditForm.auditResult === 'pass') {
        if (this.auditForm.prizeType === 'physical') {
          const hasInvalidPrize = this.auditForm.prizeList.some(item => !item.prizeId);
          if (hasInvalidPrize) {
            this.$message.warning('请选择完整的奖品信息');
            return;
          }
        }
      } else {
        if (!this.auditForm.rejectReason || this.auditForm.rejectReason.trim() === '') {
          this.$message.warning('请填写驳回原因');
          return;
        }
      }
      this.submitAudit();
    },
    submitAudit() {
      const result = {
        id: this.currentRow.id,
        auditResult: this.auditForm.auditResult,
        prizeType: this.auditForm.prizeType,
        prizeList: this.auditForm.auditResult === 'pass' ? this.auditForm.prizeList : [],
        rejectReason: this.auditForm.auditResult === 'reject' ? this.auditForm.rejectReason : '',
      };
      this.$message.success(this.auditForm.auditResult === 'pass' ? '审核通过成功' : '已驳回审核');
      this.$emit('success', result);
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.review-audit-dialog {
  ::v-deep .el-dialog__body {
    padding: 16px;
    max-height: 75vh;
    overflow-y: auto;
    background: #f5f7fa;
  }

  ::v-deep .el-dialog__header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #ebeef5;
  }

  ::v-deep .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.audit-content {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-icon {
  font-size: 16px;
  color: #409eff;
}

.card-title {
  font-size: 14px;
  color: #303133;
}

.info-card,
.status-card,
.prize-card {
  margin-bottom: 12px;
  border-radius: 6px;

  &:last-child {
    margin-bottom: 0;
  }
}

.rule-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.media-row {
  display: flex;
  gap: 12px;
}

.media-item {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;

  &.video-item {
    background: #000;
  }
}

.media-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.review-video {
  width: 100%;
  height: 220px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  color: #909399;
  font-size: 14px;
  gap: 8px;

  i {
    font-size: 24px;
  }
}

.audit-status-section {
  padding: 8px 0;
}

.audit-radio-group {
  display: flex;
  gap: 24px;
}

.audit-radio {
  display: flex;
  align-items: center;

  &.pass {
    ::v-deep .el-radio__input.is-checked .el-radio__inner {
      border-color: #67c23a;
      background: #67c23a;
    }
  }

  &.reject {
    ::v-deep .el-radio__input.is-checked .el-radio__inner {
      border-color: #f56c6c;
      background: #f56c6c;
    }
  }

  .radio-text {
    font-size: 14px;
    color: #303133;
    margin-left: 6px;
  }
}

.reject-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;

  .reject-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    display: block;
    margin-bottom: 8px;
  }

  .reject-textarea {
    width: 100%;
  }
}

.prize-type-section {
  margin-bottom: 16px;
}

.prize-type-group {
  display: flex;
  gap: 24px;
}

.prize-radio {
  display: flex;
  align-items: center;

  .radio-text {
    font-size: 14px;
    color: #303133;
    margin-left: 6px;
  }
}

.multiple-tip {
  background: #ecf5ff;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;

  i {
    color: #409eff;
    font-size: 14px;
  }
}

.prize-table-wrapper {
  margin-bottom: 12px;
}

.prize-table {
  ::v-deep .el-table__header-wrapper th {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 12px;
  }

  ::v-deep .el-table__body-wrapper td {
    font-size: 13px;
    color: #303133;
  }
}

.prize-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prize-thumb {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.prize-detail {
  flex: 1;
  min-width: 0;
}

.prize-name {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prize-id {
  font-size: 12px;
  color: #909399;
}

.text-gray {
  color: #909399;
  font-size: 13px;
}

.multiple-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.total-text {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.prize-actions {
  margin-top: 14px;
}

.delete-icon {
  font-size: 18px;
  color: #f56c6c;
  cursor: pointer;

  &:hover {
    color: #f78989;
  }
}

.points-form {
  margin-top: 14px;
}
</style>
