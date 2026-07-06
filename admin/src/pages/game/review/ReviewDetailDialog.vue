<template>
  <el-drawer
    :visible.sync="visible"
    title="查看详情"
    direction="rtl"
    :size="'760px'"
    :modal-append-to-body="false"
    :wrapper-closable="true"
    class="review-detail-drawer"
    @closed="handleClosed"
  >
    <div v-if="currentRow" class="detail-content">
      <!-- 用户信息 -->
      <el-card :bordered="false" shadow="never" class="detail-card" :body-style="{ padding: '16px 20px' }">
        <div slot="header" class="card-header">
          <i class="el-icon-user card-icon"></i>
          <span class="card-title">用户信息</span>
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

      <!-- 房间信息 -->
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

      <!-- 抓取信息 -->
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
          <div class="media-label">抓取录像/截图：</div>
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

      <!-- 审核信息 -->
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

      <!-- 奖品信息 -->
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
  </el-drawer>
</template>

<script>
export default {
  name: 'ReviewDetailDialog',
  data() {
    return {
      visible: false,
      currentRow: null,
    };
  },
  computed: {
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
    totalPrizeCount() {
      if (!this.currentRow?.prizeList) return 0;
      return this.currentRow.prizeList.reduce((sum, item) => sum + (item.total || 0), 0);
    },
  },
  methods: {
    open(row) {
      this.currentRow = row;
      this.visible = true;
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '未通过',
        dismissed: '已驳回',
      };
      return statusMap[status] || status;
    },
    getGrabStatusText(status) {
      const statusMap = {
        grabbing: '抓取中',
        finished: '已结束',
        timeout: '超时',
      };
      return statusMap[status] || status;
    },
    getPrizeTypeText(type) {
      const typeMap = {
        physical: '实物奖品',
        points: '积分',
        coupon: '优惠券',
      };
      return typeMap[type] || '—';
    },
    handleMediaClick(media) {
      if (media.type === 'video' && media.videoUrl) {
        this.$nextTick(() => {
          this.$videoPlayback({
            url: media.videoUrl,
          });
        });
      } else {
        this.$imagePreview({
          images: this.mediaList.map((m) => m.thumbnail),
          index: 0,
        });
      }
    },
    handleClosed() {
      this.currentRow = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.review-detail-drawer {
  ::v-deep .el-drawer__header {
    margin-bottom: 0;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-weight: 600;
  }
}

.detail-content {
  padding: 18px 20px 24px;
  background: #f5f7fa;
  min-height: 100%;
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
</style>
