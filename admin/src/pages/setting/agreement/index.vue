<template>
  <div class="agreement-management">
    <!-- 顶部类型筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt tab-card" :body-style="{ padding: '0 20px' }">
      <div class="tabs-with-annotation">
        <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
          <el-tab-pane
            :label="item.label"
            :name="item.value"
            v-for="(item, index) in categoryTabs"
            :key="index"
          />
        </el-tabs>
        <annotation-point
          title="【新增】协议类型筛选"
          content="优化前：所有协议混在一个列表中，没有类型筛选，协议数量多了以后查找和管理困难。&#10;&#10;优化后：新增协议类型筛选区，分为'全部、基础协议、玩法规则、权益规则、发货规则'五个类型Tab，点击可按类型快速筛选协议。&#10;&#10;原因：当前列表较长，后期协议数量会越来越多，类型管理便于运营快速定位目标协议，提升维护效率。"
          priority="P0"
        />
      </div>
    </el-card>

    <!-- 协议列表表格区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16">
      <div class="table-header-actions">
        <el-button type="primary" v-db-click @click="handleAdd">
          <i class="el-icon-plus"></i> 新增协议
        </el-button>
        <div class="header-annotation">
          <annotation-point
            title="【新增】新增协议入口"
            content="优化前：没有新增协议入口，协议只能通过后台配置生成。&#10;&#10;优化后：在列表页顶部新增'新增协议'按钮，点击跳转到新增协议页面，填写协议类型、标题、内容等信息后可创建新协议，新协议默认为草稿状态，版本号从 v1.0 开始。编辑完成后可选择'保存草稿'暂存或'去发布'进入发布流程。&#10;&#10;原因：业务运营需要快速创建新的协议类型，支持灵活扩展协议种类；二级页面提供更完整的编辑体验。"
            priority="P1"
          />
        </div>
      </div>
      <el-table
        class="mt14"
        :data="filteredList"
        ref="table"
        v-loading="loading"
        highlight-current-row
        no-userFrom-text="暂无数据"
        no-filtered-userFrom-text="暂无筛选结果"
      >
        <!-- 协议类型 -->
        <el-table-column min-width="120">
          <template slot="header">
            <span>协议类型</span>
            <annotation-point
              title="【新增】协议类型列"
              content="优化前：表格中没有协议类型列，无法直观看到每条协议所属的类型。&#10;&#10;优化后：新增'协议类型'列，显示每条协议所属的类型（基础协议、玩法规则、权益规则、发货规则）。&#10;&#10;协议类型说明：&#10;1. 类型数据来源于'协议类型管理'页面，可在设置-协议类型管理中维护&#10;2. 新增/编辑协议时，从类型字典中选择所属类型&#10;3. 类型支持增删改排序，调整后协议列表同步更新&#10;4. 顶部类型Tab筛选与表格类型列数据源一致&#10;&#10;原因：让运营在列表中就能直观识别协议类型，无需逐个点击查看，提升浏览效率。"
              priority="P1"
            />
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.category }}</span>
          </template>
        </el-table-column>

        <!-- 协议标题 -->
        <el-table-column label="协议标题" min-width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>

        <!-- 版本号（新增列） -->
        <el-table-column width="120" align="center">
          <template slot="header">
            <span>版本号</span>
            <annotation-point
              title="【新增】版本号列"
              content="优化前：没有版本管理，协议修改后直接覆盖，无法追溯版本变更，也无法控制客户端展示哪个版本。&#10;&#10;优化后：新增'版本号'列，显示每条协议的当前版本号，配合发布状态形成完整的版本管理机制。&#10;&#10;版本号命名规则：&#10;1. 格式：v主版本号.次版本号，如 v1.0、v1.2、v2.0&#10;2. 主版本号：重大结构调整或条款大面积变更时+1，次版本号归零（如 v1.9 → v2.0）&#10;3. 次版本号：局部修改、措辞调整、补充条款时+1（如 v1.0 → v1.1）&#10;4. 首次发布的版本号为 v1.0&#10;5. 同一协议的历史版本号不重复，每个版本号对应唯一一次发布记录&#10;&#10;版本升级通道：&#10;1. 草稿状态的协议，在操作列点击'发布'按钮，弹出版本升级选择弹窗&#10;2. 用户可自主选择'次版本升级'或'主版本升级'&#10;3. 系统实时预览升级后的版本号&#10;4. 选择升级类型并填写变更说明后点击确认发布&#10;5. 发布后版本号按所选类型递增，状态变为已发布&#10;&#10;版本发布规则说明：&#10;1. 【草稿】状态的版本仅后台可见，客户端不展示，不生效&#10;2. 【已发布】状态的版本才会展示给终端用户&#10;3. 修改协议保存为草稿后，客户端仍展示上一个已发布版本&#10;4. 点击发布并选择升级类型后，新版本才正式生效，客户端切换为新版本&#10;5. 历史版本保留留痕，可随时查看或回溯&#10;&#10;原因：协议是法律性文件，变更必须可追溯、可灰度、可回滚，版本管理是合规基础；由运营人员自主选择升级类型，更贴合实际业务场景。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span class="version-text">{{ scope.row.version }}</span>
          </template>
        </el-table-column>

        <!-- 发布状态（新增列，彩色Tag渲染） -->
        <el-table-column width="120" align="center">
          <template slot="header">
            <span>发布状态</span>
            <annotation-point
              title="【新增】发布状态列"
              content="优化前：没有状态管理，协议编辑后直接生效，无法区分草稿和已发布状态，修改过程中可能将未完善的内容展示给用户。&#10;&#10;优化后：新增'发布状态'列，用彩色标签显示协议状态（已发布-绿色、草稿-灰色）。&#10;&#10;状态规则与客户端展示关系：&#10;1. 【草稿】灰色：编辑中暂存状态，仅后台可见，客户端不展示该版本内容&#10;2. 【已发布】绿色：正式生效状态，客户端展示该版本的协议内容&#10;3. 修改已发布的协议后保存，新版本自动为草稿态，客户端仍展示上一个已发布版本&#10;4. 只有点击'发布'操作后，新版本才变为已发布状态，客户端才会更新&#10;5. 每条协议同时只能有一个已发布版本，历史版本均为归档状态&#10;&#10;原因：协议变更需要审核流程，支持草稿态便于编辑中暂存，确认无误后再发布，避免未完善内容直接暴露给用户。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              effect="light"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 修改时间 -->
        <el-table-column label="修改时间" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime }}</span>
          </template>
        </el-table-column>

        <!-- 操作列（增强：设置 + 发布 + 历史版本） -->
        <el-table-column fixed="right" width="280" align="center">
          <template slot="header">
            <span>操作</span>
            <annotation-point
              title="【新增/优化】操作列增强"
              content="优化前：只有'设置'一个操作入口，功能单一。&#10;&#10;优化后：&#10;1. 保留原有'设置'入口，用于编辑协议内容&#10;2. 新增'发布'按钮（仅草稿状态显示），点击弹出版本升级选择弹窗，可选主版本升级或次版本升级&#10;3. 新增'历史版本'入口，点击打开历史版本记录弹窗，查看历次变更&#10;&#10;原因：协议变更需要留痕，历史版本功能支持查看过往版本、对比变更、回溯旧版，满足合规和审计需求；发布操作支持选择版本升级类型，满足不同变更场景的版本管理需求。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <a v-db-click @click="handleSetting(scope.row)">设置</a>
            <el-divider direction="vertical"></el-divider>
            <a
              v-if="scope.row.status === 'draft'"
              v-db-click
              @click="handlePublish(scope.row)"
              class="text-primary"
            >发布</a>
            <template v-else>
              <span class="text-disabled">已发布</span>
            </template>
            <el-divider direction="vertical"></el-divider>
            <a v-db-click @click="handleHistory(scope.row)">历史版本</a>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页器 -->
      <div class="acea-row row-right page">
        <pagination
          v-if="total > 0"
          :total="total"
          :page.sync="pagination.page"
          :limit.sync="pagination.limit"
          @pagination="handlePagination"
        />
      </div>
    </el-card>

    <!-- 历史版本弹窗 -->
    <el-dialog
      :visible.sync="historyDialogVisible"
      title="历史版本记录"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentAgreement">
        <div class="history-header">
          <span class="history-title">协议名称：{{ currentAgreement.title }}</span>
          <div class="history-header-annotation">
            <annotation-point
              title="【新增】历史版本弹窗"
              content="优化前：没有历史版本管理，协议修改后直接覆盖，无法查看和回溯过往版本。&#10;&#10;优化后：新增历史版本记录弹窗，展示该协议的所有历史版本，包含版本号、发布状态、发布时间、修改人、变更说明，支持查看历史版本详情。&#10;&#10;版本记录规则：&#10;1. 每次发布都会生成一条版本记录，版本号唯一不重复&#10;2. 版本号按 v主版本号.次版本号 规则递增，如 v1.0 → v1.1 → v2.0&#10;3. 同一协议同时只能有一个【已发布】状态的版本，其余均为历史归档版本或草稿版本&#10;4. 草稿版本只有最新的一个，发布后草稿变为已发布，原已发布版本自动变为历史归档&#10;5. 历史版本仅支持查看，不可修改，保证变更留痕可审计&#10;&#10;原因：协议是法律性文件，每次变更必须留痕，历史版本功能满足合规审计要求，支持版本回溯和变更追溯。"
              priority="P0"
            />
          </div>
          <span class="history-count">共 {{ historyList.length }} 个历史版本</span>
        </div>
        <el-table
          :data="historyList"
          border
          size="small"
        >
          <el-table-column label="版本号" width="120" align="center">
            <template slot-scope="scope">
              <span class="version-text">{{ scope.row.version }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发布状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag
              :type="getStatusTagType(scope.row.status)"
              effect="light"
              size="mini"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
          </el-table-column>
          <el-table-column label="发布时间" min-width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.publishTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="修改人" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.operator }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变更说明" min-width="250">
            <template slot-scope="scope">
              <span>{{ scope.row.remark }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <a v-db-click @click="handleViewVersion(scope.row)">查看</a>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="historyDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 发布协议弹窗（版本升级选择） -->
    <el-dialog
      :visible.sync="publishDialogVisible"
      title="发布协议"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="publishAgreement">
        <div class="publish-info">
          <p><span class="label">协议名称：</span>{{ publishAgreement.title }}</p>
          <p><span class="label">当前版本：</span>{{ publishAgreement.version }}（草稿）</p>
          <p><span class="label">发布后状态：</span>
            <el-tag type="success" size="small">已发布</el-tag>
          </p>
        </div>
        <el-divider />
        <el-form :model="publishForm" label-width="120px">
          <el-form-item label="版本升级类型" required>
            <el-radio-group v-model="publishForm.upgradeType">
              <el-radio label="minor">
                次版本升级
                <span class="upgrade-hint">（{{ publishAgreement.version }} → {{ nextMinorVersion }}）</span>
              </el-radio>
              <el-radio label="major">
                主版本升级
                <span class="upgrade-hint">（{{ publishAgreement.version }} → {{ nextMajorVersion }}）</span>
              </el-radio>
            </el-radio-group>
            <div class="form-tip">
              <p>· <strong>次版本升级</strong>：局部修改、措辞调整、补充条款等小范围变更</p>
              <p>· <strong>主版本升级</strong>：重大结构调整、条款大面积变更、整体改版</p>
            </div>
          </el-form-item>
          <el-form-item label="变更说明">
            <el-input
              type="textarea"
              v-model="publishForm.remark"
              :rows="3"
              placeholder="请输入本次发布的变更说明"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="publishDialogVisible = false">取 消</el-button>
        <el-button type="primary" v-db-click @click="confirmPublish">确认发布</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 协议管理页面
 * 功能：协议类型筛选、版本管理、发布状态展示、历史版本查看
 */
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';

export default {
  name: 'AgreementManagement',
  components: {
    AnnotationPoint
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 当前选中的类型（用于Tabs筛选）
      activeCategory: 'all',
      // 类型Tab配置
      categoryTabs: [
        { label: '全部', value: 'all' },
        { label: '基础协议', value: 'basic' },
        { label: '玩法规则', value: 'gameplay' },
        { label: '权益规则', value: 'benefit' },
        { label: '发货规则', value: 'shipping' }
      ],
      // 分页配置
      pagination: {
        page: 1,
        limit: 10
      },
      // 总条数
      total: 0,
      // Mock数据源 - 协议列表数据
      agreementList: [
        {
          id: 1,
          category: '基础协议',
          categoryKey: 'basic',
          title: '用户服务协议',
          version: 'v2.0',
          status: 'published',
          updateTime: '2026-06-23 17:41:04'
        },
        {
          id: 2,
          category: '基础协议',
          categoryKey: 'basic',
          title: '隐私政策',
          version: 'v1.5',
          status: 'published',
          updateTime: '2026-06-17 16:20:20'
        },
        {
          id: 3,
          category: '基础协议',
          categoryKey: 'basic',
          title: '房间-用户须知',
          version: 'v1.0',
          status: 'draft',
          updateTime: '2026-06-15 10:30:00'
        },
        {
          id: 4,
          category: '权益规则',
          categoryKey: 'benefit',
          title: '积分兑换商品规则',
          version: 'v2.1.1',
          status: 'published',
          updateTime: '2026-06-20 14:25:30'
        },
        {
          id: 5,
          category: '权益规则',
          categoryKey: 'benefit',
          title: '赠与必读协议',
          version: 'v1.2',
          status: 'published',
          updateTime: '2026-06-18 09:15:00'
        },
        {
          id: 6,
          category: '玩法规则',
          categoryKey: 'gameplay',
          title: '转盘活动规则',
          version: 'v1.0',
          status: 'draft',
          updateTime: '2026-06-22 11:00:00'
        },
        {
          id: 7,
          category: '玩法规则',
          categoryKey: 'gameplay',
          title: '任务抽奖规则',
          version: 'v1.3',
          status: 'published',
          updateTime: '2026-06-19 16:40:20'
        },
        {
          id: 8,
          category: '发货规则',
          categoryKey: 'shipping',
          title: '发货协议',
          version: 'v1.0',
          status: 'published',
          updateTime: '2026-06-16 13:20:00'
        },
        {
          id: 9,
          category: '基础协议',
          categoryKey: 'basic',
          title: '账号注销规则',
          version: 'v2.0.1',
          status: 'draft',
          updateTime: '2026-06-16 16:48:29'
        },
        {
          id: 10,
          category: '玩法规则',
          categoryKey: 'gameplay',
          title: '排行榜规则',
          version: 'v1.1',
          status: 'published',
          updateTime: '2026-06-14 15:30:00'
        },
        {
          id: 11,
          category: '基础协议',
          categoryKey: 'basic',
          title: '注销协议',
          version: 'v1.0',
          status: 'published',
          updateTime: '2026-06-16 16:49:15'
        },
        {
          id: 12,
          category: '玩法规则',
          categoryKey: 'gameplay',
          title: '房间-保送规则',
          version: 'v1.0',
          status: 'draft',
          updateTime: '2026-06-21 08:50:00'
        },
        {
          id: 13,
          category: '玩法规则',
          categoryKey: 'gameplay',
          title: '开始游戏规则',
          version: 'v2.0',
          status: 'published',
          updateTime: '2026-06-17 10:10:10'
        },
        {
          id: 14,
          category: '基础协议',
          categoryKey: 'basic',
          title: '抓娃娃服务协议',
          version: 'v1.0',
          status: 'published',
          updateTime: '2026-06-13 14:00:00'
        },
        {
          id: 15,
          category: '权益规则',
          categoryKey: 'benefit',
          title: '商品兑换积分规则',
          version: 'v1.2',
          status: 'published',
          updateTime: '2026-06-15 17:20:00'
        },
        {
          id: 16,
          category: '权益规则',
          categoryKey: 'benefit',
          title: '受赠说明',
          version: 'v1.0',
          status: 'draft',
          updateTime: '2026-06-22 13:30:00'
        },
        {
          id: 17,
          category: '权益规则',
          categoryKey: 'benefit',
          title: '赠送说明',
          version: 'v1.0',
          status: 'published',
          updateTime: '2026-06-12 09:00:00'
        }
      ],
      // 历史版本弹窗
      historyDialogVisible: false,
      // 当前查看的协议
      currentAgreement: null,
      // 历史版本列表数据
      historyList: [],
      // 发布协议弹窗
      publishDialogVisible: false,
      // 当前发布的协议
      publishAgreement: null,
      // 发布表单
      publishForm: {
        upgradeType: 'minor',
        remark: '',
      },
    };
  },
  computed: {
    /**
     * 计算次版本升级后的版本号
     */
    nextMinorVersion() {
      if (!this.publishAgreement) return '';
      return this.getNextVersion(this.publishAgreement.version, 'minor');
    },
    /**
     * 计算主版本升级后的版本号
     */
    nextMajorVersion() {
      if (!this.publishAgreement) return '';
      return this.getNextVersion(this.publishAgreement.version, 'major');
    },
    /**
     * 根据当前选中的类型过滤列表数据
     * 实现Tabs与表格数据的联动过滤逻辑
     */
    filteredList() {
      let list = this.agreementList;
      // 按类型筛选
      if (this.activeCategory !== 'all') {
        list = list.filter(item => item.categoryKey === this.activeCategory);
      }
      // 更新总条数
      this.total = list.length;
      // 分页处理
      const start = (this.pagination.page - 1) * this.pagination.limit;
      const end = start + this.pagination.limit;
      return list.slice(start, end);
    }
  },
  created() {
    this.total = this.agreementList.length;
  },
  methods: {
    /**
     * 类型Tab切换事件
     * 切换类型时重置页码为第一页
     */
    handleCategoryChange() {
      this.pagination.page = 1;
    },

    /**
     * 根据状态获取Tag的类型（颜色）
     * published: 已发布 - 绿色（success）
     * draft: 草稿 - 灰色（info）
     */
    getStatusTagType(status) {
      const statusMap = {
        published: 'success',
        draft: 'info'
      };
      return statusMap[status] || 'info';
    },

    /**
     * 获取状态显示文本
     */
    getStatusText(status) {
      const textMap = {
        published: '已发布',
        draft: '草稿'
      };
      return textMap[status] || status;
    },

    /**
     * 分页变化处理
     */
    handlePagination() {
      // 分页变化时无需额外处理，filteredList 计算属性会自动更新
    },

    /**
     * 计算下一个版本号
     * type: minor 次版本升级, major 主版本升级
     */
    getNextVersion(version, type) {
      const parts = version.replace('v', '').split('.');
      const major = parseInt(parts[0]) || 0;
      const minor = parseInt(parts[1]) || 0;
      if (type === 'major') {
        return 'v' + (major + 1) + '.0';
      }
      return 'v' + major + '.' + (minor + 1);
    },

    /**
     * 新增协议按钮点击事件
     * 跳转到新增协议页面
     */
    handleAdd() {
      this.$router.push({
        path: '/admin/setting/agreement/create'
      });
    },

    /**
     * 发布按钮点击事件
     * 打开发布确认弹窗，选择版本升级类型
     */
    handlePublish(row) {
      this.publishAgreement = row;
      this.publishForm = {
        upgradeType: 'minor',
        remark: '',
      };
      this.publishDialogVisible = true;
    },

    /**
     * 确认发布
     */
    confirmPublish() {
      const newVersion = this.publishForm.upgradeType === 'major'
        ? this.nextMajorVersion
        : this.nextMinorVersion;
      const now = this.$formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
      const index = this.agreementList.findIndex(item => item.id === this.publishAgreement.id);
      if (index > -1) {
        this.agreementList[index].version = newVersion;
        this.agreementList[index].status = 'published';
        this.agreementList[index].updateTime = now;
      }
      this.publishDialogVisible = false;
      this.$message.success(`发布成功，版本已升级为 ${newVersion}`);
    },

    /**
     * 设置按钮点击事件
     * 跳转到协议编辑页
     */
    handleSetting(row) {
      this.$router.push({
        path: `/admin/setting/agreement/edit/${row.id}`
      });
    },

    /**
     * 历史版本按钮点击事件
     * 打开历史版本弹窗，展示该协议的历次变更记录
     */
    handleHistory(row) {
      this.currentAgreement = row;
      // Mock历史版本数据
      this.historyList = [
        {
          id: 1,
          version: row.version,
          status: row.status,
          publishTime: row.updateTime,
          operator: '管理员',
          remark: '当前生效版本'
        },
        {
          id: 2,
          version: this.getPreviousVersion(row.version),
          status: 'published',
          publishTime: '2026-06-10 14:30:00',
          operator: '张运营',
          remark: '优化条款表述，修正部分措辞'
        },
        {
          id: 3,
          version: this.getPreviousVersion(this.getPreviousVersion(row.version)),
          status: 'published',
          publishTime: '2026-05-20 09:15:00',
          operator: '李产品',
          remark: '首次发布'
        }
      ];
      this.historyDialogVisible = true;
    },

    /**
     * 生成上一个版本号（Mock用）
     * 版本号规则：主版本号.次版本号，如 v1.0、v1.1、v2.0
     * 递减规则：次版本号>0时次版本号-1，次版本号=0时主版本号-1且次版本号设为9
     * 最低版本为 v0.1
     */
    getPreviousVersion(version) {
      const parts = version.replace('v', '').split('.');
      const major = parseInt(parts[0]) || 0;
      const minor = parseInt(parts[1]) || 0;
      if (minor > 0) {
        return 'v' + major + '.' + (minor - 1);
      } else if (major > 0) {
        return 'v' + (major - 1) + '.9';
      }
      return 'v0.1';
    },

    /**
     * 查看某个历史版本详情
     */
    handleViewVersion(row) {
      this.$message.info(`查看版本：${row.version}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.agreement-management {
  .tab-card {
    ::v-deep .el-tabs__item {
      height: 54px !important;
      line-height: 54px !important;
      font-size: 14px;
    }
  }

  .tabs-with-annotation {
    display: flex;
    align-items: center;

    .el-tabs {
      flex: 1;
    }
  }

  .category-tabs-wrapper {
    display: flex;
    align-items: center;
    padding: 16px 0 8px 0;

    .section-label {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }

  .version-text {
    font-family: 'Consolas', 'Monaco', monospace;
    color: #606266;
    font-size: 13px;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .history-title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .history-header-annotation {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .history-count {
      font-size: 13px;
      color: #909399;
    }
  }

  .table-header-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-annotation {
      margin-right: 8px;
    }
  }

  .text-primary {
    color: #409eff;
  }

  .text-disabled {
    color: #c0c4cc;
  }

  .publish-info {
    p {
      margin: 8px 0;
      font-size: 14px;
      color: #606266;

      .label {
        color: #909399;
        display: inline-block;
        width: 90px;
      }
    }
  }

  .upgrade-hint {
    color: #909399;
    font-size: 13px;
    margin-left: 4px;
  }

  .form-tip {
    color: #909399;
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.6;

    p {
      margin: 2px 0;
    }
  }
}
</style>
