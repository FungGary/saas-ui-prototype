<template>
  <div class="room-detail-drawer-wrap">
    <el-drawer
      :visible.sync="drawerVisible"
      direction="rtl"
      size="900px"
      :with-header="false"
      :wrapper-closable="true"
      custom-class="room-detail-drawer-custom"
      @closed="onClosed"
    >
      <div class="room-detail-container">
        <!-- 顶部固定概览区（卡片式） -->
        <div id="detail-header" class="drawer-header">
          <div class="header-card">
            <div class="header-content">
              <!-- 左侧：圆形头像/封面图 -->
              <div class="header-left">
                <el-avatar :size="64" :src="roomDetail.coverImage" shape="circle" />
              </div>

              <!-- 右侧：房间号 + 核心开关 -->
              <div class="header-right">
                <div class="room-title-row">
                  <span class="room-no">房间号：{{ roomDetail.roomNo }}</span>
                  <el-tag :type="roomDetail.isShow ? 'success' : 'info'" size="medium" class="status-tag">
                    {{ roomDetail.isShow ? '显示中' : '已隐藏' }}
                  </el-tag>
                </div>
                <div class="room-name">{{ roomDetail.roomName }}</div>
              </div>
            </div>
            <!-- 右上角关闭按钮 -->
            <div class="header-close" @click="close">
              <i class="el-icon-close"></i>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="drawer-body">
          <el-tabs v-model="activeTab">
            <!-- Tab 1: 基础信息 -->
            <el-tab-pane label="基础信息" name="basic">
              <div id="detail-info-groups" class="tab-content-scroll">
                <!-- 基础信息组 -->
                <div class="info-section">
                  <div class="section-title">
                    基础信息
                    <annotation-point
                      title="【优化】详情信息分组展示"
                      content="优化前：详情信息平铺展示，无分组，查找特定信息困难。&#10;&#10;优化后：详情信息按类型分组展示：基础信息、操作/参数配置、功能开关、房间属性。&#10;&#10;原因：分组展示提升信息层次感和可读性，让运营快速定位和理解房间配置的各个维度。"
                      priority="P0"
                    />
                  </div>
                  <el-descriptions :column="3" border :colon="false" class="custom-descriptions">
                    <el-descriptions-item label="房间号">{{ roomDetail.roomNo }}</el-descriptions-item>
                    <el-descriptions-item label="商户绑定">{{ roomDetail.merchantBind }}</el-descriptions-item>
                    <el-descriptions-item label="机台绑定">{{ roomDetail.machineBind }}</el-descriptions-item>
                    <el-descriptions-item label="玩法类型">{{ roomDetail.playTypeName }}</el-descriptions-item>
                    <el-descriptions-item label="房间功能">
                      <el-tag v-for="feat in roomFeatureList" :key="feat" type="primary" size="mini" class="feature-tag">
                        {{ feat }}
                      </el-tag>
                      <annotation-point
                        title="【优化】房间功能字段说明"
                        content="房间功能用于标识房间支持的玩法特性：&#10;· 直出：直接掉落商品&#10;· 即得：即时获得奖品&#10;· 刮板：刮开覆盖层获取结果&#10;· 转盘：旋转转盘抽取奖励&#10;· 截图：用户可截图分享&#10;&#10;不同的功能组合可实现多种有趣的抓娃娃玩法，提升用户互动体验。"
                        priority="P1"
                      />
                    </el-descriptions-item>
                    <el-descriptions-item label="房间公告">{{ roomDetail.roomNotice || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="房间规则图" :span="3">
                      <el-image
                        v-if="roomDetail.ruleImage"
                        :src="roomDetail.ruleImage"
                        :preview-src-list="[roomDetail.ruleImage]"
                        fit="cover"
                        style="width: 80px; height: 80px; border-radius: 4px;"
                      />
                      <span v-else class="empty-text">暂无图片</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="房间礼品详情" :span="3">
                      <div class="rich-text-preview">{{ roomDetail.giftDetail || '直出玩法不填会自动展示商品' }}</div>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 操作/参数配置组 -->
                <div class="info-section">
                  <div class="section-title">操作/参数配置</div>
                  <el-descriptions :column="3" border :colon="false" class="custom-descriptions">
                    <el-descriptions-item label="游戏币">{{ roomDetail.gameCoins }} 币</el-descriptions-item>
                    <el-descriptions-item label="游戏时间">{{ roomDetail.gameTime }} 秒</el-descriptions-item>
                    <el-descriptions-item label="投币时间">{{ roomDetail.coinTime }} 秒</el-descriptions-item>
                    <el-descriptions-item label="等待结果时间">{{ roomDetail.waitResultTime }} 秒</el-descriptions-item>
                    <el-descriptions-item label="结果超时时间">{{ roomDetail.timeoutTime }} 秒</el-descriptions-item>
                    <el-descriptions-item label="充值等待时间">{{ roomDetail.rechargeWaitTime }} 秒</el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 功能开关组 -->
                <div class="info-section">
                  <div class="section-title">功能开关</div>
                  <el-descriptions :column="2" border :colon="false" class="custom-descriptions">
                    <el-descriptions-item label="是否有摇杆">
                      <el-tag :type="roomDetail.hasJoystick ? 'success' : 'info'" size="small">
                        {{ roomDetail.hasJoystick ? '开启' : '关闭' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="是否有二收">
                      <el-tag :type="roomDetail.hasSecondary ? 'success' : 'info'" size="small">
                        {{ roomDetail.hasSecondary ? '开启' : '关闭' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="是否开启保送">
                      <el-tag :type="roomDetail.hasFreePass ? 'success' : 'info'" size="small">
                        {{ roomDetail.hasFreePass ? '开启' : '关闭' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="保送局数">{{ roomDetail.freePassRounds }} 局</el-descriptions-item>
                    <el-descriptions-item label="是否开启房间客服">
                      <el-tag :type="roomDetail.hasCustomerService ? 'success' : 'info'" size="small">
                        {{ roomDetail.hasCustomerService ? '开启' : '关闭' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="是否开启复位呼叫">
                      <el-tag :type="roomDetail.hasResetCall ? 'success' : 'info'" size="small">
                        {{ roomDetail.hasResetCall ? '开启' : '关闭' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="复位间隔局数">{{ roomDetail.resetCallRounds }} 局</el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 房间属性组 -->
                <div class="info-section">
                  <div class="section-title">房间属性</div>
                  <el-descriptions :column="3" border :colon="false" class="custom-descriptions">
                    <el-descriptions-item label="玩法分类">{{ roomDetail.playCategoryName }}</el-descriptions-item>
                    <el-descriptions-item label="房间分类">{{ roomDetail.roomCategoryName }}</el-descriptions-item>
                    <el-descriptions-item label="房间标签">{{ roomDetail.roomTag || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="房间排序">{{ roomDetail.roomSort }}</el-descriptions-item>
                    <el-descriptions-item label="是否在平台显示">
                      <el-tag :type="roomDetail.isShowOnPlatform ? 'success' : 'info'" size="small">
                        {{ roomDetail.isShowOnPlatform ? '是' : '否' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="是否在首页显示">
                      <el-tag :type="roomDetail.showOnHome ? 'success' : 'info'" size="small">
                        {{ roomDetail.showOnHome ? '是' : '否' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="手动热门">
                      <el-tag :type="roomDetail.isManualHot ? 'danger' : 'info'" size="small">
                        {{ roomDetail.isManualHot ? '热门' : '普通' }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 2: 操作日志 -->
            <el-tab-pane id="detail-operation-log" name="log">
              <span slot="label">
                操作日志
                <annotation-point
                  title="【新增】操作日志Tab"
                  content="优化前：详情抽屉无操作日志功能，无法追溯房间的操作历史。&#10;&#10;优化后：新增'操作日志'Tab，记录房间的所有操作历史，包括操作时间、操作人、操作类型、操作详情。&#10;&#10;原因：满足运营管理需求，支持操作审计和问题追溯，提升平台管理的规范性和透明度。"
                  priority="P0"
                />
              </span>
              <div class="tab-content-scroll">
                <el-table :data="operationLogList" stripe v-loading="logLoading" class="log-table">
                  <el-table-column label="操作时间" prop="time" min-width="160"></el-table-column>
                  <el-table-column label="操作人" prop="operator" min-width="100"></el-table-column>
                  <el-table-column label="操作类型" min-width="120">
                    <template slot-scope="scope">
                      <el-tag :type="getLogTypeTag(scope.row.type)" size="small">
                        {{ scope.row.typeName }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作详情" prop="detail" min-width="260"></el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import AnnotationPoint from '@/components/AnnotationPoint';

const DEFAULT_DETAIL = {
  // 基础信息
  roomNo: '1',
  roomName: '一号抓娃娃房',
  coverImage: 'https://img.yzcdn.cn/vant/cat.jpeg',
  merchantBind: '上海娃娃机运营公司',
  machineBind: 'SEGA 抓娃娃机 (001)',
  playType: 'gameplay',
  playTypeName: '玩法台',
  roomFeature: ['direct', 'scraper'],
  ruleImage: 'https://img.yzcdn.cn/vant/cat.jpeg',
  roomNotice: '新人专享，福利多多',
  giftDetail: '精美公仔娃娃等你来拿！',

  // 操作/参数配置
  gameCoins: 99,
  gameTime: 30,
  coinTime: 30,
  waitResultTime: 10,
  timeoutTime: 15,
  rechargeWaitTime: 60,

  // 功能开关
  hasJoystick: true,
  hasSecondary: false,
  hasFreePass: true,
  freePassRounds: 5,
  hasCustomerService: true,
  hasResetCall: false,
  resetCallRounds: 3,

  // 房间属性
  playCategory: 'gameplay',
  playCategoryName: '玩法台',
  roomCategory: 'gameplay',
  roomCategoryName: '玩法台',
  roomTag: '热门',
  roomSort: 100,
  isShowOnPlatform: true,
  showOnHome: true,
  isManualHot: true,

  // 顶部核心开关
  isShow: true,
};

const DEFAULT_LOGS = [
  {
    time: '2026-06-23 14:30:25',
    operator: '张三',
    type: 'config',
    typeName: '修改配置',
    detail: '将游戏币从 89 改为 99，游戏时间从 25秒 改为 30秒',
  },
  {
    time: '2026-06-22 10:15:08',
    operator: '李四',
    type: 'attribute',
    typeName: '修改属性',
    detail: '将房间分类从"刮板台"修改为"玩法台"',
  },
  {
    time: '2026-06-20 09:00:12',
    operator: '王五',
    type: 'status',
    typeName: '上下架',
    detail: '将房间上架到首页热门推荐',
  },
];

export default {
  name: 'RoomDetailDrawer',
  components: {
    AnnotationPoint,
  },
  data() {
    return {
      // 抽屉内部状态（与项目其它详情组件保持一致）
      drawerVisible: false,
      activeTab: 'basic',
      logLoading: false,
      roomDetail: { ...DEFAULT_DETAIL },
      operationLogList: [...DEFAULT_LOGS],
    };
  },
  computed: {
    /**
     * 房间功能列表（多选）
     */
    roomFeatureList() {
      const map = {
        direct: '直出',
        instant: '即得',
        scraper: '刮板',
        wheel: '转盘',
        screenshot: '截图',
      };
      const feature = this.roomDetail.roomFeature;
      if (!feature) return [];
      const featureArr = Array.isArray(feature) ? feature : [feature];
      return featureArr.map(f => map[f] || f);
    },
  },
  methods: {
    /**
     * 打开抽屉（父组件通过 $refs 调用）
     */
    open(row) {
      // 合并传入数据（深拷贝避免外部引用污染）
      const data = row ? JSON.parse(JSON.stringify(row)) : {};
      // 安全处理房间功能
      let featureArr = [];
      if (Array.isArray(data.roomFeature)) {
        featureArr = data.roomFeature;
      } else if (typeof data.roomFeature === 'string' && data.roomFeature) {
        featureArr = data.roomFeature.split(/[,，、\s]+/).filter(Boolean);
      } else if (data.roomFeature) {
        featureArr = [data.roomFeature];
      }
      this.roomDetail = {
        ...DEFAULT_DETAIL,
        ...data,
        roomFeature: featureArr,
      };
      this.drawerVisible = true;
    },
    /**
     * 关闭抽屉
     */
    close() {
      this.drawerVisible = false;
    },
    /**
     * 抽屉完全关闭后重置 Tab
     */
    onClosed() {
      this.activeTab = 'basic';
    },
    /**
     * 获取操作日志类型tag样式
     */
    getLogTypeTag(type) {
      const map = {
        config: '',
        attribute: 'success',
        status: 'warning',
      };
      return map[type] || 'info';
    },
  },
};
</script>

<style lang="scss" scoped>
/* 让 Element UI 抽屉 body 充满整个抽屉 */
::v-deep .room-detail-drawer-custom {
  .el-drawer__body {
    height: 100%;
    padding: 0;
    overflow: hidden;
  }
}

/* 抽屉容器 */
.room-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部固定概览区 */
.drawer-header {
  padding: 16px 20px;
  background: #f5f7fa;
  flex-shrink: 0;
}

.header-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.header-left {
  flex-shrink: 0;
}

.header-right {
  flex: 1;
  min-width: 0;
}

.room-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.room-no {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  font-weight: 500;
}

.room-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.header-close {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;

  i {
    font-size: 18px;
    color: #909399;
  }

  &:hover {
    background: #f5f7fa;

    i {
      color: #409eff;
    }
  }
}

/* 抽屉主体 */
.drawer-body {
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.drawer-body ::v-deep .el-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  border-radius: 8px;
  padding: 0 20px;
  height: 100%;

  .el-tabs__header {
    margin: 0;
  }

  .el-tabs__content {
    flex: 1;
    overflow: hidden;
  }

  .el-tab-pane {
    height: 100%;
    overflow: hidden;
  }
}

/* 可滚动的Tab内容 */
.tab-content-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 20px 4px;
}

/* 信息分组 */
.info-section {
  margin-bottom: 20px;
  background: #fafbfc;
  border-radius: 6px;
  padding: 16px 20px;
  border: 1px solid #ebeef5;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 14px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

/* el-descriptions 自定义样式 */
.custom-descriptions {
  ::v-deep .el-descriptions__label {
    color: #909399;
    background: #f5f7fa !important;
    font-weight: 500;
    width: 110px;
  }

  ::v-deep .el-descriptions__content {
    color: #303133;
  }
}

.feature-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.empty-text {
  color: #c0c4cc;
  font-size: 13px;
}

.rich-text-preview {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}

/* 操作日志表格 */
.log-table {
  border-radius: 6px;
  overflow: hidden;

  ::v-deep .el-table__header th {
    background: #f5f7fa;
    color: #303133;
    font-weight: 500;
  }
}
</style>
