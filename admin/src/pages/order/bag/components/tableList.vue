<template>
  <div class="bag-list-page">
    <el-tabs v-model="activeStatusTab" class="status-tabs" @tab-click="handleStatusTabClick">
      <el-tab-pane v-for="tab in statusTabList" :key="tab.value" :name="tab.value">
        <span slot="label">{{ tab.label }} <span class="tab-count">{{ statusCounts[tab.value] || 0 }}</span></span>
      </el-tab-pane>
    </el-tabs>

    <div class="table-head">
      <div class="table-title">背包管理</div>
      <div class="table-actions">
        <el-button v-db-click @click="exportList">导出</el-button>
        <el-button type="primary" v-db-click @click="showAddDialog = true">添加</el-button>
      </div>
    </div>

    <el-table :data="bagList" ref="table" v-loading="loading" empty-text="暂无数据" class="bag-table">
      <el-table-column label="ID" width="80" prop="id" />
      <el-table-column label="用户信息" min-width="190">
        <template slot-scope="scope">
          <div class="user-cell">
            <el-avatar :size="38" :src="scope.row.userAvatar">
              {{ scope.row.userNickname ? scope.row.userNickname.charAt(0) : 'U' }}
            </el-avatar>
            <div class="cell-lines">
              <div class="primary-text">{{ scope.row.userNickname || '-' }}</div>
              <div class="sub-text">{{ scope.row.userNo || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="奖品信息" min-width="300">
        <template slot-scope="scope">
          <div class="prize-cell">
            <img class="prize-img" :src="scope.row.prizeImage || defaultImg" alt="" />
            <div class="cell-lines prize-lines">
              <div class="primary-text prize-name">{{ scope.row.prizeName }}</div>
              <div class="sub-text">商品ID：{{ scope.row.productId }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="商品分类" min-width="170" prop="category" />
      <el-table-column label="商户信息" min-width="180">
        <template slot-scope="scope">
          <div class="merchant-cell">
            <el-avatar :size="36" :src="scope.row.merchantAvatar">
              {{ scope.row.merchantName ? scope.row.merchantName.charAt(0) : '商' }}
            </el-avatar>
            <div class="cell-lines">
              <div class="primary-text">{{ scope.row.merchantName || '-' }}</div>
              <div class="sub-text">商户ID：{{ scope.row.merchantId || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="房间信息" min-width="160">
        <template slot-scope="scope">
          <div class="room-cell" v-if="scope.row.roomName">
            <div class="avatar-dot small">{{ scope.row.roomIcon }}</div>
            <div class="cell-lines">
              <div class="primary-text">{{ scope.row.roomName }}</div>
              <div class="sub-text">房间号：{{ scope.row.roomNo }}</div>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="110">
        <template slot-scope="scope">{{ getSourceText(scope.row.source) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="mini" effect="plain">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="已兑积分" width="100">
        <template slot-scope="scope">
          <span>{{ ['exchanged', 'expired_exchange', 'arrived'].includes(scope.row.status) ? scope.row.exchangePoints : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="获得时间" width="150">
        <template slot-scope="scope">
          <div>{{ splitTime(scope.row.obtainTime).date }}</div>
          <div>{{ splitTime(scope.row.obtainTime).time }}</div>
        </template>
      </el-table-column>
      <el-table-column label="兑换时间" width="140">
        <template slot-scope="scope">
          <template v-if="scope.row.exchangeTime">
            <div>{{ splitTime(scope.row.exchangeTime).date }}</div>
            <div>{{ splitTime(scope.row.exchangeTime).time }}</div>
          </template>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" width="150">
        <template slot-scope="scope">
          <div>{{ splitTime(scope.row.expireTime).date }}</div>
          <div>{{ splitTime(scope.row.expireTime).time }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="190">
        <template slot-scope="scope">
          <a v-db-click @click="showDetail(scope.row)">详情</a>
          <template v-if="scope.row.status === 'apply_shipping' && canViewShippingOrder(scope.row)">
            <el-divider direction="vertical" />
            <a v-db-click @click="viewShippingOrder(scope.row)">查看发货单</a>
          </template>
          <template v-else-if="scope.row.status === 'apply_shipping'">
            <el-divider direction="vertical" />
            <a class="danger-link" v-db-click @click="openRejectDialog(scope.row)">驳回</a>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="acea-row row-right page">
      <pagination v-if="total" :total="total" :page.sync="page.page" :limit.sync="page.limit" @pagination="getList" />
    </div>

    <el-drawer title="背包详情" :visible.sync="detailVisible" direction="rtl" size="820px" custom-class="bag-detail-drawer">
      <div v-if="detailData" class="detail-drawer-body">
        <div class="detail-summary-card">
          <div>
            <div class="detail-id">背包ID：{{ detailData.id }}</div>
            <div class="detail-title">{{ detailData.prizeName }}</div>
          </div>
          <div class="detail-summary-right">
            <el-tag :type="getStatusTagType(detailData.status)" size="small">{{ getStatusText(detailData.status) }}</el-tag>
            <span class="points-info">已兑积分：{{ ['exchanged', 'expired_exchange', 'arrived'].includes(detailData.status) ? detailData.exchangePoints : '-' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">主体信息</div>
          <div class="detail-card-grid">
            <div class="detail-card user-detail-card">
              <el-avatar :size="42" :src="detailData.userAvatar">{{ detailData.userNickname ? detailData.userNickname.charAt(0) : 'U' }}</el-avatar>
              <div class="cell-lines">
                <div class="primary-text">{{ detailData.userNickname }}</div>
                <div class="sub-text">{{ detailData.userNo }} / UID：{{ detailData.uid }}</div>
                <div class="sub-text">{{ detailData.phone }}</div>
              </div>
            </div>
            <div class="detail-card user-detail-card">
              <el-avatar :size="42" :src="detailData.merchantAvatar">{{ detailData.merchantName ? detailData.merchantName.charAt(0) : 'M' }}</el-avatar>
              <div class="cell-lines">
                <div class="primary-text">{{ detailData.merchantName || '-' }}</div>
                <div class="sub-text">商户ID：{{ detailData.merchantId || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">奖品与来源</div>
          <div class="detail-card prize-detail-card">
            <img class="detail-prize-img" :src="detailData.prizeImage || defaultImg" alt="" />
            <div class="cell-lines">
              <div class="primary-text prize-name">{{ detailData.prizeName }}</div>
              <div class="sub-text">商品ID：{{ detailData.productId }} ｜ {{ detailData.category }}</div>
            </div>
          </div>
          <div class="detail-info-grid detail-info-panel">
            <div class="detail-info-item"><span>来源：</span>{{ getSourceText(detailData.source) }}</div>
            <div class="detail-info-item"><span>来源单号：</span>{{ detailData.sourceNo || '-' }}</div>
            <div class="detail-info-item"><span>房间：</span>{{ detailData.roomName || '-' }}<template v-if="detailData.roomNo">（{{ detailData.roomNo }}）</template></div>
            <div class="detail-info-item"><span>派奖原因：</span>{{ getDispatchReasonText(detailData.dispatchReason) }}</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">状态与时间</div>
          <div class="detail-info-grid detail-info-panel">
            <div class="detail-info-item"><span>状态：</span>{{ getStatusText(detailData.status) }}</div>
            <div class="detail-info-item"><span>获得时间：</span>{{ detailData.obtainTime }}</div>
            <div class="detail-info-item"><span>兑换时间：</span>{{ detailData.exchangeTime || '-' }}</div>
            <div class="detail-info-item"><span>过期时间：</span>{{ detailData.expireTime || '-' }}</div>
            <div class="detail-info-item"><span>已兑积分：</span>{{ ['exchanged', 'expired_exchange', 'arrived'].includes(detailData.status) ? detailData.exchangePoints : '-' }}</div>
            <div class="detail-info-item" v-if="detailData.rejectReason"><span>驳回原因：</span>{{ detailData.rejectReason }}</div>
          </div>
        </div>

        <div class="detail-section" v-if="hasShippingInfo(detailData)">
          <div class="section-title">发货履约</div>
          <div class="detail-info-grid detail-info-panel fulfillment-panel">
            <div class="detail-info-item"><span>申请时间：</span>{{ detailData.shippingApplyTime || '-' }}</div>
            <div class="detail-info-item"><span>发货状态：</span>{{ getShippingStatusText(detailData.shippingStatus) }}</div>
            <div class="detail-info-item"><span>发货单号：</span>{{ detailData.shippingOrderNo || '-' }}</div>
            <div class="detail-info-item"><span>发货时间：</span>{{ detailData.shippedTime || '-' }}</div>
            <div class="detail-info-item"><span>物流公司：</span>{{ detailData.logisticsCompany || '-' }}</div>
            <div class="detail-info-item"><span>快递单号：</span>{{ detailData.trackingNo || '-' }}</div>
            <div class="detail-info-item detail-info-wide"><span>收货信息：</span>{{ detailData.receiverInfo || '-' }}</div>
          </div>
        </div>

        <div class="detail-section" v-if="hasGiftInfo(detailData)">
          <div class="section-title">赠送信息</div>
          <div class="gift-flow-card detail-info-panel">
            <div class="detail-info-grid gift-info-grid">
              <div class="detail-info-item">
                <span>受赠人信息：</span>
                <div class="gift-recipient-info">
                  <el-avatar :size="34" :src="detailData.giftToAvatar">{{ detailData.giftToName ? detailData.giftToName.charAt(0) : '赠' }}</el-avatar>
                  <span>{{ getGiftTargetText(detailData) }}</span>
                </div>
              </div>
              <div class="detail-info-item"><span>赠送时间：</span>{{ detailData.giftTime || '-' }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">操作记录</div>
          <el-timeline class="operation-timeline">
            <el-timeline-item v-for="(item, index) in detailData.operationRecords" :key="index" :timestamp="item.time">{{ item.description }}</el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="驳回发货申请" :visible.sync="rejectDialogVisible" width="460px" @closed="resetRejectForm">
      <el-form :model="rejectForm" label-width="86px">
        <el-form-item label="驳回原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" maxlength="120" show-word-limit placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer-center">
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReject">确认驳回</el-button>
      </div>
    </el-dialog>

    <el-dialog title="派发奖品" :visible.sync="showAddDialog" width="520px" custom-class="bag-dispatch-dialog" @closed="resetDispatchForm">
      <el-form :model="dispatchForm" label-width="86px" class="dispatch-form">
        <el-form-item label="用户" required>
          <div class="dispatch-select-box">
            <el-button icon="el-icon-plus" v-db-click @click="selectUser">{{ dispatchForm.user || '选择用户' }}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="房间">
          <div class="dispatch-select-box">
            <el-button icon="el-icon-plus" v-db-click @click="selectRoom">{{ dispatchForm.room || '选择房间' }}</el-button>
            <span class="optional-tip">可选，按派奖来源决定是否关联房间</span>
          </div>
        </el-form-item>
        <el-form-item label="奖品" required>
          <div class="dispatch-prize-box">
            <div class="dispatch-prize-head">奖品</div>
            <button type="button" class="choose-prize-btn" @click="selectPrize">{{ dispatchForm.prize || '选择奖品' }}</button>
          </div>
        </el-form-item>
        <el-form-item label="派发原因" required>
          <el-select v-model="dispatchForm.reason" placeholder="请选择派发原因" class="dispatch-reason-select">
            <el-option v-for="item in dispatchReasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer-center">
        <el-button class="footer-btn" @click="showAddDialog = false">取消</el-button>
        <el-button class="footer-btn" type="primary" v-db-click @click="submitDispatch">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const statusOptions = [
  { value: 'stored', label: '寄存中' },
  { value: 'apply_shipping', label: '已申请发货' },
  { value: 'exchanged', label: '已兑换积分' },
  { value: 'expired_exchange', label: '过期兑换' },
  { value: 'arrived', label: '已加入账户' },
  { value: 'gifted', label: '已赠送' },
];

const sourceOptions = [
  { value: 'system', label: '系统发放' },
  { value: 'points', label: '积分兑换' },
];

const dispatchReasonOptions = [
  { value: 'service_compensation', label: '客服补偿' },
  { value: 'activity_reward', label: '活动奖励' },
  { value: 'manual_reissue', label: '人工补货' },
  { value: 'test_dispatch', label: '测试派发' },
];

const mockRows = [
  {
    "id": "93018",
    "userNo": "USR-73001",
    "userNickname": "雾眠",
    "phone": "139****4201",
    "uid": "71001",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "星空转盘房",
    "roomNo": "r-sky-01",
    "prizeName": "草莓熊夜灯",
    "productId": "sku-901",
    "category": "潮玩周边/灯具",
    "merchantName": "云舟潮玩馆",
    "merchantId": "m301",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "stored",
    "source": "system",
    "sourceNo": "抓取记录ID：GRAB-873901",
    "shippingOrderNo": "",
    "exchangePoints": 0,
    "obtainTime": "2026-06-29 10:12:31",
    "exchangeTime": "",
    "expireTime": "2026-08-13 10:12:31",
    "dispatchReason": "activity_reward"
  },
  {
    "id": "93017",
    "userNo": "USR-73002",
    "userNickname": "山栀",
    "phone": "138****7712",
    "uid": "71002",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "",
    "roomNo": "",
    "prizeName": "迷你积木花束",
    "productId": "sku-905",
    "category": "潮玩周边/积木",
    "merchantName": "拾光积分铺",
    "merchantId": "m302",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "stored",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606290017",
    "shippingOrderNo": "",
    "exchangePoints": 0,
    "obtainTime": "2026-06-29 09:40:18",
    "exchangeTime": "",
    "expireTime": "2026-07-29 09:40:18"
  },
  {
    "id": "93016",
    "userNo": "USR-73003",
    "userNickname": "鲸落",
    "phone": "137****6050",
    "uid": "71003",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "九号幸运屋",
    "roomNo": "r-luck-09",
    "prizeName": "星球杯盲盒套装",
    "productId": "sku-902",
    "category": "盲盒/套装",
    "merchantName": "云舟潮玩馆",
    "merchantId": "m301",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "apply_shipping",
    "source": "system",
    "sourceNo": "抽奖记录：LOT-202606290901",
    "shippingOrderNo": "",
    "exchangePoints": 0,
    "obtainTime": "2026-06-28 20:05:11",
    "exchangeTime": "",
    "expireTime": "2026-08-12 20:05:11",
    "shippingApplyTime": "2026-06-29 08:30:00",
    "shippingStatus": "pending",
    "shippingAuditStatus": "pending",
    "receiverInfo": "周鲸 13700006050 上海市徐汇区漕溪北路66号",
    "dispatchReason": "test_dispatch"
  },
  {
    "id": "93015",
    "userNo": "USR-73004",
    "userNickname": "白露",
    "phone": "136****8820",
    "uid": "71004",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "十八号体验台",
    "roomNo": "r-tech-18",
    "prizeName": "蓝牙复古音箱",
    "productId": "sku-903",
    "category": "数码生活/音箱",
    "merchantName": "北辰活动中心",
    "merchantId": "m303",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "apply_shipping",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606280315",
    "shippingOrderNo": "FH202606280315",
    "exchangePoints": 0,
    "obtainTime": "2026-06-28 13:55:45",
    "exchangeTime": "",
    "expireTime": "2026-08-12 13:55:45",
    "shippingApplyTime": "2026-06-28 15:18:20",
    "shippingStatus": "shipped",
    "shippingAuditStatus": "approved",
    "shippedTime": "2026-06-28 17:42:36",
    "logisticsCompany": "顺丰速运",
    "trackingNo": "SF134928765001",
    "receiverInfo": "林白露 13600008820 广东省广州市天河区体育西路88号"
  },
  {
    "id": "93014",
    "userNo": "USR-73005",
    "userNickname": "青岚",
    "phone": "135****3391",
    "uid": "71005",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "潮玩快闪间",
    "roomNo": "r-pop-26",
    "prizeName": "草莓熊夜灯",
    "productId": "sku-901",
    "category": "潮玩周边/灯具",
    "merchantName": "拾光积分铺",
    "merchantId": "m302",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "exchanged",
    "source": "system",
    "sourceNo": "口令记录：CODE-QL260",
    "shippingOrderNo": "",
    "exchangePoints": 260,
    "obtainTime": "2026-06-27 18:22:09",
    "exchangeTime": "2026-06-27 18:30:00",
    "expireTime": "",
    "dispatchReason": "service_compensation"
  },
  {
    "id": "93013",
    "userNo": "USR-73006",
    "userNickname": "小满",
    "phone": "134****1108",
    "uid": "71006",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "",
    "roomNo": "",
    "prizeName": "星球杯盲盒套装",
    "productId": "sku-902",
    "category": "盲盒/套装",
    "merchantName": "拾光积分铺",
    "merchantId": "m302",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "exchanged",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606270520",
    "shippingOrderNo": "",
    "exchangePoints": 520,
    "obtainTime": "2026-06-27 09:16:34",
    "exchangeTime": "2026-06-27 09:22:10",
    "expireTime": ""
  },
  {
    "id": "93012",
    "userNo": "USR-73007",
    "userNickname": "叶舟",
    "phone": "133****7120",
    "uid": "71007",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "星空转盘房",
    "roomNo": "r-sky-01",
    "prizeName": "蓝牙复古音箱",
    "productId": "sku-903",
    "category": "数码生活/音箱",
    "merchantName": "蓝盒补偿专营",
    "merchantId": "m304",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "expired_exchange",
    "source": "system",
    "sourceNo": "抓取记录ID：GRAB-873012",
    "shippingOrderNo": "",
    "exchangePoints": 130,
    "obtainTime": "2026-06-20 11:08:22",
    "exchangeTime": "2026-06-25 11:08:22",
    "expireTime": "2026-06-25 11:08:22",
    "dispatchReason": "manual_reissue"
  },
  {
    "id": "93011",
    "userNo": "USR-73008",
    "userNickname": "南乔",
    "phone": "132****6655",
    "uid": "71008",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "",
    "roomNo": "",
    "prizeName": "限定徽章礼盒",
    "productId": "sku-904",
    "category": "周边配件/徽章",
    "merchantName": "拾光积分铺",
    "merchantId": "m302",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "arrived",
    "source": "points",
    "sourceNo": "积分订单号：JFDD202606260070",
    "shippingOrderNo": "",
    "exchangePoints": 70,
    "obtainTime": "2026-06-26 16:45:30",
    "exchangeTime": "2026-06-26 16:48:00",
    "expireTime": ""
  },
  {
    "id": "93010",
    "userNo": "USR-73009",
    "userNickname": "折竹",
    "phone": "131****9088",
    "uid": "71009",
    "userAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "roomName": "十八号体验台",
    "roomNo": "r-tech-18",
    "prizeName": "限定徽章礼盒",
    "productId": "sku-904",
    "category": "周边配件/徽章",
    "merchantName": "北辰活动中心",
    "merchantId": "m303",
    "merchantAvatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "status": "gifted",
    "giftTime": "2026-06-25 15:00:00",
    "giftToUid": "72019",
    "giftToUserNo": "USR-82019",
    "giftToName": "晴川",
    "giftToPhone": "158****2190",
    "giftMessage": "生日礼物转赠",
    "source": "system",
    "sourceNo": "抽奖记录：LOT-202606250418",
    "shippingOrderNo": "",
    "exchangePoints": 0,
    "obtainTime": "2026-06-25 14:18:00",
    "exchangeTime": "",
    "expireTime": "2026-08-09 14:18:00",
    "dispatchReason": "activity_reward"
  }
];

const defaultFilters = () => ({
  keyword: '',
  field_key: 'all',
  room_id: '',
  prize_id: '',
  category: '',
  data: '',
  date_range: [],
});

export default {
  name: 'bag_table_list',
  data() {
    return {
      defaultImg: require('@/assets/images/noPictrue.png'),
      statusOptions,
      dispatchReasonOptions,
      activeStatusTab: 'all',
      allData: this.createMockData(),
      bagList: [],
      filters: defaultFilters(),
      loading: false,
      total: 0,
      page: {
        page: 1,
        limit: 10,
      },
      detailVisible: false,
      detailData: null,
      rejectDialogVisible: false,
      rejectTarget: null,
      rejectForm: {
        reason: '',
      },
      showAddDialog: false,
      dispatchForm: {
        user: '',
        room: '',
        prize: '',
        reason: '',
      },
    };
  },
  computed: {
    statusTabList() {
      return [{ value: 'all', label: '全部' }, ...this.statusOptions];
    },
    statusCounts() {
      const counts = { all: 0 };
      this.statusOptions.forEach(item => {
        counts[item.value] = 0;
      });
      this.getBaseFilteredData().forEach(item => {
        counts.all += 1;
        if (counts[item.status] !== undefined) counts[item.status] += 1;
      });
      return counts;
    },
  },
  mounted() {
    this.getList({ page: 1, filters: defaultFilters() });
  },
  methods: {
    createMockData() {
      return mockRows.map((row, index) => ({
        ...row,
        userAvatar: row.userAvatar || '',
        roomIcon: ['•', '◦', '∗'][index % 3],
        prizeImage: row.prizeImage || '',
        operationRecords: row.operationRecords || this.createOperationRecords(row),
      }));
    },
    createOperationRecords(row) {
      const records = [{ time: row.obtainTime, description: `${this.getSourceText(row.source)}获得奖品` }];
      if (row.shippingApplyTime) records.push({ time: row.shippingApplyTime, description: '用户申请发货' });
      if (row.shippingOrderNo) records.push({ time: row.shippingApplyTime || row.obtainTime, description: `生成发货单 ${row.shippingOrderNo}` });
      if (row.exchangeTime) records.push({ time: row.exchangeTime, description: this.getStatusText(row.status) });
      return records;
    },
    handleStatusTabClick() {
      this.page.page = 1;
      this.getList();
    },
    getList(params) {
      if (params && params.filters) {
        this.filters = { ...defaultFilters(), ...params.filters };
      }
      if (params === 1 || (params && params.page === 1)) {
        this.page.page = 1;
      }
      this.loading = true;
      window.setTimeout(() => {
        const filtered = this.getFilteredData();
        this.total = filtered.length;
        const start = (this.page.page - 1) * this.page.limit;
        this.bagList = filtered.slice(start, start + this.page.limit);
        this.loading = false;
      }, 160);
    },
    getBaseFilteredData() {
      return this.allData.filter(item => {
        return this.matchKeyword(item) &&
          (!this.filters.room_id || item.roomNo === this.filters.room_id || item.roomName === this.filters.room_id) &&
          (!this.filters.prize_id || item.productId === this.filters.prize_id) &&
          (!this.filters.category || item.category === this.filters.category) &&
          this.matchDateRange(item.obtainTime);
      });
    },
    getFilteredData() {
      return this.getBaseFilteredData().filter(item => this.activeStatusTab === 'all' || item.status === this.activeStatusTab);
    },
    matchKeyword(item) {
      const keyword = (this.filters.keyword || '').trim().toLowerCase();
      if (!keyword) return true;
      const values = {
        uid: item.uid,
        user_no: item.userNo,
        phone: item.phone,
        nickname: item.userNickname,
      };
      if (this.filters.field_key === 'all') {
        return Object.values(values).some(value => String(value).toLowerCase().includes(keyword));
      }
      return String(values[this.filters.field_key] || '').toLowerCase().includes(keyword);
    },
    matchDateRange(time) {
      const range = this.filters.date_range || [];
      if (!range.length) return true;
      const date = time.slice(0, 10);
      return date >= range[0] && date <= range[1];
    },
    splitTime(value) {
      if (!value) return { date: '-', time: '' };
      const parts = value.split(' ');
      return { date: parts[0], time: parts[1] || '' };
    },
    getStatusText(status) {
      const found = statusOptions.find(item => item.value === status);
      return found ? found.label : status;
    },
    getStatusTagType(status) {
      const map = {
        stored: 'info',
        apply_shipping: 'warning',
        exchanged: 'success',
        expired_exchange: 'danger',
        arrived: 'success',
        gifted: 'info',
      };
      return map[status] || 'info';
    },
    getSourceText(source) {
      const found = sourceOptions.find(item => item.value === source);
      return found ? found.label : source;
    },
    getDispatchReasonText(reason) {
      const found = dispatchReasonOptions.find(item => item.value === reason);
      return found ? found.label : '-';
    },
    getShippingStatusText(status) {
      const map = {
        pending: '待发货',
        shipped: '已发货',
        received: '已签收',
      };
      return map[status] || '-';
    },
    showDetail(row) {
      this.detailData = { ...row };
      this.detailVisible = true;
    },
    canViewShippingOrder(row) {
      return ['shipped', 'delivered'].includes(row.shippingStatus) || !!row.trackingNo || !!row.shippedTime || !!row.logisticsCompany;
    },
    viewShippingOrder(row) {
      this.$message.info(`查看发货单：${row.shippingOrderNo || '-'}`);
    },
    hasShippingInfo(row) {
      return !!(row.shippingApplyTime || row.shippingOrderNo || row.logisticsCompany || row.trackingNo || row.shippedTime || row.receiverInfo);
    },
    hasGiftInfo(row) {
      return row.status === 'gifted' || !!row.giftTime || !!row.giftToUid || !!row.giftToUserNo;
    },
    getGiftTargetText(row) {
      const name = row.giftToName || '-';
      const no = row.giftToUserNo || '-';
      const uid = row.giftToUid || '-';
      return `${name}（${no} / UID：${uid}）`;
    },
    openRejectDialog(row) {
      this.rejectTarget = row;
      this.rejectForm.reason = '';
      this.rejectDialogVisible = true;
    },
    resetRejectForm() {
      this.rejectTarget = null;
      this.rejectForm.reason = '';
    },
    submitReject() {
      if (!this.rejectForm.reason.trim()) {
        this.$message.error('请填写驳回原因');
        return;
      }
      if (this.rejectTarget) {
        this.rejectTarget.rejectReason = this.rejectForm.reason.trim();
        this.rejectTarget.status = 'stored';
        this.rejectTarget.shippingStatus = '';
        this.rejectTarget.shippingAuditStatus = 'rejected';
        this.rejectTarget.operationRecords = [
          ...(this.rejectTarget.operationRecords || []),
          { time: this.formatNow(), description: `驳回发货申请：${this.rejectTarget.rejectReason}` },
        ];
      }
      this.rejectDialogVisible = false;
      this.$message.success('已驳回');
      this.getList();
    },
    formatNow() {
      const pad = value => String(value).padStart(2, '0');
      const date = new Date();
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    exportList() {
      this.$message.success('导出成功');
    },
    resetDispatchForm() {
      this.dispatchForm = { user: '', room: '', prize: '', reason: '' };
    },
    selectUser() {
      this.dispatchForm.user = '雾眠（USR-73001）';
    },
    selectRoom() {
      this.dispatchForm.room = '星空转盘房';
    },
    selectPrize() {
      this.dispatchForm.prize = '草莓熊夜灯';
    },
    submitDispatch() {
      if (!this.dispatchForm.user) return this.$message.error('请选择用户');
      if (!this.dispatchForm.prize) return this.$message.error('请选择奖品');
      if (!this.dispatchForm.reason) return this.$message.error('请选择派发原因');
      this.$message.success('派发成功');
      this.showAddDialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.status-tabs {
  padding-top: 8px;
}

::v-deep .status-tabs .el-tabs__header {
  margin-bottom: 0;
}

.tab-count {
  margin-left: 4px;
  color: #909399;
  font-weight: normal;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}

.table-title {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.bag-table {
  width: 100%;
  font-size: 13px;
}

::v-deep .bag-table th {
  background: #f5f7fa;
  color: #303133;
  font-weight: 500;
}

::v-deep .bag-table td,
::v-deep .bag-table th {
  padding: 14px 0;
}

.user-cell,
.room-cell,
.merchant-cell,
.prize-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.user-cell .el-avatar,
.merchant-cell .el-avatar,
.user-detail-card .el-avatar {
  flex: 0 0 auto;
  margin-right: 10px;
  background: #409eff;
}

.avatar-dot {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3c1a68;
  font-weight: 700;
  background: radial-gradient(circle at 30% 20%, #f3ddff 0, #d9a8ff 42%, #8a48ef 100%);
}

.avatar-dot.small {
  width: 40px;
  height: 40px;
  flex-basis: 40px;
}

.prize-img,
.detail-prize-img {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  margin-right: 12px;
  border-radius: 4px;
  object-fit: cover;
  background: #f3f5f8;
}

.cell-lines {
  min-width: 0;
  line-height: 20px;
}

.primary-text {
  color: #303133;
  word-break: break-all;
}

.prize-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sub-text,
.optional-tip {
  color: #909399;
  font-size: 12px;
}

.danger-link {
  color: #ff4d4f;
}

.page {
  padding-top: 16px;
}

::v-deep .bag-dispatch-dialog {
  border-radius: 4px;
}

::v-deep .bag-dispatch-dialog .el-dialog__title {
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

::v-deep .bag-dispatch-dialog .el-dialog__body {
  padding: 8px 48px 0 42px;
}

.dispatch-form ::v-deep .el-form-item {
  margin-bottom: 18px;
}

.dispatch-select-box {
  min-height: 64px;
  padding: 16px;
  border-radius: 6px;
  background: #f5f7fa;
  box-sizing: border-box;
}

.dispatch-select-box .el-button {
  min-width: 106px;
  height: 32px;
  padding: 0 14px;
}

.dispatch-prize-box {
  min-height: 128px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.dispatch-prize-head {
  height: 40px;
  padding-left: 12px;
  line-height: 40px;
  background: #f5f7fa;
  color: #303133;
}

.choose-prize-btn {
  margin: 38px 0 0 14px;
  border: 0;
  background: transparent;
  color: #1677ff;
  font-size: 14px;
  cursor: pointer;
}

.dispatch-reason-select {
  width: 100%;
}

.dialog-footer-center {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 16px;
}

.footer-btn {
  width: 96px;
  height: 40px;
}

::v-deep .bag-detail-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 18px 24px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  font-weight: 500;
}

.detail-drawer-body {
  padding: 22px 28px 32px;
}

.detail-summary-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.detail-id {
  margin-bottom: 6px;
  color: #909399;
  font-size: 12px;
}

.detail-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-summary-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.points-info {
  color: #e6a23c;
  font-weight: 600;
}

.detail-section {
  & + .detail-section {
    margin-top: 20px;
  }
}

.section-title {
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  color: #303133;
  font-weight: 500;
}

.detail-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-card {
  display: flex;
  align-items: center;
  min-height: 68px;
  padding: 10px 16px;
  border-radius: 2px;
  background: #fafafa;
  box-sizing: border-box;
}

.detail-info-panel {
  margin-top: 12px;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.fulfillment-panel {
  background: #fbfdff;
}

.gift-flow-card {
  display: block;
}

.gift-target-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 4px;
  background: #f5f7fa;
}

.gift-info-grid {
  padding-top: 4px;
}

.gift-recipient-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  row-gap: 12px;
}

.detail-info-item {
  min-width: 0;
  color: #303133;
  line-height: 20px;
}

.detail-info-item span {
  color: #606266;
}

.detail-info-wide {
  grid-column: 1 / -1;
}

.operation-timeline {
  padding: 4px 0 0 4px;
}
</style>