<template>
  <el-dialog
    :visible.sync="visible"
    :title="isAuditMode ? '审核申诉' : '申诉记录详情'"
    width="800px"
    :close-on-click-modal="false"
    center
    class="appeal-detail-dialog"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="detail-content">
      <!-- 头部信息 -->
      <div class="header-info">
        <div class="header-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ currentRow.userUid }}</span>
        </div>
        <div class="header-item">
          <span class="label">用户昵称：</span>
          <span class="value">{{ currentRow.userNickName }}</span>
        </div>
        <div class="header-item">
          <span class="label">申诉单号：</span>
          <span class="value appeal-no">{{ currentRow.appealNo }}</span>
        </div>
      </div>

      <el-divider></el-divider>

      <!-- 游戏记录表格 -->
      <div class="section">
        <div class="section-title">
          <i class="el-icon-video-camera"></i>
          <span>游戏记录</span>
        </div>
        <el-table
          :data="currentRow.gameRecords"
          border
          size="small"
          class="record-table"
          ref="recordTable"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" :selectable="isRecordSelectable"></el-table-column>
          <el-table-column label="记录ID" prop="id" width="100"></el-table-column>
          <el-table-column label="房间号" prop="roomNo" width="100"></el-table-column>
          <el-table-column label="游戏时间" prop="gameTime" width="160"></el-table-column>
          <el-table-column label="回放" width="120">
            <template slot-scope="scope">
              <div v-if="scope.row.playbackUrl" class="playback-btn" @click="handlePlayback(scope.row)">
                <i class="el-icon-video-play"></i>
                <span>回放</span>
              </div>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column label="抓取结果" prop="result" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.result === '成功' ? 'success' : 'danger'">
                {{ scope.row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="消耗游戏币" prop="coins" width="120" align="center">
            <template slot-scope="scope">
              <span class="coins-value">{{ scope.row.coins }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider></el-divider>

      <!-- 申诉理由与凭证 -->
      <div class="section">
        <div class="section-title">
          <i class="el-icon-file-text"></i>
          <span>申诉理由</span>
        </div>
        <div class="appeal-reason">
          <div class="reason-content">{{ currentRow.appealReason }}</div>
        </div>
        <div class="evidence-block" v-if="currentRow.appealEvidence">
          <div class="evidence-label">凭证图片：</div>
          <div class="evidence-preview" @click="previewEvidence">
            <img :src="currentRow.appealEvidence" class="evidence-img" />
          </div>
        </div>
      </div>

      <!-- 补偿流水（仅已处理状态显示） -->
      <div v-if="showCompensateFlow && currentRow.compensateFlows && currentRow.compensateFlows.length > 0" class="section">
        <el-divider></el-divider>
        <div class="section-title" id="appeal-compensate-flow" style="position: relative;">
          <i class="el-icon-trending-up"></i>
          <span>补偿流水</span>
          <annotation-point
            title="【新增】补偿流水"
            content="优化前：当前未明显展示补偿流水。&#10;&#10;优化后：通过申诉后生成游戏币/金币流水，在申诉详情中展示。&#10;&#10;原因：帮助客服判断是否可追溯，便于申诉处理后的资金流向审计和问题复查。"
            priority="P0"
          />
        </div>
        <el-table :data="currentRow.compensateFlows" border size="small" class="flow-table">
          <el-table-column label="流水单号" prop="id" width="180"></el-table-column>
          <el-table-column label="补偿时间" prop="time" width="160"></el-table-column>
          <el-table-column label="补偿金额" prop="amount" width="120" align="center">
            <template slot-scope="scope">
              <span class="compensate-value">{{ scope.row.amount }} 游戏币</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="type" width="120">
            <template slot-scope="scope">
              <el-tag type="success">游戏币</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 驳回原因（仅已驳回状态显示） -->
      <div v-if="currentRow.status === 'rejected' && currentRow.rejectReason" class="section">
        <el-divider></el-divider>
        <div class="section-title">
          <i class="el-icon-alert-circle"></i>
          <span>驳回原因</span>
        </div>
        <div class="reject-reason">
          <div class="reason-content danger">{{ currentRow.rejectReason }}</div>
        </div>
      </div>

      <!-- 审核状态选择（仅待审核状态且审核模式显示） -->
      <div v-if="isAuditMode && currentRow.status === 'pending'" class="section">
        <el-divider></el-divider>
        <div class="section-title">
          <i class="el-icon-check-circle"></i>
          <span>审核操作</span>
        </div>
        <el-form :model="auditForm" ref="auditForm" label-width="100px" class="audit-form">
          <el-form-item label="审核结果" prop="auditResult" :rules="[{ required: true, message: '请选择审核结果' }]">
            <el-radio-group v-model="auditForm.auditResult">
              <el-radio label="pass">通过</el-radio>
              <el-radio label="reject">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="auditForm.auditResult === 'pass'">
            <el-form-item label="是否退币" prop="isRefund">
              <el-radio-group v-model="auditForm.isRefund">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="附带商品" prop="giftProduct">
              <div class="gift-product-selector" @click="openGiftSelector">
                <span v-if="auditForm.giftProduct" class="gift-selected">{{ auditForm.giftProduct.name }}</span>
                <span v-else class="gift-placeholder">选择奖品</span>
                <i class="el-icon-arrow-right arrow-icon"></i>
              </div>
            </el-form-item>
          </template>
          <template v-if="auditForm.auditResult === 'reject'">
            <el-form-item label="驳回原因" prop="rejectReasonType" :rules="[{ required: true, message: '请选择驳回原因' }]">
              <el-select v-model="auditForm.rejectReasonType" placeholder="请选择驳回原因" class="reject-reason-select">
                <el-option
                  v-for="reason in rejectReasonOptions"
                  :key="reason.value"
                  :label="reason.label"
                  :value="reason.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="auditForm.rejectReasonType === 'other'"
              label="详细说明"
              prop="customRejectReason"
              :rules="[{ required: true, message: '请填写详细的驳回原因' }]"
            >
              <el-input
                v-model="auditForm.customRejectReason"
                type="textarea"
                :maxlength="200"
                placeholder="请输入详细的驳回原因..."
                :rows="3"
              ></el-input>
              <div class="char-count">{{ auditForm.customRejectReason.length }}/200</div>
            </el-form-item>
          </template>

          <!-- 底部统计行 -->
          <div v-if="isAuditMode && currentRow.status === 'pending'" class="audit-summary">
            <span class="summary-text">
              共选择 <span class="highlight-num">{{ selectedRecords.length }}</span> 条记录，
              总计 <span class="highlight-num coin">{{ totalSelectedCoins }}</span> 金币
            </span>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 视频预览弹窗 -->
    <el-dialog
      :visible.sync="videoDialogVisible"
      title="视频回放"
      width="700px"
      :close-on-click-modal="false"
      center
      append-to-body
    >
      <div class="video-player-wrap">
        <video
          v-if="currentVideoUrl"
          ref="videoPlayer"
          :src="currentVideoUrl"
          controls
          class="video-player"
        ></video>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="videoDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 选择商品弹窗 -->
    <el-dialog
      :visible.sync="giftSelectDialogVisible"
      title="选择奖品"
      width="500px"
      :close-on-click-modal="false"
      center
      append-to-body
      ref="giftSelectDialog"
      class="gift-select-dialog"
    >
      <div class="gift-list">
        <div
          v-for="item in giftProductOptions"
          :key="item.id"
          :class="['gift-item', auditForm.giftProduct?.id === item.id ? 'selected' : '']"
          @click="handleSelectGift(item)"
        >
          <div class="gift-icon">
            <i class="el-icon-gift"></i>
          </div>
          <div class="gift-info">
            <div class="gift-name">{{ item.name }}</div>
          </div>
          <div v-if="auditForm.giftProduct?.id === item.id" class="gift-check">
            <i class="el-icon-circle-check"></i>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="giftSelectDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-if="isAuditMode && currentRow?.status === 'pending'"
        type="primary"
        @click="handleConfirm"
      >确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'AppealDetailDialog',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      showAnnotation: false,
      activeAnnotationId: null,
      annotations: [],
      visible: false,
      currentRow: null,
      isAuditMode: false,
      videoDialogVisible: false,
      currentVideoUrl: '',

      selectedRecords: [],
      giftSelectDialogVisible: false,
      auditForm: {
        auditResult: 'pass',
        isRefund: true,
        giftProduct: null,
        rejectReasonType: '',
        customRejectReason: '',
      },

      giftProductOptions: [
        { id: 1, name: '小毛绒公仔', value: 'plush_small' },
        { id: 2, name: '中号毛绒公仔', value: 'plush_medium' },
        { id: 3, name: '大毛绒公仔', value: 'plush_large' },
        { id: 4, name: '钥匙扣挂件', value: 'keychain' },
        { id: 5, name: '游戏币礼包', value: 'coin_pack' },
      ],

      rejectReasonOptions: [
        { label: '申诉理由不充分', value: 'insufficient_reason' },
        { label: '凭证图片模糊不清', value: 'blurry_evidence' },
        { label: '证据不足以证明问题', value: 'insufficient_evidence' },
        { label: '重复提交相同申诉', value: 'duplicate_appeal' },
        { label: '不符合申诉规则', value: 'violate_rules' },
        { label: '其他', value: 'other' },
      ],
    };
  },
  computed: {
    showCompensateFlow() {
      return this.currentRow?.status === 'approved';
    },
    totalSelectedCoins() {
      return this.selectedRecords.reduce((sum, item) => sum + (item.coins || 0), 0);
    },
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已驳回',
      };
      return statusMap[status] || status;
    },

    getStatusTagType(status) {
      const typeMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
      };
      return typeMap[status] || 'info';
    },

    open(row, isAuditMode = false) {
      this.currentRow = row;
      this.isAuditMode = isAuditMode;
      this.visible = true;
      this.selectedRecords = [];
      this.auditForm = {
        auditResult: 'pass',
        isRefund: true,
        giftProduct: null,
        rejectReasonType: '',
        customRejectReason: '',
      };
      this.$nextTick(() => {
        if (this.$refs.auditForm) {
          this.$refs.auditForm.clearValidate();
        }
        if (this.$refs.recordTable && row.gameRecords && row.gameRecords.length > 0) {
          this.$refs.recordTable.toggleRowSelection(row.gameRecords[0], true);
        }
      });
    },

    isRecordSelectable() {
      return this.isAuditMode && this.currentRow?.status === 'pending';
    },

    handleSelectionChange(selection) {
      this.selectedRecords = selection;
    },

    openGiftSelector() {
      this.$refs.giftSelectDialog.visible = true;
    },

    handleSelectGift(product) {
      this.auditForm.giftProduct = product;
      this.$refs.giftSelectDialog.visible = false;
    },

    getRejectReasonText(reasonType) {
      const option = this.rejectReasonOptions.find(item => item.value === reasonType);
      return option ? option.label : reasonType;
    },

    handlePlayback(row) {
      if (row.playbackUrl) {
        this.currentVideoUrl = row.playbackUrl;
        this.videoDialogVisible = true;
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.$refs.videoPlayer.play().catch(() => {});
          }
        });
      }
    },

    previewEvidence() {
      this.$imagePreview({
        images: [this.currentRow.appealEvidence],
        index: 0,
      });
    },

    handleCancel() {
      this.visible = false;
    },

    handleConfirm() {
      this.$refs.auditForm.validate((valid) => {
        if (!valid) return;

        if (this.auditForm.auditResult === 'pass') {
          if (this.selectedRecords.length === 0) {
            this.$message.warning('请至少选择一条游戏记录');
            return;
          }
          let confirmText = `将通过审核`;
          if (this.auditForm.isRefund) {
            confirmText += `，退还 ${this.totalSelectedCoins} 金币`;
          }
          if (this.auditForm.giftProduct) {
            confirmText += `，附带商品：${this.auditForm.giftProduct.name}`;
          }
          confirmText += '，是否确认？';
          this.$confirm(confirmText, '审核确认', {
            confirmButtonText: '确认通过',
            cancelButtonText: '取消',
            type: 'success',
          })
            .then(() => {
              this.submitAudit('pass');
            })
            .catch(() => {});
        } else {
          let rejectReason = '';
          if (this.auditForm.rejectReasonType === 'other') {
            rejectReason = this.auditForm.customRejectReason;
          } else {
            rejectReason = this.getRejectReasonText(this.auditForm.rejectReasonType);
          }
          this.$confirm(
            `确认驳回该申诉？\n驳回原因：${rejectReason}`,
            '确认驳回',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )
            .then(() => {
              this.submitAudit('reject', rejectReason);
            })
            .catch(() => {});
        }
      });
    },

    submitAudit(result, rejectReason = '') {
      const data = {
        id: this.currentRow.id,
        auditResult: result,
        isRefund: this.auditForm.isRefund,
        compensateCoins: result === 'pass' && this.auditForm.isRefund ? this.totalSelectedCoins : 0,
        giftProduct: this.auditForm.giftProduct,
        selectedRecordIds: this.selectedRecords.map(item => item.id),
        rejectReason: rejectReason,
        rejectReasonType: this.auditForm.rejectReasonType,
      };
      this.$message.success(result === 'pass' ? '审核通过成功' : '已驳回审核');
      this.$emit('audit-success', data);
      this.visible = false;
    },

    handleClosed() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause();
        this.$refs.videoPlayer.currentTime = 0;
      }
      this.currentRow = null;
      this.isAuditMode = false;
      this.videoDialogVisible = false;
      this.currentVideoUrl = '';
    },

    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleMarkerClick(annotationId) {
      this.activeAnnotationId = annotationId;
      this.bus.$emit('annotationMarkerClick', annotationId);
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
};
</script>

