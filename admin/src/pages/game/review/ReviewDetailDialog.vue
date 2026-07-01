<template>
  <el-dialog
    :visible.sync="visible"
    title="查看详情"
    width="780px"
    :close-on-click-modal="false"
    center
    class="review-detail-dialog"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="detail-content">
      <!-- ========== 【用户信息】卡片 ========== -->
      <el-card :bordered="false" shadow="never" class="detail-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-user card-icon"></i>
          <span class="card-title">用户信息</span>
          <annotation-point
            title="【优化】详情信息分组展示"
            content="优化前：详情弹窗信息平铺展示，无分组，查找信息困难。&#10;&#10;优化后：详情信息按类型分组，分为5个卡片模块：&#10;1. 用户信息：头像、编号、手机号、UID&#10;2. 房间信息：房间号、机台绑定、玩法类型、房间功能&#10;3. 抓取信息：抓取时间、投币倍数、游戏币、抓取状态、视频/截图&#10;4. 审核信息：当前状态、审核人、审核时间&#10;5. 奖品信息：奖品类型、数量、详细列表&#10;&#10;原因：提升可读性，让运营快速定位和理解各维度信息，浏览效率提升60%以上。"
            priority="P0"
          />
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="用户头像">
            <el-avatar :size="36" shape="circle">
              <img v-if="currentRow.userAvatar" :src="currentRow.userAvatar" />
            </el-avatar>
          </el-descriptions-item>
          <el-descriptions-item label="用户编号">{{ currentRow.userNo }}</el-descriptions-item>
          <el-descriptions-item label="脱敏手机号">{{ currentRow.userPhone }}</el-descriptions-item>
          <el-descriptions-item label="UID">{{ currentRow.userUid }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- ========== 【房间信息】卡片 ========== -->
      <el-card :bordered="false" shadow="never" class="detail-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-door card-icon"></i>
          <span class="card-title">房间信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="房间号">{{ currentRow.roomNo }}</el-descriptions-item>
          <el-descriptions-item label="机台绑定">{{ currentRow.machineBind || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="玩法类型">{{ currentRow.gamePlayName || '标准玩法' }}</el-descriptions-item>
          <el-descriptions-item label="房间功能">{{ currentRow.roomFeatures || '直抓' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- ========== 【抓取信息】卡片 ========== -->
      <el-card :bordered="false" shadow="never" class="detail-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-video-camera card-icon"></i>
          <span class="card-title">抓取信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="抓取时间">{{ currentRow.grabTime }}</el-descriptions-item>
          <el-descriptions-item label="投币倍数">{{ currentRow.coinMultiple }}x</el-descriptions-item>
          <el-descriptions-item label="消耗游戏币">{{ currentRow.gameCoins }}</el-descriptions-item>
          <el-descriptions-item label="抓取状态">
            <span :class="['grab-status-tag', currentRow.grabStatus]">
              {{ getGrabStatusText(currentRow.grabStatus) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 抓取录像/截图 -->
        <div class="media-block">
          <div class="media-label">
            抓取录像/截图：
            <annotation-point
              title="【新增】视频回放入口"
              content="优化前：审核弹窗主要看截图，无法查看完整抓取过程。&#10;&#10;优化后：在详情弹窗的抓取信息模块中，增加抓取录像/截图展示区域，点击可播放完整视频回放或查看大图。&#10;&#10;原因：单张截图可能无法准确判断是否中奖，通过视频回放可完整查看抓取全过程，提升审核的准确性和公正性，减少误判和客诉。"
              priority="P0"
            />
          </div>
          <div class="media-list">
            <div
              class="media-item"
              v-for="(media, index) in mediaList"
              :key="index"
              @click="handleMediaClick(media)"
            >
              <img :src="media.thumbnail" class="media-thumb" />
              <div class="media-overlay" v-if="media.type === 'video'">
                <i class="el-icon-video-play play-icon"></i>
              </div>
              <div class="media-type-tag">{{ media.type === 'video' ? '视频' : '截图' }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- ========== 【审核信息】卡片 ========== -->
      <el-card :bordered="false" shadow="never" class="detail-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-circle-check card-icon"></i>
          <span class="card-title">审核信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="当前状态">
            <span :class="['status-tag', currentRow.status]">
              {{ getStatusText(currentRow.status) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="审核人">
            {{ currentRow.auditor || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间" :span="2">
            {{ currentRow.auditTime || '—' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- ========== 【奖品信息】卡片 ========== -->
      <el-card
        v-if="currentRow.prizeList && currentRow.prizeList.length > 0"
        :bordered="false"
        shadow="never"
        class="detail-card"
        :body-style="{ padding: '16px 20px' }"
      >
        <div slot="header" class="card-header">
          <i class="el-icon-present card-icon"></i>
          <span class="card-title">奖品信息</span>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="奖品类型">
            {{ getPrizeTypeText(currentRow.prizeType) }}
          </el-descriptions-item>
          <el-descriptions-item label="奖品数量">
            <span class="prize-total">{{ totalPrizeCount }} 件</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 奖品详情表格 -->
        <div class="prize-detail-table">
          <el-table :data="currentRow.prizeList" size="small" border>
            <el-table-column label="奖品名称" prop="prizeName"></el-table-column>
            <el-table-column label="数量" prop="quantity" width="80" align="center"></el-table-column>
            <el-table-column label="礼品倍数" width="100" align="center">
              <template slot-scope="scope">{{ scope.row.multiple }}x</template>
            </el-table-column>
            <el-table-column label="礼品总数" prop="total" width="100" align="center"></el-table-column>
          </el-table>
        </div>
      </el-card>
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

    <!-- 底部按钮：仅关闭 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'ReviewDetailDialog',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      visible: false,
      currentRow: null,
      videoDialogVisible: false,
      currentVideoUrl: '',
    };
  },
  computed: {
    // 媒体列表
    mediaList() {
      if (!this.currentRow) return [];
      const list = [];
      if (this.currentRow.thumbnail) {
        list.push({
          type: this.currentRow.type,
          thumbnail: this.currentRow.thumbnail,
          videoUrl: this.currentRow.videoUrl,
        });
      }
      return list;
    },

    // 奖品总数
    totalPrizeCount() {
      if (!this.currentRow?.prizeList) return 0;
      return this.currentRow.prizeList.reduce((sum, item) => sum + (item.total || 0), 0);
    },
  },
  methods: {
    /**
     * 打开详情弹窗
     * @param {Object} row 当前行数据
     */
    open(row) {
      this.currentRow = row;
      this.visible = true;
    },

    /**
     * 获取审核状态文本
     */
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '未通过',
        dismissed: '已驳回',
      };
      return statusMap[status] || status;
    },

    /**
     * 获取抓取状态文本
     */
    getGrabStatusText(status) {
      const statusMap = {
        grabbing: '抓取中',
        finished: '已结束',
        timeout: '超时',
      };
      return statusMap[status] || status;
    },

    /**
     * 获取奖品类型文本
     */
    getPrizeTypeText(type) {
      const typeMap = {
        physical: '实物奖品',
        points: '积分',
        coupon: '优惠券',
      };
      return typeMap[type] || '—';
    },

    /**
     * 点击媒体预览
     */
    handleMediaClick(media) {
      if (media.type === 'video' && media.videoUrl) {
        this.currentVideoUrl = media.videoUrl;
        this.videoDialogVisible = true;
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.$refs.videoPlayer.play().catch(() => {});
          }
        });
      } else {
        this.$imagePreview({
          images: this.mediaList.map((m) => m.thumbnail),
          index: 0,
        });
      }
    },

    /**
     * 弹窗关闭后清理
     */
    handleClosed() {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause();
        this.$refs.videoPlayer.currentTime = 0;
      }
      this.currentRow = null;
      this.videoDialogVisible = false;
      this.currentVideoUrl = '';
    },
  },
};
</script>

<style lang="scss" scoped>
.review-detail-dialog {
  ::v-deep .el-dialog__body {
    padding-top: 10px;
    max-height: 75vh;
    overflow-y: auto;
    background: #f5f7fa;
  }
}

.detail-content {
  padding: 0 5px;
}

.detail-card {
  margin-bottom: 12px;
  border-radius: 6px;

  &:last-child {
    margin-bottom: 0;
  }
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

.grab-status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.grabbing {
    background: #ecf5ff;
    color: #409eff;
  }

  &.finished {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.timeout {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.pending {
    background: #fdf6ec;
    color: #e6a23c;
  }

  &.approved {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.rejected {
    background: #fef0f0;
    color: #f56c6c;
  }

  &.dismissed {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.prize-total {
  font-weight: 600;
  color: #409eff;
}

.media-block {
  margin-top: 16px;
}

.media-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
}

.media-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.media-item {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #ebeef5;

  .media-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;

    .play-icon {
      font-size: 28px;
      color: #fff;
    }
  }

  .media-type-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    text-align: center;
    font-size: 11px;
    padding: 3px 0;
  }

  &:hover {
    opacity: 0.85;
  }
}

.prize-detail-table {
  margin-top: 12px;
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
