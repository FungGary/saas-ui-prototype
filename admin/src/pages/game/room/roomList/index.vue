<template>
  <div class="room-list-page" :class="{ 'annotation-mode': showAnnotation }">
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

    <!-- 顶部通用筛选区 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: '20px' }">
      <el-form
        id="room-filter-section"
        ref="searchForm"
        :model="searchForm"
        label-width="80px"
        label-position="right"
        @submit.native.prevent
        inline
      >
        <el-form-item label="房间号：">
          <el-input v-model="searchForm.roomNo" placeholder="请输入房间号" clearable class="form_content_width"></el-input>
        </el-form-item>
        <el-form-item label="房间名称：">
          <el-input v-model="searchForm.roomName" placeholder="请输入房间名称" clearable class="form_content_width"></el-input>
        </el-form-item>
        <el-form-item label="机台名称：" id="filter-machine-name">
          <el-select v-model="searchForm.machineId" placeholder="请选择机台名称" clearable class="form_content_width">
            <el-option value="" label="全部"></el-option>
            <el-option value="1" label="SEGA 抓娃娃机"></el-option>
            <el-option value="2" label="Mini 夹公仔机"></el-option>
            <el-option value="3" label="豪华版爪机"></el-option>
          </el-select>
          <annotation-point
            title="【新增】机台名称筛选"
            content="优化前：筛选区无机台名称筛选条件。&#10;&#10;优化后：增加'机台名称'下拉筛选，支持按机台类型筛选房间。&#10;&#10;原因：配合新增的机台名称字段，支持运营快速筛选出特定机台类型的房间，便于精细化管理。"
            priority="P0"
          />
        </el-form-item>
        <el-form-item label="房间分类：">
          <el-select v-model="searchForm.roomCategory" placeholder="请选择房间分类" clearable class="form_content_width">
            <el-option value="" label="全部"></el-option>
            <el-option value="lucky" label="欧皇台"></el-option>
            <el-option value="scraper" label="刮板台"></el-option>
            <el-option value="skill" label="技术台"></el-option>
            <el-option value="gameplay" label="玩法台"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="userSearchs">查询</el-button>
          <el-button class="ResetSearch" @click="reset('searchForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 状态筛选区 + 操作栏 + 表格 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <!-- 状态筛选 Tabs -->
      <div id="room-tab-filter" style="position: relative;">
        <el-tabs :value="searchForm.status" @tab-click="onClickTab">
          <el-tab-pane :label="item.name + ' (' + item.count + ')'" :name="item.type" v-for="(item, index) in statusTabs" :key="index" />
        </el-tabs>
      </div>

      <!-- 表格头部操作栏 -->
      <el-row :gutter="24" justify="space-between">
        <el-col :span="24">
          <el-button class="mr10" @click="exportList">导出列表</el-button>
          <span id="add-room-btn-wrapper">
            <el-button id="add-room-btn" type="primary" @click="handleAdd">添加房间</el-button>
            <annotation-point
              title="【优化】添加房间跳转二级微页面"
              content="优化前：点击'添加房间'按钮弹出弹窗进行编辑。&#10;&#10;优化后：点击'添加房间'按钮跳转二级微页面，采用步骤式表单（房间信息→房间属性）完成房间创建。&#10;&#10;原因：采用二级微页面提供更完整的编辑体验，步骤式表单将房间信息分层，避免弹窗信息过载，提升操作效率和用户体验。"
              priority="P0"
            />
          </span>
        </el-col>
        <!-- 批量操作提示 -->
        <el-col :span="24" class="roomAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择 <i class="roomI">{{ selectionList.length }}</i> 项
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

        <!-- 房间号 -->
        <el-table-column label="房间号" prop="roomNo" min-width="100"></el-table-column>

        <!-- 机台名称【新增字段】 -->
        <el-table-column id="machine-name-column" label="机台名称" min-width="150">
          <template slot="header">
            <span>机台名称</span>
            <annotation-point
              title="【新增】机台名称字段"
              content="优化前：列表无机台名称字段展示。&#10;&#10;优化后：列表新增'机台名称'列，展示房间绑定的机台信息。&#10;&#10;原因：提升房间信息完整性，让运营快速识别每个房间对应的机台类型，便于管理和运营决策。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.machineName }}</span>
          </template>
        </el-table-column>

        <!-- 房间封面图 -->
        <el-table-column label="房间封面图" min-width="100">
          <template slot-scope="scope">
            <div class="tabBox_img">
              <el-avatar :size="40" shape="circle">
                <img v-if="scope.row.coverImage" :src="scope.row.coverImage" />
                <i v-else class="el-icon-picture-outline" style="font-size: 20px;"></i>
              </el-avatar>
            </div>
          </template>
        </el-table-column>

        <!-- 房间名称 -->
        <el-table-column label="房间名称" prop="roomName" min-width="150"></el-table-column>

        <!-- 玩法类型 -->
        <el-table-column label="玩法类型" prop="playType" min-width="100">
          <template slot-scope="scope">
            <span>{{ getPlayTypeText(scope.row.playType) }}</span>
          </template>
        </el-table-column>

        <!-- 房间功能 -->
        <el-table-column label="房间功能" prop="roomFeature" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.roomFeature || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 房间分类 -->
        <el-table-column label="房间分类" prop="roomCategory" min-width="100">
          <template slot-scope="scope">
            <span>{{ getCategoryText(scope.row.roomCategory) }}</span>
          </template>
        </el-table-column>

        <!-- 游戏币 -->
        <el-table-column label="游戏币" prop="gameCoins" min-width="100"></el-table-column>

        <!-- 投币时间 -->
        <el-table-column label="投币时间" prop="coinTime" min-width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.coinTime }}秒</span>
          </template>
        </el-table-column>

        <!-- 房间排序 -->
        <el-table-column label="房间排序" prop="sort" min-width="100"></el-table-column>

        <el-table-column label="是否显示" prop="isShow" min-width="100">
          <template slot-scope="scope">
            <el-switch
              id="room-status-switch"
              :value="scope.row.isShow"
              active-color="#409EFF"
              inactive-color="#DCDFE6"
              @change="handleSwitchChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right" width="160">
          <template slot="header">
            <span>操作</span>
            <annotation-point
              title="【优化】操作列整合"
              content="优化前：操作列包含'编辑'和'修改属性'两个独立按钮。&#10;&#10;优化后：将'编辑'和'修改属性'整合为统一的'修改'入口，点击跳转二级微页面进行编辑。&#10;&#10;原因：简化操作流程，减少按钮数量，提升界面简洁性和操作效率。"
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <a id="room-detail-btn" @click="handleDetail(scope.row)" class="action-link">详情</a>
            <el-divider direction="vertical"></el-divider>
            <el-dropdown id="room-operation-menu" size="small" @command="changeMenu(scope.row, $event)" :transfer="true">
              <span class="el-dropdown-link">更多<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit">修改</el-dropdown-item>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="copy">复制</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <!-- 房间详情抽屉 -->
    <RoomDetailDrawer ref="roomDetailDrawer" />
  </div>
