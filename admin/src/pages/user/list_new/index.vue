<template>
  <div class="user-list-page" :class="{ 'annotation-mode': showAnnotation }">
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

    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="userFrom"
          :model="userFrom"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form" id="filter-section-optimize">
            <div>
              <el-form-item label="用户信息：" label-for="keyword">
                <el-input v-model="userFrom.keyword" placeholder="手机号/昵称/用户编号" clearable class="form_content_width">
                </el-input>
              </el-form-item>
              <el-form-item label="用户等级：" label-for="level">
                <el-select v-model="userFrom.level" placeholder="请选择用户等级" clearable class="form_content_width">
                  <el-option value="" label="全部">全部</el-option>
                  <el-option value="Lv1" label="Lv1"></el-option>
                  <el-option value="Lv2" label="Lv2"></el-option>
                  <el-option value="Lv3" label="Lv3"></el-option>
                  <el-option value="Lv4" label="Lv4"></el-option>
                  <el-option value="Lv5" label="Lv5"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="身份：" label-for="identity">
                <el-select v-model="userFrom.identity" placeholder="请选择身份" clearable class="form_content_width">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="user" label="用户"></el-option>
                  <el-option value="anchor" label="主播"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="账户状态：" label-for="accountStatus" id="filter-account-status">
                <el-select v-model="userFrom.accountStatus" placeholder="请选择账户状态" clearable class="form_content_width">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="normal" label="正常"></el-option>
                  <el-option value="disabled" label="禁用"></el-option>
                  <el-option value="cancelled" label="注销"></el-option>
                </el-select>
                <annotation-point 
                  title="【新增】账户状态筛选" 
                  content="优化前：筛选区无账户状态筛选条件。&#10;&#10;优化后：增加'账户状态'筛选，选项包括'全部'、'正常'、'禁用'、'注销'。&#10;&#10;原因：配合新增的账户状态字段，支持运营快速筛选出不同账户状态的用户群体，便于用户管理和风险控制。" 
                  priority="P0"
                />
              </el-form-item>
              <el-form-item label="禁言状态：" label-for="muteStatus" id="filter-mute-status">
                <el-select v-model="userFrom.muteStatus" placeholder="请选择禁言状态" clearable class="form_content_width">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="normal" label="正常"></el-option>
                  <el-option value="temporary" label="临时禁言"></el-option>
                  <el-option value="permanent" label="永久禁言"></el-option>
                </el-select>
                <annotation-point 
                  title="【新增】禁言状态筛选" 
                  content="优化前：筛选区无禁言状态筛选条件。&#10;&#10;优化后：增加'禁言状态'筛选，选项包括'全部'、'正常'、'临时禁言'、'永久禁言'。&#10;&#10;原因：配合新增的禁言状态字段，支持运营快速筛选出需要处理禁言状态变化的用户群体。" 
                  priority="P0"
                />
              </el-form-item>
              <el-form-item label="创建时间：" label-for="dateRange" id="filter-registration-time">
                <el-date-picker
                  v-model="userFrom.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="form_content_width"
                ></el-date-picker>
                <annotation-point 
                  title="【新增】注册时间筛选" 
                  content="优化前：筛选区只有用户、等级、身份、渠道，缺少时间筛选。&#10;&#10;优化后：增加注册时间筛选，支持日期范围选择。&#10;&#10;原因：提升筛选能力，支持运营精细化管理，便于按注册时间维度分析用户数据。" 
                  priority="P0"
                />
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
              <el-button class="ResetSearch" v-db-click @click="reset('userFrom')">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <div style="position: relative;" id="tab-channel-counts">
        <div id="tab-counts-optimize">
          <el-tabs v-model="userFrom.user_type" @tab-click="onClickTab">
            <el-tab-pane :label="item.name + ' (' + item.count + ')'" :name="item.type" v-for="(item, index) in headeNum" :key="index" />
          </el-tabs>
        </div>
        <annotation-point 
          title="【新增】Tab数量统计" 
          content="优化前：Tab栏无数量展示，运营无法直观了解各状态用户数量。&#10;&#10;优化后：增加Tab对应状态的数量统计，实时显示各状态用户数。&#10;&#10;原因：提升用户数据感知与筛选效率，让运营快速了解各状态用户分布。" 
          priority="P0"
        />
      </div>

      <el-row :gutter="24" justify="space-between">
        <el-col :span="24">
          <el-button class="mr10" v-db-click @click="exportList">导出</el-button>
          <el-button type="primary" v-db-click @click="handleAdd">添加用户</el-button>
        </el-col>
        <el-col :span="24" class="userAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择<i class="userI"> {{ selectionList.length }} </i>项
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <el-table
        :data="userLists"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        no-filtered-userFrom-text="暂无筛选结果"
        @sort-change="sortChanged"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
      >
        <el-table-column type="selection" :selectable="isSel" width="55"> </el-table-column>
        <el-table-column label="用户信息" min-width="200" id="table-user-info">
          <template slot="header">
            <span id="table-user-info-optimize">用户信息</span>
            <annotation-point 
              title="【优化】用户信息列合并" 
              content="优化前：ID、用户编号、头像、昵称分散展示，信息密度低，浏览效率差。&#10;&#10;优化后：合并为'用户信息'列：头像+昵称+编号。&#10;&#10;原因：提升表格信息密度，减少列数，让运营在一屏内看到更多关键信息，提升浏览效率。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="acea-row" style="position: relative;">
              <div class="tabBox_img" v-viewer>
                <img v-lazy="scope.row.avatar" />
              </div>
              <div class="tabBox_tit">
                <div v-text="scope.row.nickname" class=""></div>
                <div style="color: #909399; font-size: 12px">{{ scope.row.userId }}</div>
              </div>
              <AnnotationMarker
                v-if="showAnnotation && scope.$index === 0"
                annotation-id="A004"
                annotation-type="字段说明"
                annotation-title="用户信息合并展示"
                annotation-priority="P0"
                annotation-description="将原本分散的用户ID、用户编号、头像、昵称合并为一列，提升信息密度和浏览效率。左侧为圆形头像，右侧第一行为用户昵称，第二行为用户编号。"
                :position="{ top: '-30px', right: '-35px' }"
                :is-active="activeAnnotationId === 'A004'"
                @click="handleMarkerClick('A004')"
                style="position: absolute; z-index: 10000;"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户等级" prop="level" min-width="90" :sortable="true" :sort-method="sortByLevel" id="table-sort-level">
          <template slot="header">
            <span>用户等级</span>
            <annotation-point 
              title="【优化】排序功能" 
              content="优化前：用户等级和创建时间列不支持排序，列表按默认顺序展示。&#10;&#10;优化后：用户等级、创建时间均支持点击表头进行升序/降序排列。&#10;&#10;原因：便于运营按等级高低或注册先后快速筛选和排序用户，提升操作效率。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span class="level-tag" style="position: relative;">
              {{ scope.row.level }}
              <AnnotationMarker
                v-if="showAnnotation && scope.$index === 0"
                annotation-id="A005"
                annotation-type="交互说明"
                annotation-title="用户等级排序"
                annotation-priority="P0"
                annotation-description="用户等级列支持点击列头进行排序，方便按等级筛选用户。前端本地排序，点击列头切换排序状态：不排序→升序→降序→循环。"
                :position="{ top: '-30px', right: '-35px' }"
                :is-active="activeAnnotationId === 'A005'"
                @click="handleMarkerClick('A005')"
                style="position: absolute; z-index: 10000;"
              />
            </span>
          </template>
        </el-table-column>
        <el-table-column label="手机号" min-width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="注册来源" min-width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.source }}</div>
          </template>
        </el-table-column>
        <el-table-column label="余额" prop="balance" min-width="100" :sortable="true">
          <template slot-scope="scope">
            <span class="balance">{{ scope.row.balance.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邀请码" min-width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.inviteCode || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="身份" min-width="100">
          <template slot-scope="scope">
            <span :class="['identity-tag', scope.row.identity]">
              {{ scope.row.identity === 'user' ? '用户' : '主播' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="账户状态" min-width="100" id="table-account-status">
          <template slot="header">
            <span>账户状态</span>
            <annotation-point 
              title="【新增】账户状态字段" 
              content="优化前：表格中无账户状态字段，无法直接辨别用户的账户可用性。&#10;&#10;优化后：新增'账户状态'列，枚举值包括'正常'、'禁用'、'注销'。各状态定义如下：&#10;- 正常：账户可正常登录、使用所有功能。&#10;- 禁用：因违规或运营操作被管理员手动禁用，用户无法登录或使用任何功能（但数据保留）。&#10;- 注销：用户主动申请注销或系统根据规则自动注销，账户不可恢复，所有个人信息已脱敏。&#10;&#10;原因：运营需要直观了解每个账户的当前可用状态，以便进行后续操作（如禁用、解禁等），提升管理效率。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span :class="['status-tag', scope.row.accountStatus]">
              {{ getStatusText(scope.row.accountStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="禁言状态" min-width="120" id="table-mute-status">
          <template slot="header">
            <span>禁言状态</span>
            <annotation-point 
              title="【新增】禁言状态字段" 
              content="优化前：表格中无禁言状态字段，运营无法快速识别哪些用户处于被禁言状态。&#10;&#10;优化后：新增'禁言状态'列，枚举值包括'正常'、'临时禁言'、'永久禁言'。各状态定义如下：&#10;- 正常：用户未被禁言，可正常发送弹幕、评论等所有消息。&#10;- 临时禁言：用户因违规被限制发言权限，禁言到期后自动恢复，状态变回'正常'。&#10;- 永久禁言：用户被永久限制发言权限，除非管理员手动解禁，否则状态不会变更。&#10;&#10;原因：禁言是用户管理中的高频操作，运营需要在列表页快速识别用户的发言权限状态，以便进行解禁、延长禁言等操作，提升风控效率。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span :class="['mute-tag', scope.row.muteStatus]">
              {{ getMuteText(scope.row.muteStatus) }}
              <AnnotationMarker
                v-if="showAnnotation && scope.$index === 0"
                annotation-id="A024"
                annotation-type="字段说明"
                annotation-title="禁言状态说明"
                annotation-priority="P0"
                annotation-description="禁言状态用于标识用户在平台的发言权限：\n1. 正常：用户可以在全平台所有房间和评论区正常发言\n2. 临时禁言：用户在指定时长内无法在选定范围内发言，到期后自动恢复\n3. 永久禁言：用户将被永久限制在平台内发言，无法自行恢复"
                :position="{ top: '-30px', right: '-35px' }"
                :is-active="activeAnnotationId === 'A024'"
                @click="handleMarkerClick('A024')"
                style="position: absolute; z-index: 10000;"
              />
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="180" :sortable="true" id="table-sort-create-time">
          <template slot="header">
            <span>创建时间</span>
            <annotation-point 
              title="【优化】排序功能" 
              content="优化前：用户等级和创建时间列不支持排序，列表按默认顺序展示。&#10;&#10;优化后：用户等级、创建时间均支持点击表头进行升序/降序排列。&#10;&#10;原因：便于运营按等级高低或注册先后快速筛选和排序用户，提升操作效率。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div style="position: relative;">
              {{ scope.row.createTime }}
              <AnnotationMarker
                v-if="showAnnotation && scope.$index === 0"
                annotation-id="A006"
                annotation-type="交互说明"
                annotation-title="创建时间排序"
                annotation-priority="P0"
                annotation-description="创建时间列支持点击列头进行时间排序。前端本地排序，点击列头切换：不排序→升序(旧→新)→降序(新→旧)。"
                :position="{ top: '-30px', right: '-35px' }"
                :is-active="activeAnnotationId === 'A006'"
                @click="handleMarkerClick('A006')"
                style="position: absolute; z-index: 10000;"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160" id="mute-action-btn">
          <template slot="header">
            <span>操作</span>
            <annotation-point 
              title="【新增/优化】操作菜单调整" 
              content="【新增】禁用/启用按钮：&#10;- 新增账户禁用功能，可快速封禁异常用户&#10;&#10;【优化】金币积分弹窗：&#10;- 明确显示当前余额，并实时计算操作后预期余额&#10;- 新增用户头像、昵称、编号展示&#10;&#10;【优化】客服派币弹窗：&#10;- 新增用户信息展示&#10;- 派币时强制填写原因（增加类、减少类）&#10;- 系统自动记录操作人&#10;&#10;【优化】禁言功能：&#10;- 列表开关改为弹窗操作，含禁言原因、时长、范围&#10;- 操作日志记录解禁时间，系统自动发送通知&#10;&#10;【优化】修改身份：&#10;- 弹窗中增加身份影响说明文案" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <a v-db-click @click="userDetail(scope.row)" class="action-link">详情</a>
            <el-divider direction="vertical"></el-divider>
            <span class="action-more-wrapper">
              <el-dropdown size="small" @command="changeMenu(scope.row, $event)" :transfer="true">
                <span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="coins">金币积分</el-dropdown-item>
                  <el-dropdown-item command="sendCoins">客服派币</el-dropdown-item>
                  <el-dropdown-item command="changeIdentity">修改身份</el-dropdown-item>
                  <el-dropdown-item command="mute" v-if="scope.row.muteStatus === 'normal'">禁言</el-dropdown-item>
                  <el-dropdown-item command="unmute" v-else>解除禁言</el-dropdown-item>
                  <el-dropdown-item command="disable" v-if="scope.row.accountStatus === 'normal'">禁用</el-dropdown-item>
                  <el-dropdown-item command="enable" v-else-if="scope.row.accountStatus === 'disabled'">启用</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="userFrom.page"
          :limit.sync="userFrom.limit"
          @pagination="pageChange"
        />
      </div>
    </el-card>

    <UserDetail ref="userDetail"></UserDetail>
    <CoinsModal ref="coinsModal"></CoinsModal>
    <SendCoinsModal ref="sendCoinsModal"></SendCoinsModal>
    <ChangeIdentityModal ref="changeIdentityModal"></ChangeIdentityModal>
    <MuteModal ref="muteModal"></MuteModal>
    <AddUserModal ref="addUserModal"></AddUserModal>
  </div>
</template>

<script>
import UserDetail from './handle/userDetail';
import CoinsModal from './handle/coinsModal';
import SendCoinsModal from './handle/sendCoinsModal';
import ChangeIdentityModal from './handle/changeIdentityModal';
import MuteModal from './handle/muteModal';
import AddUserModal from './handle/addUserModal';
import AnnotationPanel from '@/components/annotation/AnnotationPanel.vue';
import AnnotationMarker from '@/components/annotation/AnnotationMarker.vue';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'UserListNew',
  components: { 
    UserDetail, 
    CoinsModal, 
    SendCoinsModal, 
    ChangeIdentityModal, 
    MuteModal, 
    AddUserModal,
    AnnotationPanel,
    AnnotationMarker,
    AnnotationHighlight,
    AnnotationPoint
  },
  data() {
    return {
      collapse: false,
      loading: false,
      total: 10,
      selectionList: [],
      selectedIds: [],
      ids: [],
      
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      annotations: annotationData.annotations,
      
      headeNum: [
        { type: '', name: '全部', count: 1730 },
        { type: 'wechat', name: '微信公众号', count: 300 },
        { type: 'routine', name: '微信小程序', count: 600 },
        { type: 'h5', name: 'H5', count: 300 },
        { type: 'app', name: 'APP', count: 500 },
        { type: 'pc', name: 'PC', count: 30 },
      ],
      
      userFrom: {
        keyword: '',
        level: '',
        identity: '',
        accountStatus: '',
        muteStatus: '',
        dateRange: [],
        user_type: '',
        page: 1,
        limit: 15
      },
      
      userLists: [
        {
          id: 1,
          userId: 'U20260001',
          nickname: '小明同学',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20young%20man%20cartoon%20style&image_size=square',
          phone: '138****1234',
          level: 'Lv3',
          source: '微信小程序',
          balance: 1256.78,
          inviteCode: 'ABC123',
          identity: 'user',
          accountStatus: 'normal',
          muteStatus: 'normal',
          createTime: '2026-06-06 11:37:07'
        },
        {
          id: 2,
          userId: 'U20260002',
          nickname: '美食达人',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20young%20woman%20cartoon%20style&image_size=square',
          phone: '139****5678',
          level: 'Lv5',
          source: 'APP',
          balance: 5890.00,
          inviteCode: 'DEF456',
          identity: 'anchor',
          accountStatus: 'normal',
          muteStatus: 'temporary',
          createTime: '2026-06-05 09:23:45'
        },
        {
          id: 3,
          userId: 'U20260003',
          nickname: '运动健将',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20sporty%20man%20cartoon%20style&image_size=square',
          phone: '137****9012',
          level: 'Lv2',
          source: 'H5',
          balance: 320.50,
          inviteCode: '',
          identity: 'user',
          accountStatus: 'disabled',
          muteStatus: 'normal',
          createTime: '2026-06-04 14:56:12'
        },
        {
          id: 4,
          userId: 'U20260004',
          nickname: '美妆博主',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20beautiful%20woman%20cartoon%20style&image_size=square',
          phone: '136****3456',
          level: 'Lv4',
          source: '微信公众号',
          balance: 12345.67,
          inviteCode: 'GHI789',
          identity: 'anchor',
          accountStatus: 'normal',
          muteStatus: 'permanent',
          createTime: '2026-06-03 16:28:33'
        },
        {
          id: 5,
          userId: 'U20260005',
          nickname: '旅行家',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20traveler%20man%20cartoon%20style&image_size=square',
          phone: '135****7890',
          level: 'Lv1',
          source: 'PC',
          balance: 89.99,
          inviteCode: 'JKL012',
          identity: 'user',
          accountStatus: 'cancelled',
          muteStatus: 'normal',
          createTime: '2026-06-02 10:15:47'
        },
        {
          id: 6,
          userId: 'U20260006',
          nickname: '音乐爱好者',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20music%20lover%20cartoon%20style&image_size=square',
          phone: '134****2345',
          level: 'Lv3',
          source: '微信小程序',
          balance: 678.00,
          inviteCode: '',
          identity: 'user',
          accountStatus: 'normal',
          muteStatus: 'normal',
          createTime: '2026-06-01 08:42:19'
        },
        {
          id: 7,
          userId: 'U20260007',
          nickname: '游戏主播',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20gamer%20young%20man%20cartoon%20style&image_size=square',
          phone: '133****6789',
          level: 'Lv5',
          source: 'APP',
          balance: 88888.88,
          inviteCode: 'MNO345',
          identity: 'anchor',
          accountStatus: 'normal',
          muteStatus: 'normal',
          createTime: '2026-05-31 19:30:55'
        },
        {
          id: 8,
          userId: 'U20260008',
          nickname: '读书达人',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20reader%20woman%20cartoon%20style&image_size=square',
          phone: '132****0123',
          level: 'Lv2',
          source: 'H5',
          balance: 450.00,
          inviteCode: 'PQR678',
          identity: 'user',
          accountStatus: 'normal',
          muteStatus: 'temporary',
          createTime: '2026-05-30 11:22:33'
        },
        {
          id: 9,
          userId: 'U20260009',
          nickname: '美食主播',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20foodie%20woman%20cartoon%20style&image_size=square',
          phone: '131****4567',
          level: 'Lv4',
          source: '微信公众号',
          balance: 23456.00,
          inviteCode: 'STU901',
          identity: 'anchor',
          accountStatus: 'disabled',
          muteStatus: 'normal',
          createTime: '2026-05-29 15:18:00'
        },
        {
          id: 10,
          userId: 'U20260010',
          nickname: '科技控',
          avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=avatar%20portrait%20tech%20geek%20man%20cartoon%20style&image_size=square',
          phone: '130****8901',
          level: 'Lv1',
          source: 'PC',
          balance: 150.75,
          inviteCode: '',
          identity: 'user',
          accountStatus: 'normal',
          muteStatus: 'permanent',
          createTime: '2026-05-28 09:05:22'
        }
      ]
    };
  },
  methods: {
    sortByLevel(a, b) {
      const levelMap = { 'Lv1': 1, 'Lv2': 2, 'Lv3': 3, 'Lv4': 4, 'Lv5': 5 };
      return (levelMap[a.level] || 0) - (levelMap[b.level] || 0);
    },
    getStatusText(status) {
      const map = {
        normal: '正常',
        disabled: '禁用',
        cancelled: '注销'
      };
      return map[status] || status;
    },
    getMuteText(status) {
      const map = {
        normal: '正常',
        temporary: '临时禁言',
        permanent: '永久禁言'
      };
      return map[status] || status;
    },
    isSel(row) {
      return row.accountStatus !== 'cancelled';
    },
    userSearchs() {
      this.ids = [];
      this.selectedIds = [];
      this.selectionList = [];
      this.userFrom.page = 1;
      this.getList();
    },
    reset(name) {
      this.userFrom = {
        keyword: '',
        level: '',
        identity: '',
        accountStatus: '',
        muteStatus: '',
        dateRange: [],
        user_type: '',
        page: 1,
        limit: 15
      };
      this.selectedIds = new Set();
      this.getList();
    },
    getList() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    pageChange() {
      this.selectionList = [];
      this.getList();
    },
    sortChanged(e) {
      this.userFrom[e.prop] = e.order;
      this.getList();
    },
    handleSelectRow(selection, row) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.$nextTick(() => {
        this.setChecked();
      });
    },
    handleSelectAll(selection) {
      let ids = [];
      selection.map((e) => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.$nextTick(() => {
        this.setChecked();
      });
    },
    setChecked() {
      this.ids = [...this.selectedIds];
      let objData = this.$refs.table?.objData;
      if (!objData) return;
      for (let index in objData) {
        if (this.selectedIds.includes(objData[index].id)) {
          objData[index]._isChecked = true;
        }
      }
    },
    userDetail(row) {
      this.$refs.userDetail.open(row);
    },
    handleAdd() {
      this.$refs.addUserModal.open();
    },
    exportList() {
      this.$message.info('导出用户列表');
    },
    onClickTab() {
      this.userFrom.page = 1;
      this.getList();
    },
    changeMenu(row, name) {
      switch (name) {
        case 'coins':
          this.openCoinsModal(row);
          break;
        case 'sendCoins':
          this.openSendCoinsModal(row);
          break;
        case 'changeIdentity':
          this.changeUserIdentity(row);
          break;
        case 'mute':
          this.muteUser(row);
          break;
        case 'unmute':
          this.unmuteUser(row);
          break;
        case 'disable':
          this.disableUser(row);
          break;
        case 'enable':
          this.enableUser(row);
          break;
      }
    },
    openCoinsModal(row) {
      this.$refs.coinsModal.open(row);
    },
    openSendCoinsModal(row) {
      this.$refs.sendCoinsModal.open(row);
    },
    changeUserIdentity(row) {
      this.$refs.changeIdentityModal.open(row);
    },
    changeUserIdentityDirect(row, identity) {
      row.identity = identity;
    },
    muteUser(row) {
      this.$refs.muteModal.open(row);
    },
    unmuteUser(row) {
      this.$confirm(`确定要解除用户 ${row.nickname} 的禁言吗?`, '提示', {
        type: 'warning'
      }).then(() => {
        row.muteStatus = 'normal';
        this.$message.success('禁言已解除');
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    },
    disableUser(row) {
      this.$confirm(`确定要禁用用户 ${row.nickname} 吗?`, '提示', {
        type: 'warning'
      }).then(() => {
        row.accountStatus = 'disabled';
        this.$message.success('用户已禁用');
      }).catch(() => {
        this.$message.info('已取消禁用');
      });
    },
    enableUser(row) {
      this.$confirm(`确定要启用用户 ${row.nickname} 吗?`, '提示', {
        type: 'warning'
      }).then(() => {
        row.accountStatus = 'normal';
        this.$message.success('用户已启用');
      }).catch(() => {
        this.$message.info('已取消操作');
      });
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
      if (activeMarker) activeMarker.classList.add('active');
    },
    handleToggleMarkers(visible) {
      this.showMarkers = visible;
    }
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  created() {
    this.getList();
  }
};
</script>

<style scoped lang="scss">
::v-deep .el-tabs__item {
  height: 54px !important;
  line-height: 54px !important;
}

.userAlert {
  margin-top: 20px;
}

.userI {
  color: var(--prev-color-primary);
  font-style: normal;
}

img {
  height: 36px;
  display: block;
}

.tabBox_img {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.tabBox_tit {
  width: 60%;
  font-size: 12px !important;
  margin: 0 2px 0 10px;
  letter-spacing: 1px;
  padding: 5px 0;
  box-sizing: border-box;
}

.level-tag {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.balance {
  color: #e6a23c;
  font-weight: 500;
}

.identity-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &.user {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.anchor {
    background: #fce4ec;
    color: #c2185b;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &.normal {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.disabled {
    background: #fff3e0;
    color: #e65100;
  }
  
  &.cancelled {
    background: #f5f5f5;
    color: #9e9e9e;
  }
}

.mute-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &.normal {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  &.temporary {
    background: #fff3e0;
    color: #e65100;
  }
  
  &.permanent {
    background: #ffebee;
    color: #c62828;
  }
}

.search-form {
  display: flex;
  justify-content: space-between;

  .search-form-box {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
}

.search-form-sub {
  display: flex;
}

.user-list-page {
  position: relative;
  min-height: 100vh;
  
  &.annotation-mode {
    padding-right: 380px;
  }
}

.annotation-control {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  
  .annotation-toggle-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }
  }
}

.annotation-panel-wrapper {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 1000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
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