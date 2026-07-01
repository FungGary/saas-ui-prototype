<template>
  <div style="width: 100%">
    <el-drawer :visible.sync="modals" title="用户详情" :wrapperClosable="true" :size="1200" :mask-opacity="0.5" @closed="onClose">
      <AnnotationHighlight />
      <div class="user-detail-header">
        <div class="avatar-wrap">
          <img :src="userInfo.avatar" />
        </div>
        <div class="user-info-wrap">
          <p class="user-nickname">{{ userInfo.nickname }}</p>
          <p class="user-id">ID {{ userInfo.userId }}</p>
        </div>
        <div class="edit-btn-wrap">
          <el-button type="primary" v-db-click @click="handleEdit">编辑</el-button>
        </div>
      </div>

      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-label">金币</span>
          <span class="stat-value gold">{{ userInfo.gold.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总订单</span>
          <span class="stat-value">{{ userInfo.totalOrders }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总充值金额</span>
          <span class="stat-value">{{ userInfo.totalRecharge.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">积分</span>
          <span class="stat-value">{{ userInfo.integral }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">本月订单</span>
          <span class="stat-value">{{ userInfo.monthOrders }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">本月充值金额</span>
          <span class="stat-value">{{ userInfo.monthRecharge.toFixed(2) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">抓中次数</span>
          <span class="stat-value">{{ userInfo.catchCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">抓中总成本</span>
          <span class="stat-value">{{ userInfo.catchCost.toFixed(2) }}</span>
        </div>
      </div>

      <el-tabs type="border-card" v-model="activeTab" class="detail-tabs" id="detail-tabs-optimize">
        <el-tab-pane name="info" label="用户信息">
          <div class="info-section">
            <h4 class="section-title">基本信息</h4>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">用户昵称：</span>
                <span class="info-value">{{ userInfo.nickname }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">真实姓名：</span>
                <span class="info-value">{{ userInfo.realName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">身份证号：</span>
                <span class="info-value">{{ userInfo.idCard || '-' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">生日：</span>
                <span class="info-value">{{ userInfo.birthday || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">手机号码：</span>
                <span class="info-value">{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">默认地址：</span>
                <span class="info-value">{{ userInfo.address || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">密码</h4>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">登录密码：</span>
                <span class="info-value">********</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">用户概况</h4>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">用户等级：</span>
                <span class="info-value">{{ userInfo.level }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户身份：</span>
                <span class="info-value">{{ getUserIdentity(userInfo.identity) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用户状态：</span>
                <span class="info-value">{{ getUserStatusText(userInfo.accountStatus) }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">用户经验值：</span>
                <span class="info-value">{{ userInfo.exp }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">注册来源：</span>
                <span class="info-value">{{ userInfo.source }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">邀请人数：</span>
                <span class="info-value">{{ userInfo.inviteCount }}人</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">注册时间：</span>
                <span class="info-value">{{ userInfo.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">登录时间：</span>
                <span class="info-value">{{ userInfo.loginTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后抓取时间：</span>
                <span class="info-value">{{ userInfo.lastCatchTime }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4 class="section-title">用户备注</h4>
            <div class="info-row">
              <div class="info-item full-width">
                <span class="info-label">备注：</span>
                <span class="info-value">{{ userInfo.remark || '-' }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="coin" label="投币统计">
          <div class="stats-summary">
            <div class="summary-card">
              <div class="summary-icon blue">
                <i class="el-icon-gamepad"></i>
              </div>
              <div class="summary-info">
                <div class="summary-label">总游戏局数</div>
                <div class="summary-value">{{ coinStats.totalGames }}</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon orange">
                <i class="el-icon-coins"></i>
              </div>
              <div class="summary-info">
                <div class="summary-label">总消费币数</div>
                <div class="summary-value">{{ coinStats.totalCoins }}</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon green">
                <i class="el-icon-gift"></i>
              </div>
              <div class="summary-info">
                <div class="summary-label">总奖品数</div>
                <div class="summary-value">{{ coinStats.totalPrizes }}</div>
              </div>
            </div>
          </div>

          <div class="filter-bar">
            <el-form :model="coinForm" inline>
              <el-form-item>
                <el-date-picker
                  v-model="coinForm.dateRange"
                  type="daterange"
                  range-separator=" - "
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  class="date-range-picker"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="机台编号">
                <el-select v-model="coinForm.machineNo" placeholder="请选择" clearable class="machine-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="机台1"></el-option>
                  <el-option value="2" label="机台2"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button class="reset-btn" @click="resetCoinForm">重置</el-button>
                <el-button type="primary" @click="queryCoinData">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="coinList" class="detail-table" v-loading="loading">
            <el-table-column label="机台编号" prop="machineNo" />
            <el-table-column label="房间名称" prop="roomName" />
            <el-table-column label="玩法类型" prop="gameType" />
            <el-table-column label="游戏局数" prop="gameCount" />
            <el-table-column label="投币数" prop="coinCount" />
            <el-table-column label="出货数量" prop="prizeCount" />
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button size="small" @click="viewPrizeDetail(scope.row)">奖品详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ coinTotal }} 条</span>
            <div class="pagination-right">
              <el-pagination
                :current-page="coinForm.page"
                :page-size="coinForm.limit"
                :total="coinTotal"
                layout="prev, pager, next, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="integral" label="积分明细">
          <el-table :data="integralList" class="detail-table" v-loading="loading">
            <el-table-column label="来源/用途" prop="title" />
            <el-table-column label="积分变化" width="120">
              <template slot-scope="scope">
                <span :class="getChangeClass(scope.row.change)">{{ scope.row.change }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变化后积分" prop="balance" />
            <el-table-column label="日期" prop="time" />
            <el-table-column label="备注" prop="remark" />
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ integralTotal }} 条</span>
            <div class="pagination-right">
              <el-pagination
                :current-page="integralForm.page"
                :page-size="integralForm.limit"
                :total="integralTotal"
                layout="prev, pager, next, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="gold" label="金币明细">
          <el-table :data="goldList" class="detail-table" v-loading="loading">
            <el-table-column label="动作" prop="title" />
            <el-table-column label="金币变动" width="120">
              <template slot-scope="scope">
                <span :class="getChangeClass(scope.row.change)">{{ scope.row.change }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变化后金币" prop="balance" />
            <el-table-column label="时间" prop="time" />
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ goldTotal }} 条</span>
            <div class="pagination-right">
              <el-pagination
                :current-page="goldForm.page"
                :page-size="goldForm.limit"
                :total="goldTotal"
                layout="prev, pager, next, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="invite" label="邀请好友">
          <el-table :data="inviteList" class="detail-table" v-loading="loading" empty-text="暂无数据">
            <el-table-column label="ID" prop="id" />
            <el-table-column label="昵称" prop="nickname" />
            <el-table-column label="等级" prop="level" />
            <el-table-column label="加入时间" prop="time" />
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ inviteTotal }} 条</span>
            <div class="pagination-right">
              <el-pagination
                :current-page="inviteForm.page"
                :page-size="inviteForm.limit"
                :total="inviteTotal"
                layout="prev, pager, next, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="backpack" id="detail-tab-backpack">
          <span slot="label" @click="handleTabClick('backpack')">
            背包记录
            <annotation-point 
              title="【新增】背包记录Tab" 
              content="优化前：用户详情中无背包记录Tab，无法查看用户背包中的奖品。&#10;&#10;优化后：新增'背包记录'Tab，可查看用户背包中的所有奖品记录。&#10;&#10;原因：便于运营了解用户的奖品库存情况，支持奖品发放、兑换等后续操作。" 
              priority="P0"
            />
          </span>
          <div class="filter-bar">
            <el-form :model="backpackForm" inline>
              <el-form-item label="用户搜索">
                <el-select v-model="backpackForm.user" placeholder="请选择" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="用户1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="房间信息">
                <el-select v-model="backpackForm.room" placeholder="请选择房间" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="房间1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="奖品">
                <el-select v-model="backpackForm.prize" placeholder="请选择商品" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="测试000"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="backpackForm.status" placeholder="全部" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="applied" label="已申请发货"></el-option>
                  <el-option value="system" label="系统发放"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="商品分类">
                <el-select v-model="backpackForm.category" placeholder="请选择" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="数码生活"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-date-picker
                  v-model="backpackForm.dateRange"
                  type="daterange"
                  range-separator=" - "
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="date-range-picker"
                ></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button class="reset-btn" @click="resetBackpackForm">重置</el-button>
                <el-button type="primary" @click="queryBackpackData">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-header">
            <span class="table-title">背包管理</span>
            <div class="header-actions">
              <el-button class="export-btn">导出</el-button>
              <el-button type="primary">添加</el-button>
            </div>
          </div>

          <el-table :data="backpackList" class="detail-table" v-loading="loading">
            <el-table-column label="ID" prop="id" width="60" />
            <el-table-column label="用户编号" prop="userNo" width="100" />
            <el-table-column label="用户信息" width="150">
              <template slot-scope="scope">
                <div class="user-info-cell">
                  <img :src="scope.row.avatar" class="small-avatar" />
                  <div class="user-text">
                    <div>{{ scope.row.nickname }}</div>
                    <div class="user-id-text">UID: {{ scope.row.userId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="房间信息" width="120">
              <template slot-scope="scope">
                <div v-if="scope.row.roomInfo" class="room-info-cell">
                  <img :src="scope.row.roomAvatar" class="small-avatar" />
                  <span>房间号: {{ scope.row.roomInfo }}</span>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="奖品信息" prop="prizeInfo" />
            <el-table-column label="商品分类" prop="category" />
            <el-table-column label="状态" prop="status" />
            <el-table-column label="来源" prop="source" />
            <el-table-column label="兑换积分" prop="integral" width="100" />
            <el-table-column label="获得时间" prop="obtainTime" />
            <el-table-column label="兑换时间" prop="exchangeTime" />
            <el-table-column label="过期时间" prop="expireTime" />
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button size="small" @click="viewBackpackDetail(scope.row)">详情</el-button>
                <el-button size="small" v-if="scope.row.canReturn" @click="returnBackpack(scope.row)">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ backpackTotal }} 条</span>
            <div class="pagination-right">
              <el-select v-model="backpackForm.limit" class="limit-select">
                <el-option :value="10" label="10条/页"></el-option>
                <el-option :value="20" label="20条/页"></el-option>
                <el-option :value="50" label="50条/页"></el-option>
              </el-select>
              <el-pagination
                :current-page="backpackForm.page"
                :page-size="backpackForm.limit"
                :total="backpackTotal"
                layout="prev, pager, next, ->, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="integralOrder" id="detail-tab-integral-order">
          <span slot="label" @click="handleTabClick('integralOrder')">
            积分订单记录
            <annotation-point 
              title="【新增】积分订单记录Tab" 
              content="优化前：用户详情中无积分订单记录Tab，无法查看用户的积分订单。&#10;&#10;优化后：新增'积分订单记录'Tab，可查看用户的所有积分订单记录。&#10;&#10;原因：便于运营了解用户的积分消费情况，支持订单查询、售后等后续操作。" 
              priority="P0"
            />
          </span>
          <div class="filter-bar">
            <el-form :model="integralOrderForm" inline>
              <el-form-item label="订单号">
                <el-input v-model="integralOrderForm.orderNo" placeholder="请输入订单号" class="order-input"></el-input>
              </el-form-item>
              <el-form-item label="用户">
                <el-select v-model="integralOrderForm.user" placeholder="请选择" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="用户1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="商品信息">
                <el-select v-model="integralOrderForm.product" placeholder="请点击选择商品" clearable class="filter-select">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="测试000"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-date-picker
                  v-model="integralOrderForm.dateRange"
                  type="daterange"
                  range-separator=" - "
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="date-range-picker"
                ></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button class="reset-btn" @click="resetIntegralOrderForm">重置</el-button>
                <el-button type="primary" @click="queryIntegralOrderData">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-header">
            <span class="table-title">积分订单</span>
            <div class="header-actions">
              <el-button class="export-btn">导出</el-button>
            </div>
          </div>

          <el-table :data="integralOrderList" class="detail-table" v-loading="loading">
            <el-table-column label="订单ID" prop="orderId" width="60" />
            <el-table-column label="订单号" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.orderNo }}</span>
                <span class="copy-icon">📋</span>
              </template>
            </el-table-column>
            <el-table-column label="用户编号" prop="userNo" width="100" />
            <el-table-column label="用户信息" width="150">
              <template slot-scope="scope">
                <div class="user-info-cell">
                  <img :src="scope.row.avatar" class="small-avatar" />
                  <div class="user-text">
                    <div>{{ scope.row.nickname }}</div>
                    <div class="user-id-text">UID: {{ scope.row.userId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" prop="productInfo" />
            <el-table-column label="兑换数量" prop="quantity" width="100" />
            <el-table-column label="商品单价(积分)" prop="unitPrice" width="120" />
            <el-table-column label="总价(积分)" prop="totalPrice" width="120" />
            <el-table-column label="下单时间" prop="createTime" />
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button size="small" @click="viewIntegralOrderDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ integralOrderTotal }} 条</span>
            <div class="pagination-right">
              <el-select v-model="integralOrderForm.limit" class="limit-select">
                <el-option :value="10" label="10条/页"></el-option>
                <el-option :value="20" label="20条/页"></el-option>
                <el-option :value="50" label="50条/页"></el-option>
              </el-select>
              <el-pagination
                :current-page="integralOrderForm.page"
                :page-size="integralOrderForm.limit"
                :total="integralOrderTotal"
                layout="prev, pager, next, ->, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="operationLog" id="detail-tab-operation-log">
          <span slot="label" @click.stop>
            操作日志
            <annotation-point 
              title="【新增】操作日志Tab" 
              content="优化前：用户详情中无操作日志Tab，无法查看用户的操作记录。&#10;&#10;优化后：新增'操作日志'Tab，可查看所有对该用户的操作记录，包括操作人、操作类型、操作内容、IP地址、操作时间等。&#10;&#10;原因：便于运营追溯用户相关的所有操作，满足审计和问题排查需求。" 
              priority="P0"
            />
          </span>
          <div class="backpack-section">
            <div class="section-header">
              <h4 class="section-title">操作日志</h4>
            </div>
            <el-table :data="operationLogList" style="width: 100%" :loading="operationLogLoading" border>
              <el-table-column prop="id" label="日志ID" width="80"></el-table-column>
              <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
              <el-table-column prop="action" label="操作类型" width="120"></el-table-column>
              <el-table-column prop="content" label="操作内容"></el-table-column>
              <el-table-column prop="ip" label="IP地址" width="130"></el-table-column>
              <el-table-column prop="createTime" label="操作时间" width="180"></el-table-column>
            </el-table>
            <div class="pagination-wrap">
              <el-pagination
                background
                :current-page="operationLogForm.page"
                :page-size="operationLogForm.limit"
                :total="operationLogTotal"
                layout="prev, pager, next, ->, jumper"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script>
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'UserDetail',
  components: { AnnotationHighlight, AnnotationPoint },
  data() {
    return {
      modals: false,
      loading: false,
      activeTab: 'info',
      userInfo: {},
      coinForm: {
        dateRange: [],
        machineNo: '',
        page: 1,
        limit: 10
      },
      integralForm: {
        page: 1,
        limit: 10
      },
      goldForm: {
        page: 1,
        limit: 10
      },
      inviteForm: {
        page: 1,
        limit: 10
      },
      backpackForm: {
        user: '',
        room: '',
        prize: '',
        status: '',
        category: '',
        dateRange: [],
        page: 1,
        limit: 10
      },
      integralOrderForm: {
        orderNo: '',
        user: '',
        product: '',
        dateRange: [],
        page: 1,
        limit: 10
      },
      coinStats: {
        totalGames: 0,
        totalCoins: 0,
        totalPrizes: 0
      },
      coinList: [],
      coinTotal: 1,
      integralList: [],
      integralTotal: 4,
      goldList: [],
      goldTotal: 16,
      inviteList: [],
      inviteTotal: 0,
      backpackList: [],
      backpackTotal: 2,
      integralOrderList: [],
      integralOrderTotal: 1,
      operationLogForm: {
        operator: '',
        action: '',
        dateRange: [],
        page: 1,
        limit: 10
      },
      operationLogList: [
        {
          id: 1,
          operator: 'admin',
          action: '修改身份',
          content: '将用户身份从【用户】修改为【主播】',
          ip: '192.168.1.100',
          createTime: '2024-01-15 14:30:00'
        },
        {
          id: 2,
          operator: 'admin',
          action: '禁言',
          content: '对用户进行禁言操作，禁言时长：7天，原因：发布违规内容',
          ip: '192.168.1.100',
          createTime: '2024-01-14 10:20:00'
        },
        {
          id: 3,
          operator: 'system',
          action: '派币',
          content: '平台补偿 +100金币',
          ip: '127.0.0.1',
          createTime: '2024-01-13 16:45:00'
        }
      ],
      operationLogTotal: 3,
      operationLogLoading: false
    };
  },
  methods: {
    handleTabClick(tabName) {
      this.activeTab = tabName;
    },
    getUserStatusText(status) {
      var map = {
        normal: '开启',
        disabled: '禁用',
        cancelled: '注销'
      };
      return map[status] || status;
    },
    getUserIdentity(identity) {
      return identity === 'user' ? '用户' : '主播';
    },
    getChangeClass(change) {
      return change.indexOf('+') === 0 ? 'positive' : 'negative';
    },
    open(row) {
      var _this = this;
      _this.modals = true;
      _this.loading = true;
      setTimeout(function() {
        _this.userInfo = {
          ...row,
          gold: row.balance * 10,
          totalOrders: Math.floor(Math.random() * 50),
          totalRecharge: row.balance * 2,
          integral: Math.floor(row.balance * 10),
          monthOrders: Math.floor(Math.random() * 10),
          monthRecharge: row.balance * 0.5,
          catchCount: Math.floor(Math.random() * 100),
          catchCost: row.balance * 0.3,
          realName: '',
          idCard: '',
          birthday: '',
          address: '广东省深圳市龙华区123',
          exp: 0,
          inviteCount: 0,
          loginTime: '2026-06-08 17:43:27',
          lastCatchTime: '2026-06-09 18:46:23',
          remark: ''
        };

        _this.coinStats = {
          totalGames: 0,
          totalCoins: 0,
          totalPrizes: 0
        };

        _this.coinList = [
          { machineNo: '1', roomName: '1', gameType: '玩法台', gameCount: 0, coinCount: 0, prizeCount: 0 },
          { machineNo: '1', roomName: '1', gameType: '玩法台', gameCount: 0, coinCount: 0, prizeCount: 0 }
        ];

        _this.integralList = [
          { title: '账户调整增加', change: '+9999', balance: 13909, time: '2026-06-08 14:02:03', remark: '后台系统调整' },
          { title: '账户调整增加', change: '+9999', balance: 13909, time: '2026-06-08 14:02:03', remark: '后台系统调整' },
          { title: '旗舰商城兑换礼品消耗', change: '-5990', balance: 3910, time: '2026-06-08 13:52:10', remark: '旗舰商城兑换礼品消耗' },
          { title: '自营商城兑换礼品消耗', change: '-100', balance: 9900, time: '2026-06-08 11:50:25', remark: '自营商城兑换礼品消耗' }
        ];

        _this.goldList = [
          { title: '抓娃娃消费', change: '-99', balance: 9394, time: '2026-06-09 18:46:23' },
          { title: '发货邮费支出', change: '-120', balance: 9493, time: '2026-06-09 15:55:11' },
          { title: '取消发货退还', change: '+120', balance: 9613, time: '2026-06-09 15:54:58' },
          { title: '取消发货退还', change: '+120', balance: 9493, time: '2026-06-09 15:52:58' },
          { title: '发货邮费支出', change: '-120', balance: 9493, time: '2026-06-09 15:52:04' },
          { title: '取消发货退还', change: '+120', balance: 9613, time: '2026-06-09 15:37:17' },
          { title: '取消发货退还', change: '+120', balance: 9493, time: '2026-06-09 15:35:14' },
          { title: '发货邮费支出', change: '-120', balance: 9373, time: '2026-06-09 15:30:01' },
          { title: '发货邮费支出', change: '-120', balance: 9493, time: '2026-06-09 15:30:01' },
          { title: '抓娃娃消费', change: '-99', balance: 9493, time: '2026-06-09 11:01:38' },
          { title: '抓娃娃消费', change: '-99', balance: 9592, time: '2026-06-09 11:01:28' },
          { title: '抓娃娃消费', change: '-99', balance: 9592, time: '2026-06-09 11:01:28' },
          { title: '抓娃娃消费', change: '-99', balance: 9691, time: '2026-06-09 11:01:16' }
        ];

        _this.inviteList = [];

        _this.backpackList = [
          {
            id: 789,
            userNo: '5916583368',
            avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20avatar%20pink%20background&image_size=square',
            nickname: '185****9966',
            userId: 101,
            roomInfo: '',
            roomAvatar: '',
            prizeInfo: '测试000\n商品ID: 87787',
            category: '数码生活/游戏点卡带.数码生活/大疆',
            status: '已申请发货',
            source: '积分兑换',
            integral: 0,
            obtainTime: '2026-06-08 11:50:25',
            exchangeTime: '-',
            expireTime: '2026-07-23 11:50:25',
            canReturn: false
          },
          {
            id: 788,
            userNo: '5916583368',
            avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20avatar%20pink%20background&image_size=square',
            nickname: '185****9966',
            userId: 101,
            roomInfo: '1',
            roomAvatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20avatar%20purple%20background&image_size=square',
            prizeInfo: 'JELLYCAT神话动物系列金龙王毛绒公仔12cm高999 - 副本\n商品ID: 87789',
            category: '12/123',
            status: '已申请发货',
            source: '系统发放',
            integral: 0,
            obtainTime: '2026-06-08 11:31:27',
            exchangeTime: '-',
            expireTime: '2026-07-23',
            canReturn: true
          }
        ];

        _this.integralOrderList = [
          {
            orderId: 4,
            orderNo: 'RZDIZ...73696',
            userNo: '5916583368',
            avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20avatar%20pink%20background&image_size=square',
            nickname: '185****9966',
            userId: 101,
            productInfo: '测试000\n商品ID: 87787',
            quantity: 1,
            unitPrice: '100.00',
            totalPrice: '100.00',
            createTime: '2026-06-08 11:50:25'
          }
        ];

        _this.loading = false;
      }, 300);
    },
    handleEdit() {
      this.$message.info('编辑用户');
    },
    onClose() {
      this.modals = false;
      this.activeTab = 'info';
    },
    resetCoinForm() {
      this.coinForm.dateRange = [];
      this.coinForm.machineNo = '';
    },
    queryCoinData() {
      var _this = this;
      _this.loading = true;
      setTimeout(function() {
        _this.loading = false;
      }, 300);
    },
    viewPrizeDetail(row) {
      this.$message.info('查看奖品详情: 机台' + row.machineNo);
    },
    resetBackpackForm() {
      this.backpackForm.user = '';
      this.backpackForm.room = '';
      this.backpackForm.prize = '';
      this.backpackForm.status = '';
      this.backpackForm.category = '';
      this.backpackForm.dateRange = [];
    },
    queryBackpackData() {
      var _this = this;
      _this.loading = true;
      setTimeout(function() {
        _this.loading = false;
      }, 300);
    },
    viewBackpackDetail(row) {
      this.$message.info('查看背包详情: ID' + row.id);
    },
    returnBackpack(row) {
      this.$message.info('驳回背包记录: ID' + row.id);
    },
    resetIntegralOrderForm() {
      this.integralOrderForm.orderNo = '';
      this.integralOrderForm.user = '';
      this.integralOrderForm.product = '';
      this.integralOrderForm.dateRange = [];
    },
    queryIntegralOrderData() {
      var _this = this;
      _this.loading = true;
      setTimeout(function() {
        _this.loading = false;
      }, 300);
    },
    viewIntegralOrderDetail(row) {
      this.$message.info('查看积分订单详情: ' + row.orderNo);
    }
  }
};
</script>

<style lang="scss" scoped>
.user-detail-header {
  display: flex;
  align-items: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info-wrap {
  flex: 1;

  .user-nickname {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 4px;
  }

  .user-id {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

.edit-btn-wrap {
  margin-left: auto;
}

.stats-card {
  display: flex;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: #fafafa;
  margin: 20px;
  border-radius: 8px;
}

.stat-item {
  width: 25%;
  text-align: center;
  padding: 8px 0;

  .stat-label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    &.gold {
      color: #e6a23c;
    }
  }
}

.detail-tabs {
  margin: 0 20px;
}

.info-section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-item {
  width: 33.33%;
  display: flex;
  align-items: center;
  padding: 4px 0;

  &.full-width {
    width: 100%;
  }

  .info-label {
    font-size: 13px;
    color: #909399;
    width: 100px;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 13px;
    color: #303133;
    flex: 1;
  }
}

.detail-table {
  margin-top: 20px;

  :deep(.positive) {
    color: #e6a23c;
  }

  :deep(.negative) {
    color: #67c23a;
  }
}

.stats-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;
  flex: 1;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;

  &.blue {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.orange {
    background: #fff3e0;
    color: #f57c00;
  }

  &.green {
    background: #e8f5e9;
    color: #388e3c;
  }
}

.summary-info {
  .summary-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .summary-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}

.filter-bar {
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.date-range-picker {
  width: 300px;
}

.machine-select {
  width: 180px;
}

.reset-btn {
  margin-right: 8px;
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.total-text {
  font-size: 13px;
  color: #606266;
}

.pagination-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.limit-select {
  width: 100px;
}

.filter-select {
  width: 140px;
}

.order-input {
  width: 160px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.export-btn {
  margin-right: 8px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.small-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-id-text {
  font-size: 12px;
  color: #909399;
}

.room-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.copy-icon {
  margin-left: 4px;
  cursor: pointer;
}

::v-deep .el-drawer__body {
  padding: 20px 0 !important;
}

::v-deep .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

::v-deep .el-tabs--border-card > .el-tabs__header,
::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item:active {
  border: none;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  border: none;
  border-top: 2px solid #409eff;
  font-weight: 500;
  color: #303133;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  border: none;
  margin-top: 0;
}

::v-deep .el-tabs--border-card {
  border: none;
  box-shadow: none;
}
</style>