<template>
  <div class="appeal-list-page" :class="{ 'annotation-mode': showAnnotation }">
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
        />
      </div>
    </transition>

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
        <el-form-item label="申请时间：">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="form_content_width"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="用户信息：">
          <entity-picker-input
            v-model="searchForm.userId"
            :display="getAppealUserDisplay(searchForm.userId)"
            placeholder="请选择用户"
            title="用户搜索"
            search-label="用户搜索"
            search-placeholder="请输入昵称/UID"
            :rows="userOptions"
            :columns="userPickerColumns"
            row-key="id"
            :search-fields="['nickName', 'uid']"
          />
          <annotation-point
            title="【优化】用户信息筛选交互"
            content="优化前：用户信息使用普通输入或下拉选择，数据量较大时查找效率低，且容易只看到单一字段。&#10;&#10;优化后：改为带搜索图标的只读输入框，点击输入框或搜索图标打开用户搜索弹窗，支持按昵称、UID、用户编号、手机号等信息检索，选择后回填筛选区。&#10;&#10;原因：用户数据量大，弹窗表格可以同时展示头像、昵称、编号等关键信息，降低误选并提升筛选效率。"
            priority="P1"
          />
        </el-form-item>
        <el-form-item>
          <el-button class="ResetSearch" @click="reset('searchForm')">重置</el-button>
          <el-button type="primary" @click="userSearchs">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 状态筛选 + 操作栏 + 表格 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <!-- 状态筛选 Tabs -->
      <div class="status-tabs-wrapper">
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
          <span class="table-title">申诉记录</span>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button class="mr10" @click="exportList">导出</el-button>
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
      >
        <!-- 申诉单号 -->
        <el-table-column label="申诉单号" prop="appealNo" min-width="140">
          <template slot-scope="scope">
            <span class="appeal-no">{{ scope.row.appealNo }}</span>
          </template>
        </el-table-column>

        <!-- 用户信息（复合展示：头像 + 昵称 + UID） -->
        <el-table-column label="用户信息" min-width="180">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <el-avatar :size="36" shape="circle">
                <img v-if="scope.row.userAvatar" :src="scope.row.userAvatar" />
                <i v-else class="el-icon-user" style="font-size: 18px;"></i>
              </el-avatar>
              <div class="user-info-detail">
                <div class="user-nickname">{{ scope.row.userNickName }}</div>
                <div class="user-uid">编号：{{ scope.row.userUid }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 房间号 -->
        <el-table-column label="房间号" prop="roomNo" min-width="100"></el-table-column>

        <!-- 申诉币数 -->
        <el-table-column label="申诉币数" prop="appealCoins" min-width="100" align="center">
          <template slot-scope="scope">
            <span class="coins-value">{{ scope.row.appealCoins }}</span>
          </template>
        </el-table-column>

        <!-- 申诉理由 -->
        <el-table-column label="申诉理由" prop="appealReason" min-width="150">
          <template slot-scope="scope">
            <span class="reason-text">{{ scope.row.appealReason }}</span>
          </template>
        </el-table-column>

        <!-- 补偿币数 -->
        <el-table-column label="补偿币数" prop="compensateCoins" min-width="100" align="center">
          <template slot-scope="scope">
            <span :class="['compensate-value', scope.row.compensateCoins > 0 ? 'has-value' : '']">
              {{ scope.row.compensateCoins || 0 }}
            </span>
          </template>
        </el-table-column>

        <!-- 额外补偿 -->
        <el-table-column label="额外补偿" prop="extraCompensate" min-width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.extraCompensate" class="extra-compensate">{{ scope.row.extraCompensate }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <!-- 游戏回放（视频/截图缩略图） -->
        <el-table-column label="游戏回放" min-width="100">
          <template slot-scope="scope">
            <div class="media-thumb" @click="previewMedia(scope.row)">
              <img :src="scope.row.thumbnail" class="thumb-img" />
              <div class="thumb-overlay" v-if="scope.row.mediaType === 'video'">
                <i class="el-icon-video-play play-icon"></i>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 申请时间 -->
        <el-table-column label="申请时间" prop="applyTime" min-width="150"></el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 'pending'">
              <a @click="handleAudit(scope.row)" class="action-link">审核</a>
              <el-divider direction="vertical"></el-divider>
              <a
                v-if="!scope.row.isInBlacklist"
                @click="handleAddBlacklist(scope.row)"
                class="action-link danger"
                :id="scope.$index === 0 ? 'appeal-list-add-blacklist' : ''"
              >加入恶意名单</a>
              <span v-else class="text-gray disabled-text">已黑名单</span>
              <annotation-point
                v-if="scope.$index === 0 && !scope.row.isInBlacklist"
                title="【优化】加入恶意名单防错"
                content="优化前：加入恶意名单按钮可直接操作，容易误操作。&#10;&#10;优化后：加入前必须查看申诉详情，并填写原因。&#10;&#10;原因：避免单次申诉被过度处罚，加入黑名单前需确认申诉详情和原因，降低误操作风险。"
                priority="P0"
              />
            </template>
            <template v-else>
              <div style="display: inline-block; position: relative;">
                <a
                  @click="handleDetail(scope.row)"
                  class="action-link"
                  :id="scope.$index === 0 ? 'appeal-list-action-view-detail' : ''"
                >查看详情</a>
                <annotation-point
                  v-if="scope.$index === 0"
                  title="【优化】已处理记录查看详情"
                  content="优化前：已处理记录只显示'已处理'，无法查看处理详情。&#10;&#10;优化后：已处理记录支持查看详情、处理记录。&#10;&#10;原因：已处理也需要追溯原因和处理结果，便于后续问题复查和数据分析。"
                  priority="P0"
                />
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部翻页 -->
      <div class="acea-row row-right page">
        <pagination
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <!-- ===== 申诉详情弹窗 ===== -->
    <AppealDetailDialog
      ref="appealDetailDialog"
      @audit-success="handleAuditSuccess"
    />

    <!-- ===== 加入恶意名单弹窗 ===== -->
    <AddMaliciousDialog
      ref="addMaliciousDialog"
      @success="handleAddBlacklistSuccess"
    />
  </div>
</template>

<script>
import AppealDetailDialog from '../components/AppealDetailDialog';
import AddMaliciousDialog from '../components/AddMaliciousDialog';
import AnnotationPoint from '@/components/AnnotationPoint';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight';
import AnnotationPanel from '@/components/annotation/AnnotationPanel';
import EntityPickerInput from '@/components/EntityPickerInput';

export default {
  name: 'game_appeal_list',
  components: {
    EntityPickerInput,
    AppealDetailDialog,
    AddMaliciousDialog,
    AnnotationPoint,
    AnnotationHighlight,
    AnnotationPanel,
  },
  data() {
    return {
      showAnnotation: false,
      activeAnnotationId: null,
      annotations: [],
      loading: false,
      total: 0,
      tableData: [],
      allData: [],

      userPickerColumns: [
        { label: '用户昵称', prop: 'nickName', minWidth: 180 },
        { label: 'UID', prop: 'uid', width: 160 },
      ],

      statusTabs: [
        { type: 'all', name: '全部', count: 0 },
        { type: 'pending', name: '待审核', count: 0 },
        { type: 'approved', name: '已通过', count: 0 },
        { type: 'rejected', name: '已驳回', count: 0 },
      ],

      searchForm: {
        dateRange: [],
        userId: '',
        status: 'all',
        page: 1,
        limit: 10,
      },

      userOptions: [
        { id: 1, nickName: '奶油草莓', uid: 'U10077' },
        { id: 2, nickName: '我大星火啊', uid: 'U10088' },
        { id: 3, nickName: '柠檬汽水', uid: 'U10055' },
        { id: 4, nickName: '小熊饼干', uid: 'U10066' },
        { id: 5, nickName: '吃薯片的猫', uid: 'U10044' },
        { id: 6, nickName: '夏日萤火', uid: 'U10033' },
      ],

      // 当前操作的数据
      currentRow: null,

      // ===== Mock 数据 =====
      mockData: [
        {
          id: 1,
          appealNo: 'AP20260627001',
          userUid: 'U20231',
          userNickName: '奶油草莓',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-201',
          appealCoins: 50,
          appealReason: '连续抓取12次未中，感觉爪子力度明显偏松，怀疑机器参数有问题，申请退还游戏币',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          applyTime: '2026-06-27 14:32:18',
          status: 'pending',
          isInBlacklist: false,
          userAppealStats: {
            totalCount: 2,
            passRate: 50,
            rejectRate: 50,
          },
          gameRecords: [
            { id: 22201, roomNo: 'WW-201', gameTime: '2026-06-27 14:15:30', playbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', result: '失败', coins: 50 },
            { id: 22202, roomNo: 'WW-201', gameTime: '2026-06-27 14:18:20', playbackUrl: '', result: '失败', coins: 50 },
            { id: 22203, roomNo: 'WW-201', gameTime: '2026-06-27 14:22:05', playbackUrl: '', result: '失败', coins: 50 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
        },
        {
          id: 2,
          appealNo: 'AP20260627002',
          userUid: 'U20456',
          userNickName: '快乐小橘子',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-108',
          appealCoins: 30,
          appealReason: '明明抓到了奖品，但是到洞口的时候爪子突然松开，奖品掉回去了',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          applyTime: '2026-06-27 13:45:22',
          status: 'pending',
          isInBlacklist: false,
          userAppealStats: {
            totalCount: 1,
            passRate: 0,
            rejectRate: 0,
          },
          gameRecords: [
            { id: 22211, roomNo: 'WW-108', gameTime: '2026-06-27 13:30:12', playbackUrl: '', result: '失败', coins: 30 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
        },
        {
          id: 3,
          appealNo: 'AP20260627003',
          userUid: 'U20899',
          userNickName: '薄荷糖',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-305',
          appealCoins: 100,
          appealReason: '游戏过程中画面突然卡顿了5秒多，等恢复的时候游戏已经结束，币也被扣了',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          applyTime: '2026-06-27 11:20:46',
          status: 'pending',
          isInBlacklist: false,
          userAppealStats: {
            totalCount: 3,
            passRate: 67,
            rejectRate: 33,
          },
          gameRecords: [
            { id: 22221, roomNo: 'WW-305', gameTime: '2026-06-27 11:05:33', playbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', result: '失败', coins: 100 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
        },
        {
          id: 4,
          appealNo: 'AP20260626004',
          userUid: 'U20112',
          userNickName: '云朵棉花糖',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-102',
          appealCoins: 80,
          appealReason: '直播间展示的是星黛露公仔，实际抓到的是普通钥匙扣，货不对板',
          compensateCoins: 80,
          extraCompensate: '额外补偿20币',
          mediaType: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          applyTime: '2026-06-26 19:55:08',
          status: 'approved',
          isInBlacklist: false,
          rejectReason: '',
          userAppealStats: {
            totalCount: 2,
            passRate: 100,
            rejectRate: 0,
          },
          gameRecords: [
            { id: 22101, roomNo: 'WW-102', gameTime: '2026-06-26 19:40:25', playbackUrl: '', result: '失败', coins: 80 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [
            { id: 'CF20260626001', time: '2026-06-26 20:10:00', amount: 80, type: 'game_coins' },
            { id: 'CF20260626002', time: '2026-06-26 20:10:00', amount: 20, type: 'game_coins' },
          ],
        },
        {
          id: 5,
          appealNo: 'AP20260626005',
          userUid: 'U10088',
          userNickName: '我大星火啊',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-201',
          appealCoins: 50,
          appealReason: '爪子力度不够，抓起来还没到顶部就掉了，已经连续好几次了',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          applyTime: '2026-06-26 16:28:33',
          status: 'rejected',
          isInBlacklist: false,
          rejectReason: '经核实，爪子力度参数正常，抓取结果属于正常概率范围',
          rejectReasonType: 'insufficient_reason',
          userAppealStats: {
            totalCount: 8,
            passRate: 38,
            rejectRate: 62,
          },
          gameRecords: [
            { id: 22081, roomNo: 'WW-201', gameTime: '2026-06-26 16:10:15', playbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', result: '失败', coins: 50 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
        },
        {
          id: 6,
          appealNo: 'AP20260625006',
          userUid: 'U20334',
          userNickName: '小熊饼干',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-402',
          appealCoins: 60,
          appealReason: '洞口位置设计有问题，奖品明明抓起来了但是掉不出来，卡在洞口了',
          compensateCoins: 60,
          extraCompensate: '',
          mediaType: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          applyTime: '2026-06-25 21:15:42',
          status: 'approved',
          isInBlacklist: false,
          rejectReason: '',
          userAppealStats: {
            totalCount: 3,
            passRate: 67,
            rejectRate: 33,
          },
          gameRecords: [
            { id: 22051, roomNo: 'WW-402', gameTime: '2026-06-25 21:02:18', playbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', result: '失败', coins: 60 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [
            { id: 'CF20260625001', time: '2026-06-25 21:30:00', amount: 60, type: 'game_coins' },
          ],
        },
        {
          id: 7,
          appealNo: 'AP20260625007',
          userUid: 'U10044',
          userNickName: '吃薯片的猫',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-501',
          appealCoins: 200,
          appealReason: '我怀疑有后台操控，连续充了500块钱一个都没中，这概率绝对有问题',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          applyTime: '2026-06-25 15:42:07',
          status: 'rejected',
          isInBlacklist: true,
          rejectReason: '娃娃机为概率性游戏，属于正常概率范围。该用户多次恶意申诉，已加入恶意名单',
          rejectReasonType: 'violate_rules',
          userAppealStats: {
            totalCount: 12,
            passRate: 17,
            rejectRate: 83,
          },
          gameRecords: [
            { id: 22031, roomNo: 'WW-501', gameTime: '2026-06-25 15:20:33', playbackUrl: '', result: '失败', coins: 200 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
        },
        {
          id: 8,
          appealNo: 'AP20260624008',
          userUid: 'U10055',
          userNickName: '柠檬汽水',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-106',
          appealCoins: 100,
          appealReason: '充值了100个币，支付成功了但是游戏币一直没到账，订单号都有',
          compensateCoins: 100,
          extraCompensate: '',
          mediaType: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          applyTime: '2026-06-24 10:18:55',
          status: 'approved',
          isInBlacklist: false,
          rejectReason: '',
          userAppealStats: {
            totalCount: 1,
            passRate: 100,
            rejectRate: 0,
          },
          gameRecords: [],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [
            { id: 'CF20260624001', time: '2026-06-24 10:35:00', amount: 100, type: 'game_coins' },
          ],
        },
        {
          id: 9,
          appealNo: 'AP20260623009',
          userUid: 'U10033',
          userNickName: '夏日萤火',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-308',
          appealCoins: 150,
          appealReason: '直播间显示的是限量版玲娜贝儿，实际机器里放的是普通玩偶，完全不一样',
          compensateCoins: 150,
          extraCompensate: '额外补偿50币',
          mediaType: 'video',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          applyTime: '2026-06-23 20:33:14',
          status: 'approved',
          isInBlacklist: false,
          rejectReason: '',
          userAppealStats: {
            totalCount: 4,
            passRate: 75,
            rejectRate: 25,
          },
          gameRecords: [
            { id: 21981, roomNo: 'WW-308', gameTime: '2026-06-23 20:15:42', playbackUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', result: '失败', coins: 150 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [
            { id: 'CF20260623001', time: '2026-06-23 21:00:00', amount: 150, type: 'game_coins' },
            { id: 'CF20260623002', time: '2026-06-23 21:00:00', amount: 50, type: 'game_coins' },
          ],
        },
        {
          id: 10,
          appealNo: 'AP20260622010',
          userUid: 'U20678',
          userNickName: '芒果布丁',
          userAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          roomNo: 'WW-205',
          appealCoins: 40,
          appealReason: '机器故障，爪子按了下降键完全没反应，但是币已经被扣了',
          compensateCoins: 0,
          extraCompensate: '',
          mediaType: 'image',
          thumbnail: 'https://img.yzcdn.cn/vant/cat.jpeg',
          videoUrl: '',
          applyTime: '2026-06-22 14:08:26',
          status: 'rejected',
          isInBlacklist: false,
          rejectReason: '凭证图片模糊不清，无法确认故障情况，建议重新上传清晰凭证',
          rejectReasonType: 'blurry_evidence',
          userAppealStats: {
            totalCount: 2,
            passRate: 50,
            rejectRate: 50,
          },
          gameRecords: [
            { id: 21901, roomNo: 'WW-205', gameTime: '2026-06-22 14:00:10', playbackUrl: '', result: '失败', coins: 40 },
          ],
          appealEvidence: 'https://img.yzcdn.cn/vant/cat.jpeg',
          compensateFlows: [],
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
    getAppealUserDisplay(id) {
      const user = this.userOptions.find(item => item.id === id);
      if (!user) return '';
      return (user.nickName || '-') + '（' + (user.uid || '-') + '）';
    },
    initStatusCounts() {
      this.statusTabs.forEach((tab) => {
        if (tab.type === 'all') {
          tab.count = this.allData.length;
        } else {
          tab.count = this.allData.filter((item) => item.status === tab.type).length;
        }
      });
    },

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

    getList() {
      this.loading = true;
      setTimeout(() => {
        let filteredData = [...this.allData];

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const startDate = new Date(this.searchForm.dateRange[0]).getTime();
          const endDate = new Date(this.searchForm.dateRange[1] + ' 23:59:59').getTime();
          filteredData = filteredData.filter((item) => {
            const applyTime = new Date(item.applyTime).getTime();
            return applyTime >= startDate && applyTime <= endDate;
          });
        }

        if (this.searchForm.userId) {
          const user = this.userOptions.find((u) => u.id === this.searchForm.userId);
          if (user) {
            filteredData = filteredData.filter((item) => item.userUid === user.uid);
          }
        }

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

    onClickTab() {
      this.searchForm.page = 1;
      this.getList();
    },

    userSearchs() {
      this.searchForm.page = 1;
      this.getList();
    },

    reset(name) {
      this.searchForm = {
        dateRange: [],
        userId: '',
        status: 'all',
        page: 1,
        limit: 10,
      };
      this.getList();
    },

    pageChange() {
      this.getList();
    },

    previewMedia(row) {
      if (row.mediaType === 'video' && row.videoUrl) {
        this.$videoPreview({
          url: row.videoUrl,
        });
      } else {
        this.$imagePreview({
          images: [row.thumbnail],
          index: 0,
        });
      }
    },

    handleDetail(row) {
      this.$nextTick(() => {
        if (this.$refs.appealDetailDialog) {
          this.$refs.appealDetailDialog.open(row);
        }
      });
    },

    handleAudit(row) {
      this.currentRow = row;
      this.$nextTick(() => {
        if (this.$refs.appealDetailDialog) {
          this.$refs.appealDetailDialog.open(row, true);
        }
      });
    },

    handleAddBlacklist(row) {
      if (row.isInBlacklist) {
        this.$message.warning('已加入恶意黑名单，请勿重复操作');
        return;
      }
      this.$nextTick(() => {
        if (this.$refs.addMaliciousDialog) {
          this.$refs.addMaliciousDialog.open(row);
        }
      });
    },

    handleAuditSuccess(data) {
      const row = this.allData.find((item) => item.id === data.id);
      if (row) {
        row.status = data.auditResult === 'pass' ? 'approved' : 'rejected';
        if (data.auditResult === 'pass') {
          row.compensateCoins = data.compensateCoins || row.appealCoins;
        }
        if (data.rejectReason) {
          row.rejectReason = data.rejectReason;
        }
      }
      this.initStatusCounts();
      this.getList();
    },

    handleAddBlacklistSuccess(data) {
      const row = this.allData.find((item) => item.id === data.appealId);
      if (row) {
        row.isInBlacklist = true;
      }
      this.$message.success('已加入恶意名单');
      this.getList();
    },

    exportList() {
      this.$message.info('导出功能开发中');
    },

    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
    },
    handleMarkerClick(annotationId) {
      this.activeAnnotationId = annotationId;
      const annotation = this.annotations.find(a => a.id === annotationId);
      if (annotation && this.$refs.annotationPanel) {
        this.$refs.annotationPanel.selectAnnotation(annotation);
      }
    },
    handleAnnotationSelect(annotation) {
      this.activeAnnotationId = annotation.id;
      const markerElements = document.querySelectorAll('.annotation-marker');
      markerElements.forEach(el => el.classList.remove('active'));
      const activeMarker = document.querySelector(`.annotation-marker[data-id="${annotation.id}"]`);
      if (activeMarker) {
        activeMarker.classList.add('active');
        activeMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
    this.bus.$on('annotationMarkerClick', this.handleMarkerClick);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
    this.bus.$off('annotationMarkerClick', this.handleMarkerClick);
  },
};
</script>

<style lang="scss" scoped>
.appeal-list-page {
  position: relative;
  min-height: 100vh;

  &.annotation-mode {
    padding-right: 380px;
  }
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

.mr10 {
  margin-right: 10px;
}

.table-header-row {
  margin-top: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-nickname {
  font-size: 14px;
  color: #303133;
}

.user-uid {
  font-size: 12px;
  color: #909399;
}

.appeal-no {
  font-size: 13px;
  color: #409eff;
}

.coins-value {
  font-weight: 600;
  color: #e6a23c;
}

.reason-text {
  font-size: 13px;
  color: #606266;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.compensate-value {
  font-weight: 600;

  &.has-value {
    color: #67c23a;
  }

  &:not(.has-value) {
    color: #909399;
  }
}

.extra-compensate {
  font-size: 12px;
  color: #409eff;
}

.text-gray {
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

.action-link {
  color: #409eff;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    color: #66b1ff;
  }

  &.danger {
    color: #f56c6c;

    &:hover {
      color: #f78989;
    }
  }
}

.disabled-text {
  font-size: 13px;
}

.page {
  margin-top: 20px;
}

.status-tabs-wrapper {
  ::v-deep .el-tabs__item {
    height: 54px !important;
    line-height: 54px !important;
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
  border-left: 1px solid #e4e7ed;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter,
.slide-right-leave-active {
  transform: translateX(100%);
}
</style>