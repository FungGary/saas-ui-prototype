<template>
  <div class="review-list-page" :class="{ 'annotation-mode': showAnnotation }">
    <!-- 标注面板 -->
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
          @toggle-markers="handleToggleMarkers"
        />
      </div>
    </transition>

    <!-- 标注高亮热区 -->
    <AnnotationHighlight />

    <!-- 顶部筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="80px"
        label-position="right"
        @submit.native.prevent
        inline
      >
        <el-form-item label="用户信息：">
          <entity-picker-input
            v-model="searchForm.userId"
            :display="getReviewUserDisplay(searchForm.userId)"
            placeholder="请选择用户"
            title="用户搜索"
            search-label="用户搜索"
            search-placeholder="请输入昵称/UID/手机号"
            :rows="userOptions"
            :columns="userPickerColumns"
            row-key="id"
            :search-fields="['nickName', 'uid', 'phone']"
          />
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用普通输入或下拉选择，数据量较大时查找效率低，且容易只看到单一字段。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号、手机号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，降低误选并提升筛选效率。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="房间信息：">
          <entity-picker-input
            v-model="searchForm.roomId"
            :display="getReviewRoomDisplay(searchForm.roomId)"
            placeholder="请选择房间"
            title="选择房间"
            search-label="房间搜索"
            search-placeholder="请输入房间号/房间名称"
            :rows="roomOptions"
            :columns="roomPickerColumns"
            row-key="id"
            :search-fields="['roomNo', 'roomName']"
          />
          <annotation-point
            title="【优化】房间信息筛选交互"
            content="优化前：房间信息使用普通输入或下拉选择，房间数量较多时难以快速定位。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开房间选择弹窗，支持按房间号、房间名称等条件检索，选择后回填筛选区。&#10;&#10;原因：房间数据需要同时查看房间号、名称、分类和状态，弹窗表格更适合承载复杂信息。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item label="类型：">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable class="form_content_width">
            <el-option value="" label="全部"></el-option>
            <el-option value="image" label="图片"></el-option>
            <el-option value="video" label="视频"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="抓取状态：" id="filter-grab-status">
          <el-select
            v-model="searchForm.grabStatus"
            placeholder="请选择抓取状态"
            clearable
            class="form_content_width"
          >
            <el-option value="" label="全部"></el-option>
            <el-option value="grabbing" label="抓取中"></el-option>
            <el-option value="finished" label="已结束"></el-option>
            <el-option value="timeout" label="超时"></el-option>
          </el-select>
          <annotation-point
            title="【新增】抓取状态筛选"
            content="优化前：筛选条件只有用户、房间、类型。&#10;&#10;优化后：增加'抓取状态'筛选，选项包括：全部、抓取中、已结束、超时。&#10;&#10;原因：便于运营快速定位不同抓取状态的审核记录，提升审核效率，快速处理待审核和异常记录。"
            priority="P0"
          />
        </el-form-item>
        <el-form-item label="时间：" id="filter-date-range">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="form_content_width"
          ></el-date-picker>
          <annotation-point
            title="【新增】时间范围筛选"
            content="优化前：筛选条件无时间范围筛选。&#10;&#10;优化后：增加'时间'范围筛选，支持选择开始日期和结束日期进行区间筛选。&#10;&#10;原因：支持按时间段快速检索审核记录，便于运营进行数据统计和特定时段的审核处理。"
            priority="P0"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="userSearchs">查询</el-button>
          <el-button class="ResetSearch" @click="reset('searchForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 状态筛选 + 操作栏 + 表格 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <!-- 状态筛选 Tabs -->
      <div style="position: relative;">
        <el-tabs :value="searchForm.status" @tab-click="onClickTab">
          <el-tab-pane
            :label="item.name + ' (' + item.count + ')'"
            :name="item.type"
            v-for="(item, index) in statusTabs"
            :key="index"
          />
        </el-tabs>
      </div>

      <!-- 表格标题 + 操作栏 -->
      <el-row :gutter="24" justify="space-between" class="table-header-row">
        <el-col :span="12">
          <span class="table-title">审核管理</span>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button class="mr10" @click="exportList">导出</el-button>
          <el-button type="primary" @click="batchAudit" :disabled="selectionList.length === 0">批量审核</el-button>
        </el-col>
        <el-col :span="24" class="reviewAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择 <i class="reviewI">{{ selectionList.length }}</i> 项
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <!-- 核心数据表格 -->
      <el-table
        :data="tableData"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        no-filtered-data-text="暂无筛选结果"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <!-- ID -->
        <el-table-column label="ID" prop="id" min-width="60"></el-table-column>

        <!-- 用户信息（复合：头像 + 昵称 + 用户编号） -->
        <el-table-column label="用户信息" min-width="180">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <el-avatar :size="36" shape="circle">
                <img v-if="scope.row.userAvatar" :src="scope.row.userAvatar" />
                <i v-else class="el-icon-user" style="font-size: 18px;"></i>
              </el-avatar>
              <div class="user-info-detail">
                <div class="user-nickname">{{ scope.row.userName }}</div>
                <div class="user-uid">编号：{{ scope.row.userUid }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 房间信息（复合：头像 + 房间号） -->
        <el-table-column label="房间信息" min-width="160">
          <template slot-scope="scope">
            <div class="room-info-cell">
              <el-avatar :size="36" shape="square">
                <img v-if="scope.row.roomCover" :src="scope.row.roomCover" />
                <i v-else class="el-icon-video-camera" style="font-size: 18px;"></i>
              </el-avatar>
              <div class="room-info-detail">
                <div class="room-name">{{ scope.row.roomName }}</div>
                <div class="room-no">{{ scope.row.roomNo }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 游戏币 -->
        <el-table-column label="游戏币" prop="gameCoins" min-width="80"></el-table-column>

        <!-- 投币倍数 -->
        <el-table-column label="投币倍数" min-width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.coinMultiple }}x</span>
          </template>
        </el-table-column>

        <!-- 类型 -->
        <el-table-column label="类型" min-width="70">
          <template slot-scope="scope">
            <span>{{ scope.row.type === 'image' ? '图片' : '视频' }}</span>
          </template>
        </el-table-column>

        <!-- 视频/截图（缩略图） -->
        <el-table-column label="视频/截图" min-width="100">
          <template slot-scope="scope">
            <div class="media-thumb" @click="previewMedia(scope.row)">
              <img :src="scope.row.thumbnail" class="thumb-img" />
              <div class="thumb-overlay" v-if="scope.row.type === 'video'">
                <i class="el-icon-video-play play-icon"></i>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 抓取时间 -->
        <el-table-column label="抓取时间" prop="grabTime" min-width="150"></el-table-column>

        <!-- 审核状态（颜色标签） -->
        <el-table-column label="审核状态" min-width="90">
          <template slot-scope="scope">
            <span :class="['status-tag', scope.row.status]">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>

        <!-- 奖品 -->
        <el-table-column label="奖品" min-width="130">
          <template slot-scope="scope">
            <span v-if="scope.row.prizeName" style="font-size: 12px;">{{ scope.row.prizeName }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <!-- 操作列：详情、审核、回放（仅待审核显示审核按钮） -->
        <el-table-column label="操作" fixed="right" width="180">
          <template slot="header">
            <span>操作</span>
            <annotation-point
              title="【新增】回放入口"
              content="优化前：审核弹窗主要看截图，无机台视频回放入口。&#10;&#10;优化后：操作列增加'回放'按钮，点击可直接播放抓取全过程视频回放。&#10;&#10;原因：单张截图可能无法准确判断是否中奖，通过视频回放可完整查看抓取过程，提升审核准确性和公正性。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <a @click="handleDetail(scope.row)" class="action-link">详情</a>
            <el-divider direction="vertical"></el-divider>
            <template v-if="scope.row.status === 'pending'">
              <a @click="handleAudit(scope.row)" class="action-link">审核</a>
              <el-divider direction="vertical"></el-divider>
            </template>
            <a @click="handlePlayback(scope.row)" class="action-link">回放</a>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部翻页区 -->
      <div class="acea-row row-right page">
        <pagination
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <!-- ===== 查看详情弹窗 ===== -->
    <ReviewDetailDialog ref="reviewDetailDialog" />

    <!-- ===== 截图审核弹窗 ===== -->
    <ReviewAuditDialog
      ref="reviewAuditDialog"
      @success="handleAuditSuccess"
    />

    <!-- ===== 多媒体回放弹窗（纯视频播放器） ===== -->
    <VideoPlaybackDialog ref="videoPlaybackDialog" />
  </div>
</template>

<script>
import ReviewDetailDialog from './ReviewDetailDialog';
import ReviewAuditDialog from './ReviewAuditDialog';
import VideoPlaybackDialog from './VideoPlaybackDialog';
import AnnotationPanel from '@/components/annotation/AnnotationPanel';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight';
import AnnotationPoint from '@/components/AnnotationPoint';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'game_review_list',
  components: {
    EntityPickerInput,
    ReviewDetailDialog,
    ReviewAuditDialog,
    VideoPlaybackDialog,
    AnnotationPanel,
    AnnotationHighlight,
    AnnotationPoint,
  },
  data() {
    return {
      loading: false,
      total: 0,
      selectionList: [],
      selectedIds: [],
      tableData: [],
      allData: [],

      // 标注相关
      showAnnotation: false,
      activeAnnotationId: null,
      showMarkers: true,

      userPickerColumns: [
        { label: '用户昵称', prop: 'nickName', minWidth: 160 },
        { label: 'UID', prop: 'uid', width: 140 },
        { label: '手机号', prop: 'phone', width: 150 },
      ],
      roomPickerColumns: [
        { label: '房间号', prop: 'roomNo', width: 140 },
        { label: '房间名称', prop: 'roomName', minWidth: 220 },
      ],

      // 状态筛选 Tabs
      statusTabs: [
        { type: 'all', name: '全部', count: 0 },
        { type: 'pending', name: '待审核', count: 0 },
        { type: 'approved', name: '已通过', count: 0 },
        { type: 'rejected', name: '未通过', count: 0 },
        { type: 'dismissed', name: '已驳回', count: 0 },
      ],

      // 搜索表单
      searchForm: {
        userId: '',
        roomId: '',
        type: '',
        grabStatus: '',
        dateRange: [],
        status: 'all',
        page: 1,
        limit: 10,
      },

      // 用户下拉选项
      userOptions: [
        { id: 1, phone: '138****8001', uid: 'U100001', nickName: '我大星火啊' },
        { id: 2, phone: '139****8002', uid: 'U100002', nickName: '游戏达人' },
        { id: 3, phone: '137****8003', uid: 'U100003', nickName: '快乐玩家' },
        { id: 4, phone: '136****8004', uid: 'U100004', nickName: '抓娃娃高手' },
        { id: 5, phone: '135****8005', uid: 'U100005', nickName: '幸运星' },
      ],

      // 房间下拉选项
      roomOptions: [
        { id: 1, roomNo: 'R001', roomName: '一号抓娃娃房' },
        { id: 2, roomNo: 'R002', roomName: '二号欧皇台' },
        { id: 3, roomNo: 'R003', roomName: '三号刮板台' },
        { id: 4, roomNo: 'R004', roomName: '四号技术台' },
      ],

      // ===== Mock 数据：审核管理列表 =====
      // 覆盖场景：
      // 1. 审核状态：待审核(5条)、已通过(6条)、未通过(4条)、已驳回(5条)
      // 2. 抓取状态：抓取中(2条)、已结束(15条)、超时(3条)
      // 3. 类型：图片(10条)、视频(10条)
      // 4. 奖品类型：实物(8条)、积分(5条)、优惠券(4条)、金币(3条)
      // 5. 投币倍数：1x-10x
      // 6. 游戏币：50-500
      // 7. 奖品数量：0-3个
      // 8. 时间分布：2026年6月不同日期和时间
      mockData: [
        // ===== 待审核 - 抓取中 =====
        {
          id: 1,
          userNo: 'U88001',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix1',
          userPhone: '136****1234',
          userUid: 'U88001',
          userName: '幸运小手',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-001',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 100,
          coinMultiple: 2,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'grabbing',
          grabTime: '2026-06-29 14:35:22',
          status: 'pending',
          prizeName: '',
          prizeType: '',
          auditor: '',
          auditTime: '',
          prizeList: [],
        },
        {
          id: 2,
          userNo: 'U88002',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna2',
          userPhone: '137****2345',
          userUid: 'U88002',
          userName: '欧皇附体',
          roomId: 2,
          roomNo: 'R002',
          roomName: '萌趣抓娃娃屋',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台B-003',
          gamePlayName: '概率转盘',
          roomFeatures: '转盘、概率up',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 200,
          coinMultiple: 5,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'grabbing',
          grabTime: '2026-06-29 14:40:15',
          status: 'pending',
          prizeName: '',
          prizeType: '',
          auditor: '',
          auditTime: '',
          prizeList: [],
        },
        // ===== 待审核 - 已结束（无奖品） =====
        {
          id: 3,
          userNo: 'U88003',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin3',
          userPhone: '138****3456',
          userUid: 'U88003',
          userName: '技术流大师',
          roomId: 3,
          roomNo: 'R003',
          roomName: '技术台挑战馆',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台C-005',
          gamePlayName: '技术挑战',
          roomFeatures: '技术流、高难度',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 150,
          coinMultiple: 3,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-29 11:20:45',
          status: 'pending',
          prizeName: '',
          prizeType: '',
          auditor: '',
          auditTime: '',
          prizeList: [],
        },
        // ===== 待审核 - 已结束（单个奖品-积分） =====
        {
          id: 4,
          userNo: 'U88004',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie4',
          userPhone: '139****4567',
          userUid: 'U88004',
          userName: '抓娃娃新手',
          roomId: 4,
          roomNo: 'R004',
          roomName: '新手友好区',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台D-007',
          gamePlayName: '新手直抓',
          roomFeatures: '简单、新手推荐',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 80,
          coinMultiple: 1,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-29 10:15:30',
          status: 'pending',
          prizeName: '积分 x 200',
          prizeType: 'points',
          auditor: '',
          auditTime: '',
          prizeList: [
            { prizeId: 15, prizeName: '积分', quantity: 200, multiple: 1, total: 200 },
          ],
        },
        // ===== 待审核 - 已结束（多个奖品） =====
        {
          id: 5,
          userNo: 'U88005',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex5',
          userPhone: '135****5678',
          userUid: 'U88005',
          userName: '连击王者',
          roomId: 5,
          roomNo: 'R005',
          roomName: '大奖连连看',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台E-010',
          gamePlayName: '连击模式',
          roomFeatures: '连击、奖励翻倍',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 500,
          coinMultiple: 10,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-29 09:05:18',
          status: 'pending',
          prizeName: '毛绒熊、积分300、金币x50',
          prizeType: 'physical',
          auditor: '',
          auditTime: '',
          prizeList: [
            { prizeId: 1, prizeName: '毛绒熊', quantity: 1, multiple: 10, total: 10 },
            { prizeId: 15, prizeName: '积分', quantity: 300, multiple: 10, total: 3000 },
            { prizeId: 20, prizeName: '金币', quantity: 50, multiple: 10, total: 500 },
          ],
        },
        // ===== 待审核 - 超时 =====
        {
          id: 6,
          userNo: 'U88006',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma6',
          userPhone: '158****6789',
          userUid: 'U88006',
          userName: '犹豫不决',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-002',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 100,
          coinMultiple: 2,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'timeout',
          grabTime: '2026-06-28 22:30:45',
          status: 'pending',
          prizeName: '',
          prizeType: '',
          auditor: '',
          auditTime: '',
          prizeList: [],
        },
        // ===== 已通过 - 单个实物奖品 =====
        {
          id: 7,
          userNo: 'U88007',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack7',
          userPhone: '159****7890',
          userUid: 'U88007',
          userName: '抓娃娃达人',
          roomId: 2,
          roomNo: 'R002',
          roomName: '萌趣抓娃娃屋',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台B-004',
          gamePlayName: '概率转盘',
          roomFeatures: '转盘、概率up',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 300,
          coinMultiple: 5,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-28 18:20:33',
          status: 'approved',
          prizeName: '限定手办',
          prizeType: 'physical',
          auditor: '审核员王小明',
          auditTime: '2026-06-28 18:45:00',
          prizeList: [
            { prizeId: 5, prizeName: '限定手办', quantity: 1, multiple: 5, total: 5 },
          ],
        },
        {
          id: 8,
          userNo: 'U88008',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy8',
          userPhone: '186****8901',
          userUid: 'U88008',
          userName: '可爱多',
          roomId: 3,
          roomNo: 'R003',
          roomName: '技术台挑战馆',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台C-006',
          gamePlayName: '技术挑战',
          roomFeatures: '技术流、高难度',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 200,
          coinMultiple: 4,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-28 16:10:25',
          status: 'approved',
          prizeName: '精美钥匙扣套装',
          prizeType: 'physical',
          auditor: '审核员李小红',
          auditTime: '2026-06-28 16:30:00',
          prizeList: [
            { prizeId: 8, prizeName: '精美钥匙扣套装', quantity: 2, multiple: 4, total: 8 },
          ],
        },
        // ===== 已通过 - 积分奖品 =====
        {
          id: 9,
          userNo: 'U88009',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom9',
          userPhone: '187****9012',
          userUid: 'U88009',
          userName: '积分收藏家',
          roomId: 4,
          roomNo: 'R004',
          roomName: '新手友好区',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台D-008',
          gamePlayName: '新手直抓',
          roomFeatures: '简单、新手推荐',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 100,
          coinMultiple: 2,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-28 14:05:40',
          status: 'approved',
          prizeName: '积分 x 1000',
          prizeType: 'points',
          auditor: '审核员张小华',
          auditTime: '2026-06-28 14:25:00',
          prizeList: [
            { prizeId: 15, prizeName: '积分', quantity: 1000, multiple: 2, total: 2000 },
          ],
        },
        {
          id: 10,
          userNo: 'U88010',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy10',
          userPhone: '188****0123',
          userUid: 'U88010',
          userName: '新手小白',
          roomId: 5,
          roomNo: 'R005',
          roomName: '大奖连连看',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台E-011',
          gamePlayName: '连击模式',
          roomFeatures: '连击、奖励翻倍',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 250,
          coinMultiple: 5,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-28 12:30:15',
          status: 'approved',
          prizeName: '积分 x 500',
          prizeType: 'points',
          auditor: '审核员王小明',
          auditTime: '2026-06-28 12:50:00',
          prizeList: [
            { prizeId: 15, prizeName: '积分', quantity: 500, multiple: 5, total: 2500 },
          ],
        },
        // ===== 已通过 - 优惠券奖品 =====
        {
          id: 11,
          userNo: 'U88011',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David11',
          userPhone: '189****1234',
          userUid: 'U88011',
          userName: '省钱达人',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-003',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 150,
          coinMultiple: 3,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-28 10:20:50',
          status: 'approved',
          prizeName: '满100减30优惠券',
          prizeType: 'coupon',
          auditor: '审核员李小红',
          auditTime: '2026-06-28 10:40:00',
          prizeList: [
            { prizeId: 12, prizeName: '满100减30优惠券', quantity: 1, multiple: 3, total: 3 },
          ],
        },
        {
          id: 12,
          userNo: 'U88012',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace12',
          userPhone: '135****2345',
          userUid: 'U88012',
          userName: '优惠券猎人',
          roomId: 2,
          roomNo: 'R002',
          roomName: '萌趣抓娃娃屋',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台B-005',
          gamePlayName: '概率转盘',
          roomFeatures: '转盘、概率up',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 80,
          coinMultiple: 1,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-27 20:15:30',
          status: 'approved',
          prizeName: '新人专享券',
          prizeType: 'coupon',
          auditor: '审核员张小华',
          auditTime: '2026-06-27 20:30:00',
          prizeList: [
            { prizeId: 13, prizeName: '新人专享券', quantity: 1, multiple: 1, total: 1 },
          ],
        },
        // ===== 已通过 - 金币奖品 =====
        {
          id: 13,
          userNo: 'U88013',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry13',
          userPhone: '136****3456',
          userUid: 'U88013',
          userName: '金币收藏家',
          roomId: 3,
          roomNo: 'R003',
          roomName: '技术台挑战馆',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台C-007',
          gamePlayName: '技术挑战',
          roomFeatures: '技术流、高难度',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 300,
          coinMultiple: 6,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-27 18:25:45',
          status: 'approved',
          prizeName: '金币 x 200',
          prizeType: 'gold',
          auditor: '审核员王小明',
          auditTime: '2026-06-27 18:45:00',
          prizeList: [
            { prizeId: 20, prizeName: '金币', quantity: 200, multiple: 6, total: 1200 },
          ],
        },
        // ===== 已通过 - 多个奖品混合 =====
        {
          id: 14,
          userNo: 'U88014',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy14',
          userPhone: '137****4567',
          userUid: 'U88014',
          userName: '大满贯选手',
          roomId: 5,
          roomNo: 'R005',
          roomName: '大奖连连看',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台E-012',
          gamePlayName: '连击模式',
          roomFeatures: '连击、奖励翻倍',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 450,
          coinMultiple: 9,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-27 15:10:20',
          status: 'approved',
          prizeName: '限定手办、毛绒熊、积分500',
          prizeType: 'physical',
          auditor: '审核员李小红',
          auditTime: '2026-06-27 15:30:00',
          prizeList: [
            { prizeId: 5, prizeName: '限定手办', quantity: 1, multiple: 9, total: 9 },
            { prizeId: 1, prizeName: '毛绒熊', quantity: 1, multiple: 9, total: 9 },
            { prizeId: 15, prizeName: '积分', quantity: 500, multiple: 9, total: 4500 },
          ],
        },
        // ===== 未通过 - 无奖品 =====
        {
          id: 15,
          userNo: 'U88015',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James15',
          userPhone: '138****5678',
          userUid: 'U88015',
          userName: '差一点',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-004',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 100,
          coinMultiple: 2,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-27 12:05:30',
          status: 'rejected',
          prizeName: '',
          prizeType: '',
          auditor: '审核员张小华',
          auditTime: '2026-06-27 12:20:00',
          prizeList: [],
        },
        {
          id: 16,
          userNo: 'U88016',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate16',
          userPhone: '139****6789',
          userUid: 'U88016',
          userName: '未中奖用户',
          roomId: 2,
          roomNo: 'R002',
          roomName: '萌趣抓娃娃屋',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台B-006',
          gamePlayName: '概率转盘',
          roomFeatures: '转盘、概率up',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 200,
          coinMultiple: 4,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-27 10:30:45',
          status: 'rejected',
          prizeName: '',
          prizeType: '',
          auditor: '审核员王小明',
          auditTime: '2026-06-27 10:45:00',
          prizeList: [],
        },
        {
          id: 17,
          userNo: 'U88017',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo17',
          userPhone: '158****7890',
          userUid: 'U88017',
          userName: '抓取失败',
          roomId: 3,
          roomNo: 'R003',
          roomName: '技术台挑战馆',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台C-008',
          gamePlayName: '技术挑战',
          roomFeatures: '技术流、高难度',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 350,
          coinMultiple: 7,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-26 20:15:10',
          status: 'rejected',
          prizeName: '',
          prizeType: '',
          auditor: '审核员李小红',
          auditTime: '2026-06-26 20:30:00',
          prizeList: [],
        },
        {
          id: 18,
          userNo: 'U88018',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia18',
          userPhone: '159****8901',
          userUid: 'U88018',
          userName: '差一点就中',
          roomId: 4,
          roomNo: 'R004',
          roomName: '新手友好区',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台D-009',
          gamePlayName: '新手直抓',
          roomFeatures: '简单、新手推荐',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 120,
          coinMultiple: 2,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-26 16:40:25',
          status: 'rejected',
          prizeName: '',
          prizeType: '',
          auditor: '审核员张小华',
          auditTime: '2026-06-26 17:00:00',
          prizeList: [],
        },
        // ===== 已驳回 - 超时 =====
        {
          id: 19,
          userNo: 'U88019',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah19',
          userPhone: '186****9012',
          userUid: 'U88019',
          userName: '超时用户1',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-005',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 100,
          coinMultiple: 2,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'timeout',
          grabTime: '2026-06-26 14:25:30',
          status: 'dismissed',
          prizeName: '',
          prizeType: '',
          auditor: '审核员王小明',
          auditTime: '2026-06-26 14:40:00',
          prizeList: [],
        },
        {
          id: 20,
          userNo: 'U88020',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia20',
          userPhone: '187****0123',
          userUid: 'U88020',
          userName: '超时用户2',
          roomId: 2,
          roomNo: 'R002',
          roomName: '萌趣抓娃娃屋',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台B-007',
          gamePlayName: '概率转盘',
          roomFeatures: '转盘、概率up',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 180,
          coinMultiple: 3,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'timeout',
          grabTime: '2026-06-26 12:10:45',
          status: 'dismissed',
          prizeName: '',
          prizeType: '',
          auditor: '审核员李小红',
          auditTime: '2026-06-26 12:25:00',
          prizeList: [],
        },
        {
          id: 21,
          userNo: 'U88021',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter21',
          userPhone: '188****1234',
          userUid: 'U88021',
          userName: '超时用户3',
          roomId: 3,
          roomNo: 'R003',
          roomName: '技术台挑战馆',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台C-009',
          gamePlayName: '技术挑战',
          roomFeatures: '技术流、高难度',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 280,
          coinMultiple: 5,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'timeout',
          grabTime: '2026-06-25 22:50:15',
          status: 'dismissed',
          prizeName: '',
          prizeType: '',
          auditor: '审核员张小华',
          auditTime: '2026-06-25 23:05:00',
          prizeList: [],
        },
        // ===== 已驳回 - 其他原因 =====
        {
          id: 22,
          userNo: 'U88022',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn22',
          userPhone: '189****2345',
          userUid: 'U88022',
          userName: '违规用户',
          roomId: 4,
          roomNo: 'R004',
          roomName: '新手友好区',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台D-010',
          gamePlayName: '新手直抓',
          roomFeatures: '简单、新手推荐',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 90,
          coinMultiple: 1,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-25 19:30:20',
          status: 'dismissed',
          prizeName: '',
          prizeType: '',
          auditor: '审核员王小明',
          auditTime: '2026-06-25 19:45:00',
          prizeList: [],
        },
        {
          id: 23,
          userNo: 'U88023',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rose23',
          userPhone: '135****3456',
          userUid: 'U88023',
          userName: '异常数据',
          roomId: 5,
          roomNo: 'R005',
          roomName: '大奖连连看',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台E-013',
          gamePlayName: '连击模式',
          roomFeatures: '连击、奖励翻倍',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 400,
          coinMultiple: 8,
          type: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          grabStatus: 'finished',
          grabTime: '2026-06-25 16:20:35',
          status: 'dismissed',
          prizeName: '',
          prizeType: '',
          auditor: '审核员李小红',
          auditTime: '2026-06-25 16:35:00',
          prizeList: [],
        },
        // ===== 已通过 - 优惠券和金币 =====
        {
          id: 24,
          userNo: 'U88024',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam24',
          userPhone: '136****4567',
          userUid: 'U88024',
          userName: '混合奖品达人',
          roomId: 1,
          roomNo: 'R001',
          roomName: '星之所在抓娃娃店',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台A-006',
          gamePlayName: '经典直抓',
          roomFeatures: '直抓、单爪',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 200,
          coinMultiple: 4,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-25 14:15:40',
          status: 'approved',
          prizeName: '满50减10优惠券、金币x100',
          prizeType: 'coupon',
          auditor: '审核员张小华',
          auditTime: '2026-06-25 14:30:00',
          prizeList: [
            { prizeId: 14, prizeName: '满50减10优惠券', quantity: 1, multiple: 4, total: 4 },
            { prizeId: 20, prizeName: '金币', quantity: 100, multiple: 4, total: 400 },
          ],
        },
        {
          id: 25,
          userNo: 'U88025',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tina25',
          userPhone: '137****5678',
          userUid: 'U88025',
          userName: '终极幸运儿',
          roomId: 5,
          roomNo: 'R005',
          roomName: '大奖连连看',
          roomCover: 'https://img.yzcdn.cn/vant/cat.jpeg',
          machineBind: '机台E-014',
          gamePlayName: '连击模式',
          roomFeatures: '连击、奖励翻倍',
          ruleImageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          gameCoins: 500,
          coinMultiple: 10,
          type: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          grabStatus: 'finished',
          grabTime: '2026-06-24 21:30:50',
          status: 'approved',
          prizeName: '限定手办x2、毛绒兔、积分2000、金币x500、满200减50券',
          prizeType: 'physical',
          auditor: '审核员王小明',
          auditTime: '2026-06-24 22:00:00',
          prizeList: [
            { prizeId: 5, prizeName: '限定手办', quantity: 2, multiple: 10, total: 20 },
            { prizeId: 2, prizeName: '毛绒兔', quantity: 1, multiple: 10, total: 10 },
            { prizeId: 15, prizeName: '积分', quantity: 2000, multiple: 10, total: 20000 },
            { prizeId: 20, prizeName: '金币', quantity: 500, multiple: 10, total: 5000 },
            { prizeId: 16, prizeName: '满200减50券', quantity: 1, multiple: 10, total: 10 },
          ],
        },
      ],
    };
  },
  created() {
    this.allData = [...this.mockData];
    this.initStatusCounts();
    this.getList();
  },
  methods: {
    getReviewUserDisplay(id) {
      const user = this.userOptions.find(item => item.id === id);
      if (!user) return '';
      return (user.nickName || user.phone || '-') + '（' + (user.uid || '-') + '）';
    },
    getReviewRoomDisplay(id) {
      const room = this.roomOptions.find(item => item.id === id);
      if (!room) return '';
      return (room.roomName || '-') + '（' + (room.roomNo || '-') + '）';
    },
    // ===== 状态计数初始化 =====
    initStatusCounts() {
      this.statusTabs.forEach((tab) => {
        if (tab.type === 'all') {
          tab.count = this.allData.length;
        } else {
          tab.count = this.allData.filter((item) => item.status === tab.type).length;
        }
      });
    },

    // ===== 获取状态文本 =====
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '未通过',
        dismissed: '已驳回',
      };
      return statusMap[status] || status;
    },

    // ===== 获取抓取状态文本 =====
    getGrabStatusText(status) {
      const statusMap = {
        grabbing: '抓取中',
        finished: '已结束',
        timeout: '超时',
      };
      return statusMap[status] || status;
    },

    // ===== 获取列表数据 =====
    getList() {
      this.loading = true;
      setTimeout(() => {
        let filteredData = [...this.allData];

        // 用户筛选
        if (this.searchForm.userId) {
          const user = this.userOptions.find((u) => u.id === this.searchForm.userId);
          if (user) {
            filteredData = filteredData.filter((item) => item.userUid === user.uid);
          }
        }

        // 房间筛选
        if (this.searchForm.roomId) {
          filteredData = filteredData.filter((item) => item.roomId === this.searchForm.roomId);
        }

        // 类型筛选
        if (this.searchForm.type) {
          filteredData = filteredData.filter((item) => item.type === this.searchForm.type);
        }

        // 抓取状态筛选
        if (this.searchForm.grabStatus) {
          filteredData = filteredData.filter((item) => item.grabStatus === this.searchForm.grabStatus);
        }

        // 时间范围筛选
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const startDate = new Date(this.searchForm.dateRange[0]).getTime();
          const endDate = new Date(this.searchForm.dateRange[1] + ' 23:59:59').getTime();
          filteredData = filteredData.filter((item) => {
            const grabTime = new Date(item.grabTime).getTime();
            return grabTime >= startDate && grabTime <= endDate;
          });
        }

        // 审核状态筛选
        if (this.searchForm.status !== 'all') {
          filteredData = filteredData.filter((item) => item.status === this.searchForm.status);
        }

        this.total = filteredData.length;

        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableData = filteredData.slice(start, end);

        this.loading = false;
      }, 300);
    },

    // ===== 点击Tab =====
    onClickTab() {
      this.searchForm.page = 1;
      this.getList();
    },

    // ===== 查询 =====
    userSearchs() {
      this.selectionList = [];
      this.selectedIds = [];
      this.searchForm.page = 1;
      this.getList();
    },

    // ===== 重置 =====
    reset(name) {
      this.searchForm = {
        userId: '',
        roomId: '',
        type: '',
        grabStatus: '',
        dateRange: [],
        status: 'all',
        page: 1,
        limit: 10,
      };
      this.selectedIds = [];
      this.selectionList = [];
      this.getList();
    },

    // ===== 分页 =====
    pageChange() {
      this.selectionList = [];
      this.getList();
    },

    // ===== 行选择 =====
    handleSelectRow(selection, row) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
    },

    // ===== 全选 =====
    handleSelectAll(selection) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
    },

    // ===== 预览媒体（点击缩略图） =====
    previewMedia(row) {
      if (row.type === 'video' && row.videoUrl) {
        // 视频类型直接打开回放弹窗
        this.handlePlayback(row);
      } else {
        // 图片预览
        this.$imagePreview({
          images: [row.thumbnail],
          index: 0,
        });
      }
    },

    // ===== 查看详情 =====
    handleDetail(row) {
      this.$nextTick(() => {
        if (this.$refs.reviewDetailDialog) {
          this.$refs.reviewDetailDialog.open(row);
        }
      });
    },

    // ===== 审核 =====
    handleAudit(row) {
      this.$nextTick(() => {
        if (this.$refs.reviewAuditDialog) {
          this.$refs.reviewAuditDialog.open(row);
        }
      });
    },

    // ===== 驳回 =====
    handleDismiss(row) {
      this.$confirm('确定要驳回该审核记录吗？用户权益将不发放。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          row.status = 'dismissed';
          this.$message.success('已驳回');
          this.initStatusCounts();
          this.getList();
        })
        .catch(() => {});
    },

    // ===== 回放（触发多媒体回放弹窗） =====
    handlePlayback(row) {
      this.$nextTick(() => {
        if (this.$refs.videoPlaybackDialog) {
          this.$refs.videoPlaybackDialog.open(row);
        }
      });
    },

    // ===== 审核成功回调 =====
    handleAuditSuccess(data) {
      const row = this.allData.find((item) => item.id === data.id);
      if (row) {
        row.status = data.auditResult === 'pass' ? 'approved' : 'rejected';
        row.auditor = '当前用户';
        row.auditTime = this.formatDate(new Date());
        if (data.prizeList && data.prizeList.length > 0) {
          row.prizeList = data.prizeList;
          row.prizeName = data.prizeList.map((p) => p.prizeName).join('、');
          row.prizeType = data.prizeType;
        } else {
          row.prizeList = [];
          row.prizeName = '';
          row.prizeType = '';
        }
      }
      this.initStatusCounts();
      this.getList();
    },

    // ===== 格式化日期 =====
    formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    },

    // ===== 批量审核 =====
    batchAudit() {
      const pendingCount = this.selectionList.filter((item) => item.status === 'pending').length;
      if (pendingCount === 0) {
        this.$message.warning('请选择待审核的记录');
        return;
      }
      this.$message.info(`批量审核 ${pendingCount} 条待审核记录`);
    },

    // ===== 导出 =====
    exportList() {
      this.$message.info('导出功能开发中');
    },

    // ===== 标注相关方法 =====
    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleAnnotationSelect(annotation) {
      this.activeAnnotationId = annotation.id;
    },
    handleToggleMarkers(visible) {
      this.showMarkers = visible;
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
::v-deep .el-tabs__item {
  height: 54px !important;
  line-height: 54px !important;
}

.reviewAlert {
  margin-top: 20px;
}

.reviewI {
  color: var(--prev-color-primary);
  font-style: normal;
}

.form_content_width {
  width: 220px;
}

.ResetSearch {
  border: 1px solid #dcdfe6;
  color: #606266;
  margin-right: 10px;
}

.mt16 {
  margin-top: 16px;
}

.table-header-row {
  margin-top: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.mr10 {
  margin-right: 10px;
}

.user-info-cell,
.room-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info-detail,
.room-info-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-phone,
.user-nickname,
.room-name {
  font-size: 13px;
  color: #303133;
}

.user-uid,
.room-no {
  font-size: 11px;
  color: #909399;
}

.media-thumb {
  position: relative;
  width: 70px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-overlay {
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
      font-size: 20px;
      color: #fff;
    }
  }

  &:hover {
    opacity: 0.85;
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

.action-link {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &-danger {
    color: #f56c6c;
  }
}

.text-gray {
  color: #909399;
}

.page {
  margin-top: 20px;
}

/* 标注面板样式 */
.review-list-page {
  position: relative;
  min-height: 100vh;

  &.annotation-mode {
    padding-right: 380px;
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