</template>

<script>
import RoomDetailDrawer from './RoomDetailDrawer';
import AnnotationPanel from '@/components/annotation/AnnotationPanel';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight';
import AnnotationPoint from '@/components/AnnotationPoint';

export default {
  name: 'game_room_roomList',
  components: {
    RoomDetailDrawer,
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
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,

      // 状态筛选 Tabs
      statusTabs: [
        { type: 'all', name: '全部', count: 0 },
        { type: 'lucky', name: '欧皇台', count: 0 },
        { type: 'scraper', name: '刮板台', count: 0 },
        { type: 'skill', name: '技术台', count: 0 },
        { type: 'gameplay', name: '玩法台', count: 0 },
      ],

      // 搜索表单
      searchForm: {
        roomNo: '',
        roomName: '',
        machineId: '',
        roomCategory: '',
        status: 'all',
        page: 1,
        limit: 15,
      },

      // Mock 数据 - 包含完整的房间信息
      mockData: [
        {
          id: 1,
          roomNo: 'R001',
          machineName: 'SEGA 抓娃娃机',
          machineId: '1',
          coverImage: 'https://img.yzcdn.cn/vant/cat.jpeg',
          roomName: '一号抓娃娃房',
          playType: 'gameplay',
          roomFeature: '截图',
          roomCategory: 'gameplay',
          gameCoins: 100,
          coinTime: 30,
          sort: 100,
          isShow: true,
          status: 'gameplay',
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
    initStatusCounts() {
      this.statusTabs.forEach(tab => {
        if (tab.type === 'all') {
          tab.count = this.allData.length;
        } else {
          tab.count = this.allData.filter(item => item.roomCategory === tab.type).length;
        }
      });
    },

    getPlayTypeText(playType) {
      const typeMap = {
        lucky: '欧皇台',
        scraper: '刮板台',
        skill: '技术台',
        gameplay: '玩法台',
      };
      return typeMap[playType] || playType;
    },

    getCategoryText(category) {
      const categoryMap = {
        lucky: '欧皇台',
        scraper: '刮板台',
        skill: '技术台',
        gameplay: '玩法台',
      };
      return categoryMap[category] || category;
    },

    getList() {
      this.loading = true;
      setTimeout(() => {
        let result = [...this.allData];

        if (this.searchForm.status !== 'all') {
          result = result.filter(item => item.roomCategory === this.searchForm.status);
        }

        if (this.searchForm.roomNo) {
          result = result.filter(item => item.roomNo.includes(this.searchForm.roomNo));
        }

        if (this.searchForm.roomName) {
          result = result.filter(item => item.roomName.includes(this.searchForm.roomName));
        }

        if (this.searchForm.machineId) {
          result = result.filter(item => item.machineId === this.searchForm.machineId);
        }

        if (this.searchForm.roomCategory) {
          result = result.filter(item => item.roomCategory === this.searchForm.roomCategory);
        }

        this.total = result.length;
        const start = (this.searchForm.page - 1) * this.searchForm.limit;
        const end = start + this.searchForm.limit;
        this.tableData = result.slice(start, end);
        this.loading = false;
      }, 300);
    },

    onClickTab() {
      this.searchForm.page = 1;
      this.getList();
    },

    userSearchs() {
      this.selectionList = [];
      this.selectedIds = [];
      this.searchForm.page = 1;
      this.getList();
    },

    reset(name) {
      this.searchForm = {
        roomNo: '',
        roomName: '',
        machineId: '',
        roomCategory: '',
        status: 'all',
        page: 1,
        limit: 15,
      };
      this.selectedIds = new Set();
      this.getList();
    },

    pageChange() {
      this.selectionList = [];
      this.getList();
    },

    handleSelectRow(selection, row) {
      let ids = [];
      selection.map(e => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
    },

    handleSelectAll(selection) {
      let ids = [];
      selection.map(e => {
        ids.push(e.id);
      });
      this.selectedIds = ids;
      this.selectionList = selection;
    },

    handleSwitchChange(row) {
      if (row.isShow) {
        this.$confirm('确定关闭该房间的显示状态吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          row.isShow = false;
          this.$message.success('已关闭显示');
        }).catch(() => {});
      } else {
        row.isShow = true;
        this.$message.success('已开启显示');
      }
    },

    changeMenu(row, command) {
      switch (command) {
        case 'edit':
          this.handleEdit(row);
          break;
        case 'delete':
          this.handleDelete(row);
          break;
        case 'copy':
          this.handleCopy(row);
          break;
        default:
          break;
      }
    },

    handleDetail(row) {
      console.log('点击详情', row);
      this.$nextTick(() => {
        if (this.$refs.roomDetailDrawer) {
          this.$refs.roomDetailDrawer.open(row);
        } else {
          this.$message.error('详情抽屉未挂载');
        }
      });
    },

    handleDetailClose() {
      // 由 RoomDetailDrawer 内部维护可见性
    },

    handleEdit(row) {
      this.$router.push({ path: this.$routeProStr + '/game/room/roomAddEdit/' + row.id });
    },

    handleDelete(row) {
      this.$confirm(`确定要删除房间 "${row.roomName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$message.success('删除成功');
          this.getList();
        })
        .catch(() => {});
    },

    handleCopy(row) {
      const copyInfo = {
        roomNo: row.roomNo,
        roomName: row.roomName,
        machineName: row.machineName,
      };
      navigator.clipboard.writeText(JSON.stringify(copyInfo)).then(() => {
        this.$message.success('复制成功');
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(copyInfo);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.$message.success('复制成功');
      });
    },

    exportList() {
      this.$message.info('导出房间列表');
    },

    handleAdd() {
      this.$router.push({ path: this.$routeProStr + '/game/room/roomAddEdit' });
    },

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

.roomAlert {
  margin-top: 20px;
}

.roomI {
  color: var(--prev-color-primary);
  font-style: normal;
}

.form_content_width {
  width: 200px;
}

.ResetSearch {
  border: 1px solid #dcdfe6;
  color: #606266;
  margin-right: 10px;
}

.mt16 {
  margin-top: 16px;
}

.tabBox_img {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.action-link {
  color: #409eff;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
}

.page {
  margin-top: 20px;
}

.room-list-page {
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
