<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    center
    class="video-playback-dialog"
    custom-class="video-playback-custom"
    @closed="handleClosed"
  >
    <!-- 纯视频播放区域，无任何审核按钮 -->
    <div class="video-container">
      <div class="video-wrapper">
        <video
          v-if="videoUrl"
          ref="videoPlayer"
          :src="videoUrl"
          controls
          class="video-player"
          preload="metadata"
        >
          您的浏览器不支持视频播放
        </video>
        <div v-else class="video-placeholder">
          <i class="el-icon-video-camera video-placeholder-icon"></i>
          <p class="video-placeholder-text">暂无视频</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'VideoPlaybackDialog',
  data() {
    return {
      visible: false,
      videoUrl: '',
      // 玩法组合名称
      gamePlayName: '',
      // 用户昵称
      userName: '',
    };
  },
  computed: {
    // 弹窗标题：玩法+用户昵称的抓取回放
    dialogTitle() {
      if (this.gamePlayName && this.userName) {
        return `${this.gamePlayName}+${this.userName}的抓取回放`;
      }
      return '抓取回放';
    },
  },
  methods: {
    /**
     * 打开视频回放弹窗
     * @param {Object} row 当前行数据
     */
    open(row) {
      this.videoUrl = row.videoUrl || '';
      this.gamePlayName = row.gamePlayName || '抓取回放';
      this.userName = row.userName || row.userPhone || '';
      this.visible = true;

      // 弹窗打开后自动播放
      this.$nextTick(() => {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.play().catch(() => {
            // 自动播放被浏览器阻止时静默处理
          });
        }
      });
    },

    /**
     * 弹窗关闭后清理
     */
    handleClosed() {
      // 停止视频播放
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause();
        this.$refs.videoPlayer.currentTime = 0;
      }
      this.videoUrl = '';
      this.gamePlayName = '';
      this.userName = '';
    },
  },
};
</script>

<style lang="scss" scoped>
.video-playback-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
    background: #000;
  }

  ::v-deep .el-dialog__header {
    background: #fff;
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
  }
}

.video-container {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
}

.video-wrapper {
  width: 100%;
  max-height: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-player {
  width: 100%;
  max-height: 550px;
  background: #000;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 60px 0;

  .video-placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .video-placeholder-text {
    font-size: 14px;
    margin: 0;
  }
}
</style>