<style lang="scss" scoped>
.appeal-detail-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 10px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.detail-content {
  padding: 0 5px;
}

.header-info {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    font-size: 13px;
    color: #606266;
  }

  .value {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }

  .appeal-no {
    color: #409eff;
  }
}

.section {
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;

  i {
    color: #409eff;
  }
}

.record-table,
.flow-table {
  width: 100%;
}

.playback-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  background: #ecf5ff;
  border-radius: 4px;

  &:hover {
    background: #dbeafe;
  }
}

.text-gray {
  color: #909399;
}

.coins-value {
  font-weight: 600;
  color: #e6a23c;
}

.appeal-reason {
  background: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;

  .reason-content {
    font-size: 14px;
    color: #303133;
    line-height: 1.6;
  }
}

.evidence-block {
  .evidence-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .evidence-preview {
    display: inline-block;
    width: 150px;
    height: 120px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #ebeef5;

    .evidence-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      border-color: #409eff;
    }
  }
}

.compensate-value {
  font-weight: 600;
  color: #67c23a;
}

.reject-reason {
  background: #fef0f0;
  border-radius: 6px;
  padding: 12px 16px;

  .reason-content {
    font-size: 14px;
    color: #f56c6c;
    line-height: 1.6;

    &.danger {
      color: #f56c6c;
    }
  }
}

.audit-form {
  margin-top: 10px;
}

.input-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.reject-reason-select {
  width: 100%;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.gift-product-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  height: 60px;
  padding: 0 16px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .gift-placeholder {
    color: #909399;
    font-size: 14px;
  }

  .gift-selected {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }

  .arrow-icon {
    color: #c0c4cc;
    font-size: 14px;
  }
}

.audit-summary {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;

  .summary-text {
    font-size: 13px;
    color: #606266;
  }

  .highlight-num {
    font-weight: 600;
    color: #f56c6c;

    &.coin {
      color: #e6a23c;
    }
  }
}

.gift-select-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px;
  }
}

.gift-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gift-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }

  &.selected {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .gift-icon {
    width: 40px;
    height: 40px;
    background: #ecf5ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
      font-size: 20px;
      color: #409eff;
    }
  }

  .gift-info {
    flex: 1;
  }

  .gift-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }

  .gift-check {
    i {
      font-size: 20px;
      color: #409eff;
    }
  }
}

.video-player-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-height: 450px;
}
</style>