<template>
  <el-dialog
    :visible.sync="visible"
    title="截图审核"
    width="900px"
    :close-on-click-modal="false"
    center
    class="review-audit-dialog"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="audit-content">
      <!-- ========== 多媒体展示区：规则图 + 视频 双栏对比 ========== -->
      <div class="media-compare-section">
        <div class="section-title">规则对比</div>
        <div class="media-compare-wrapper">
          <!-- 左侧：游戏规则图 -->
          <div class="media-col">
            <div class="media-col-header">
              <i class="el-icon-document"></i>
              <span>游戏规则图</span>
            </div>
            <div class="media-card rule-card">
              <img :src="ruleImageUrl" class="media-img" alt="游戏规则图" />
            </div>
          </div>

          <!-- VS 分隔符 -->
          <div class="vs-divider">
            <span>VS</span>
          </div>

          <!-- 右侧：用户抓取回放视频 -->
          <div class="media-col">
            <div class="media-col-header">
              <i class="el-icon-video-camera"></i>
              <span>抓取回放视频</span>
            </div>
            <div class="media-card video-card">
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
                <i class="el-icon-video-pause"></i>
                <span>暂无视频</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-divider></el-divider>

      <!-- ========== 审核操作区 ========== -->
      <div class="audit-section">
        <div class="section-title">审核操作</div>

        <!-- 审核状态 -->
        <div class="audit-status-row">
          <span class="status-label">
            审核状态：
            <annotation-point
              title="【优化】审核二次确认机制"
              content="优化前：点确定可能直接通过并发奖，无二次确认，容易误操作。&#10;&#10;优化后：审核通过和驳回答都增加二次确认弹窗：&#10;· 通过时弹窗：'将通过审核，将发放X件奖品给该用户，是否确认？'&#10;· 驳回时弹窗：'驳回审核，用户权益将不发放，驳回原因：xxx，是否确认？'&#10;&#10;原因：防止误审通过造成奖品损失，防止误驳回影响用户体验，增加操作安全性和审核严谨性。"
              priority="P0"
            />
          </span>
          <el-radio-group v-model="auditForm.auditResult">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </div>

        <!-- 驳回原因（仅驳回时显示） -->
        <div v-if="auditForm.auditResult === 'reject'" class="reject-reason-section">
          <span class="reason-label">驳回原因：</span>
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因"
            class="reject-reason-input"
          ></el-input>
        </div>

        <!-- 奖品类型与配置（仅通过时显示） -->
        <div v-if="auditForm.auditResult === 'pass'">
          <el-form-item label="奖品类型" label-width="100px" class="audit-form-item">
            <el-radio-group v-model="auditForm.prizeType">
              <el-radio label="physical">实物奖品</el-radio>
              <el-radio label="points">积分</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 礼品倍数说明 -->
          <div class="multiple-tip">
            <i class="el-icon-info"></i>
            <span>礼品倍数说明：根据投币倍数或玩法规则计算最终奖品数量</span>
            <annotation-point
              title="【优化】礼品倍数说明"
              content="优化前：表格有礼品倍数，但对审核员不够直观，不清楚倍数含义和计算方式。&#10;&#10;优化后：在奖品配置表格上方增加'礼品倍数说明'提示，明确说明：根据投币倍数或玩法规则计算最终奖品数量。&#10;&#10;原因：让审核员更清晰理解礼品倍数的含义和计算逻辑，减少审核误操作，提升审核准确性和效率。"
              priority="P0"
            />
          </div>

          <!-- 动态奖品配置表格 -->
          <div class="prize-table-wrapper">
            <el-table :data="auditForm.prizeList" border size="small">
              <!-- 选择奖品 -->
              <el-table-column label="选择奖品" min-width="200">
                <template slot-scope="scope">
                  <el-select
                    v-model="scope.row.prizeId"
                    placeholder="选择奖品"
                    clearable
                    size="small"
                    @change="handlePrizeChange(scope.row)"
                  >
                    <el-option
                      v-for="prize in prizeOptions"
                      :key="prize.id"
                      :label="prize.name"
                      :value="prize.id"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>

              <!-- 数量 -->
              <el-table-column label="数量" width="120">
                <template slot-scope="scope">
                  <el-input-number
                    v-model="scope.row.quantity"
                    :min="1"
                    :max="999"
                    size="small"
                    @change="calculateTotal(scope.row)"
                  ></el-input-number>
                </template>
              </el-table-column>

              <!-- 礼品倍数（只读） -->
              <el-table-column label="礼品倍数" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="small" type="info">{{ scope.row.multiple }}x</el-tag>
                </template>
              </el-table-column>

              <!-- 礼品总数（计算结果，只读） -->
              <el-table-column label="礼品总数" width="100" align="center">
                <template slot-scope="scope">
                  <span class="total-num">{{ scope.row.total }}</span>
                </template>
              </el-table-column>

              <!-- 操作：删除 -->
              <el-table-column label="操作" width="70" align="center">
                <template slot-scope="scope">
                  <i
                    class="el-icon-delete delete-icon"
                    @click="handleDeletePrize(scope.$index)"
                    v-if="auditForm.prizeList.length > 1"
                  ></i>
                </template>
              </el-table-column>
            </el-table>

            <!-- 添加奖品项按钮 -->
            <div class="add-prize-row">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddPrize">
                添加奖品项
              </el-button>
            </div>
          </div>

          <!-- 奖品汇总 -->
          <div class="prize-summary">
            <span class="summary-label">预计发放：</span>
            <span class="summary-value">{{ totalPrizeText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮：取消、确定 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'ReviewAuditDialog',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      visible: false,
      currentRow: null,

      // 游戏规则图URL
      ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',

      // 奖品选项
      prizeOptions: [
        { id: 1, name: '毛绒玩具熊', stock: 100 },
        { id: 2, name: '精美礼品一份', stock: 50 },
        { id: 3, name: '钥匙扣', stock: 200 },
        { id: 4, name: '定制周边大礼包', stock: 30 },
        { id: 5, name: '纪念徽章', stock: 150 },
      ],

      // 审核表单数据
      auditForm: {
        auditResult: 'pass',
        prizeType: 'physical',
        prizeList: [],
        rejectReason: '',
      },
    };
  },
  computed: {
    // 投币倍数
    coinMultiple() {
      return this.currentRow?.coinMultiple || 1;
    },

    // 奖品总数文本
    totalPrizeText() {
      if (this.auditForm.auditResult !== 'pass') return '-';
      const totalItems = this.auditForm.prizeList.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      if (this.auditForm.prizeType === 'points') {
        return `${totalItems} 积分`;
      }
      return `${totalItems} 件奖品`;
    },
  },
  methods: {
    /**
     * 打开审核弹窗
     * @param {Object} row 当前行数据
     */
    open(row) {
      this.currentRow = row;
      this.visible = true;
      this.resetForm(row);

      // 设置规则图（根据房间/玩法不同可切换）
      this.ruleImageUrl = row.ruleImageUrl || 'https://img.yzcdn.cn/vant/cat.jpeg';

      // 弹窗打开后视频可以手动播放
      this.$nextTick(() => {
        if (this.$refs.reviewVideoPlayer) {
          this.$refs.reviewVideoPlayer.load();
        }
      });
    },

    /**
     * 重置表单
     * @param {Object} row 当前行数据
     */
    resetForm(row) {
      // 如果原有奖品数据则复用，否则初始化2条预设数据
      let initPrizeList = [];
      if (row?.prizeList && row.prizeList.length > 0) {
        initPrizeList = JSON.parse(JSON.stringify(row.prizeList));
      } else {
        // 预设2条数据以展示效果
        initPrizeList = [
          {
            prizeId: 1,
            prizeName: '毛绒玩具熊',
            quantity: 1,
            multiple: this.coinMultiple,
            total: this.coinMultiple,
          },
          {
            prizeId: 3,
            prizeName: '钥匙扣',
            quantity: 2,
            multiple: this.coinMultiple,
            total: 2 * this.coinMultiple,
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

    /**
     * 奖品选择变化
     * @param {Object} row 当前行
     */
    handlePrizeChange(row) {
      const prize = this.prizeOptions.find((p) => p.id === row.prizeId);
      if (prize) {
        row.prizeName = prize.name;
      } else {
        row.prizeName = '';
      }
    },

    /**
     * 计算礼品总数
     * @param {Object} row 当前行
     */
    calculateTotal(row) {
      row.total = row.quantity * row.multiple;
    },

    /**
     * 添加奖品项
     */
    handleAddPrize() {
      const newItem = {
        prizeId: '',
        prizeName: '',
        quantity: 1,
        multiple: this.coinMultiple,
        total: this.coinMultiple,
      };
      this.auditForm.prizeList.push(newItem);
    },

    /**
     * 删除奖品项
     * @param {Number} index 索引
     */
    handleDeletePrize(index) {
      this.auditForm.prizeList.splice(index, 1);
    },

    /**
     * 取消
     */
    handleCancel() {
      this.visible = false;
    },

    /**
     * 弹窗关闭后清理
     */
    handleClosed() {
      // 停止视频播放
      if (this.$refs.reviewVideoPlayer) {
        this.$refs.reviewVideoPlayer.pause();
        this.$refs.reviewVideoPlayer.currentTime = 0;
      }
      this.currentRow = null;
    },

    /**
     * 确定提交 - 触发二次确认
     */
    handleConfirm() {
      // 通过时校验奖品信息完整性
      if (this.auditForm.auditResult === 'pass') {
        const hasInvalidPrize = this.auditForm.prizeList.some((item) => !item.prizeId);
        if (hasInvalidPrize) {
          this.$message.warning('请选择完整的奖品信息');
          return;
        }
        if (this.auditForm.prizeList.length === 0) {
          this.$message.warning('请至少添加一项奖品');
          return;
        }
      }

      // 驳回时校验驳回原因
      if (this.auditForm.auditResult === 'reject') {
        if (!this.auditForm.rejectReason || this.auditForm.rejectReason.trim() === '') {
          this.$message.warning('请填写驳回原因');
          return;
        }
      }

      // ===== 二次确认防误触机制 =====
      if (this.auditForm.auditResult === 'pass') {
        // 通过的二次确认
        const totalText = this.totalPrizeText;
        this.$confirm(
          `将通过审核，将发放 ${totalText}给该用户，是否确认？`,
          '审核确认',
          {
            confirmButtonText: '确认通过',
            cancelButtonText: '取消',
            type: 'success',
            distinguishCancelAndClose: true,
          }
        )
          .then(() => {
            this.submitAudit();
          })
          .catch((action) => {
            if (action === 'cancel') {
              // 用户取消，不做处理
            }
          });
      } else {
        // 驳回的二次确认
        this.$confirm(
          `驳回审核，用户权益将不发放，驳回原因：${this.auditForm.rejectReason}，是否确认？`,
          '审核确认',
          {
            confirmButtonText: '确认驳回',
            cancelButtonText: '取消',
            type: 'warning',
            distinguishCancelAndClose: true,
          }
        )
          .then(() => {
            this.submitAudit();
          })
          .catch((action) => {
            if (action === 'cancel') {
              // 用户取消，不做处理
            }
          });
      }
    },

    /**
     * 提交审核结果
     */
    submitAudit() {
      const result = {
        id: this.currentRow.id,
        auditResult: this.auditForm.auditResult,
        prizeType: this.auditForm.prizeType,
        prizeList: this.auditForm.auditResult === 'pass' ? this.auditForm.prizeList : [],
        rejectReason: this.auditForm.auditResult === 'reject' ? this.auditForm.rejectReason : '',
      };

      this.$message.success(
        this.auditForm.auditResult === 'pass' ? '审核通过成功' : '已驳回审核'
      );
      this.$emit('success', result);
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.review-audit-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 10px;
    max-height: 75vh;
    overflow-y: auto;
  }
}

.audit-content {
  padding: 0 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

/* ========== 多媒体对比区域 ========== */
.media-compare-section {
  margin-bottom: 10px;
}

.media-compare-wrapper {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.media-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.media-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;

  i {
    color: #409eff;
  }
}

.media-card {
  flex: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #ebeef5;
  background: #f5f7fa;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;

  .media-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.rule-card {
    border-color: #e1f3d8;
  }

  &.video-card {
    border-color: #d9ecff;
    background: #000;
  }
}

.review-video {
  width: 100%;
  max-height: 250px;
  background: #000;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #909399;
  font-size: 14px;

  i {
    font-size: 36px;
  }
}

/* VS 分隔符 */
.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* ========== 审核操作区 ========== */
.audit-section {
  margin-top: 10px;
}

.audit-form-item {
  margin-bottom: 20px;
}

.audit-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .status-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}

.reject-reason-section {
  margin-bottom: 20px;
  padding-left: 66px;

  .reason-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    display: block;
    margin-bottom: 8px;
  }

  .reject-reason-input {
    width: 100%;
    max-width: 400px;
  }
}

.multiple-tip {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #909399;

  i {
    color: #409eff;
    margin-top: 2px;
  }
}

.prize-table-wrapper {
  margin-bottom: 16px;
}

.add-prize-row {
  margin-top: 12px;
  text-align: left;
}

.delete-icon {
  font-size: 18px;
  color: #f56c6c;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #f78989;
  }
}

.total-num {
  font-weight: 600;
  color: #409eff;
}

.prize-summary {
  background: #ecf5ff;
  border-radius: 4px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  .summary-label {
    font-size: 14px;
    color: #606266;
  }

  .summary-value {
    font-size: 16px;
    font-weight: 600;
    color: #409eff;
  }
}
</style>
