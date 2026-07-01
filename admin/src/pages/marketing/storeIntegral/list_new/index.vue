<template>
  <div class="integral-list-page" :class="{ 'annotation-mode': showAnnotation }">
    <transition name="slide-right">
      <div v-if="showAnnotation" class="annotation-panel-wrapper">
        <AnnotationPanel
          ref="annotationPanel"
          @select="handleAnnotationSelect"
          @toggle-markers="handleToggleMarkers"
        />
      </div>
    </transition>

    <AnnotationHighlight />

    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="searchForm"
          :model="searchForm"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item label="商品标题：">
                <el-input v-model="searchForm.title" placeholder="请输入商品标题" clearable class="form_content_width" />
              </el-form-item>
              <el-form-item label="商品分类：">
                <el-select v-model="searchForm.category" placeholder="请选择" clearable class="form_content_width">
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="数码生活"></el-option>
                  <el-option value="2" label="游戏卡带"></el-option>
                  <el-option value="3" label="大疆"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="创建时间：">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  class="form_content_width"
                ></el-date-picker>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
              <el-button class="ResetSearch" v-db-click @click="resetForm">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <el-tabs v-model="searchForm.status" @tab-click="onStatusTabClick">
        <el-tab-pane
          v-for="item in statusTabs"
          :key="item.value"
          :label="item.label + ' (' + item.count + ')'"
          :name="item.value"
        ></el-tab-pane>
      </el-tabs>

      <el-row :gutter="24" justify="space-between" class="op-row">
        <el-col :span="24">
          <span class="table-title">积分商品</span>
          <el-button class="mr10 ml20" v-db-click @click="exportList">导出</el-button>
          <el-button type="primary" v-db-click @click="handleAdd">添加积分商品</el-button>
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
        :data="tableList"
        ref="table"
        class="mt16"
        v-loading="loading"
        highlight-current-row
        empty-text="暂无数据"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
        row-key="id"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="商品ID" prop="id" min-width="90"></el-table-column>
        <el-table-column label="商品信息" min-width="300">
          <template slot="header">
            <span>商品信息</span>
            <annotation-point 
              title="【优化】表格视觉优化" 
              content="优化前：字段平铺展示，主次不明显，信息分散。&#10;&#10;优化后：商品信息合并展示（商品图+名称+分类+品牌），价格、库存、状态分组展示，提升运营查看效率。&#10;&#10;原因：提升运营查看效率，减少字段冗余。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="product-info-cell" id="product-info-cell">
              <div class="product-image" v-viewer>
                <img v-lazy="scope.row.image" />
              </div>
              <div class="product-detail">
                <div class="product-name">{{ scope.row.title }}</div>
                <div class="product-meta">
                  <span class="meta-item">{{ scope.row.category }}</span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">{{ scope.row.brand }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格/积分" min-width="150">
          <template slot="header">
            <span>价格/积分</span>
            <annotation-point 
              title="【优化】价格积分分组展示" 
              content="优化前：价格和积分分开展示或仅显示积分。&#10;&#10;优化后：将售价和兑换积分分组展示，清晰区分商品价格和所需积分。&#10;&#10;原因：运营需同时关注商品售价和兑换积分，清晰展示有助于快速判断。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="price-cell">
              <div class="price-main">¥{{ formatPrice(scope.row.price) }}</div>
              <div class="integral-info"><span class="integral-value">{{ scope.row.integral }}</span> 积分</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" min-width="120">
          <template slot="header">
            <span>库存</span>
            <annotation-point 
              title="【优化】库存分组展示" 
              content="优化前：仅显示单一库存数值。&#10;&#10;优化后：将库存分为「上架库存」和「剩余库存」两个维度展示。&#10;&#10;原因：运营需区分总上架库存和当前可兑换的剩余库存，便于库存管理。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="stock-info">
              <div class="stock-item">
                <span class="stock-label">上架库存：</span>
                <span class="stock-value">{{ scope.row.stock }}</span>
              </div>
              <div class="stock-item">
                <span class="stock-label">剩余库存：</span>
                <span class="stock-value">{{ scope.row.remainingStock }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="累计兑换量" min-width="100" id="exchange-count-column">
          <template slot="header">
            <span>累计兑换量</span>
            <annotation-point 
              title="【优化】销量字段优化" 
              content="优化前：仅显示「销量」，容易和商品销售销量混淆。&#10;&#10;优化后：明确为「累计兑换量」，清晰标识是积分兑换的数量。&#10;&#10;原因：避免和商品销售销量混淆。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.sales }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" min-width="60">
          <template slot-scope="scope">
            <span>{{ scope.row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上架状态" min-width="100">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              :value="scope.row.status"
              @change="onChangeStatus(scope.row)"
              size="large"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template slot-scope="scope">
            <a v-db-click @click="handleEdit(scope.row)" class="action-link">编辑</a>
            <el-divider direction="vertical"></el-divider>
            <a v-db-click @click="handleDelete(scope.row)" class="action-link delete">删除</a>
          </template>
        </el-table-column>
      </el-table>

      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="searchForm.page"
          :limit.sync="searchForm.limit"
          @pagination="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'storeIntegralList',
  components: {
    AnnotationPanel: () => import('@/components/annotation/AnnotationPanel'),
    AnnotationHighlight: () => import('@/components/annotation/AnnotationHighlight'),
    AnnotationPoint: () => import('@/components/AnnotationPoint'),
  },
  data() {
    return {
      loading: false,
      searchForm: {
        title: '',
        category: '',
        dateRange: [],
        status: '1',
        page: 1,
        limit: 15,
      },
      tableList: [],
      total: 0,
      selectionList: [],
      statusTabs: [
        { value: '1', label: '已上架', count: 0 },
        { value: '0', label: '已下架', count: 0 },
      ],
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
    };
  },
  computed: {
    ...mapState('media', ['isMobile']),
  },
  created() {
    this.getList();
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  methods: {
    handleAnnotationToggle(visible) {
      this.showAnnotation = visible;
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
    },
    getList() {
      this.loading = true;
      setTimeout(() => {
        this.tableList = [
          {
            id: 17,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20cute%20plush%20toy%20dragon&image_size=square',
            title: 'JELLYCAT神话动物系列金龙毛绒公仔12cm',
            category: '毛绒玩具',
            brand: 'JELLYCAT',
            price: 199,
            costPrice: 150,
            integral: 16500,
            sales: 1,
            stock: 10,
            remainingStock: 10,
            createTime: '2026-06-06 11:37:07',
            sort: 0,
            status: 1,
          },
          {
            id: 18,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20a%20smart%20watch&image_size=square',
            title: '智能手表Pro Max',
            category: '智能穿戴',
            brand: 'Apple',
            price: 2999,
            costPrice: 2500,
            integral: 500,
            sales: 5,
            stock: 50,
            remainingStock: 45,
            createTime: '2026-06-05 14:22:33',
            sort: 1,
            status: 0,
          },
          {
            id: 19,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20wireless%20headphones&image_size=square',
            title: '无线蓝牙耳机降噪版',
            category: '音频设备',
            brand: '索尼',
            price: 399,
            costPrice: 280,
            integral: 200,
            sales: 12,
            stock: 100,
            remainingStock: 88,
            createTime: '2026-06-04 10:15:22',
            sort: 2,
            status: 1,
          },
          {
            id: 20,
            image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20photo%20of%20portable%20charger&image_size=square',
            title: '便携充电宝20000mAh快充版',
            category: '数码配件',
            brand: '小米',
            price: 199,
            costPrice: 140,
            integral: 350,
            sales: 8,
            stock: 80,
            remainingStock: 72,
            createTime: '2026-06-03 09:30:45',
            sort: 3,
            status: 0,
          },
        ];
        const shelfList = this.tableList.filter(item => item.status === 1);
        const offShelfList = this.tableList.filter(item => item.status === 0);
        this.statusTabs[0].count = shelfList.length;
        this.statusTabs[1].count = offShelfList.length;
        this.total = this.tableList.length;
        this.loading = false;
      }, 300);
    },
    formatPrice(price) {
      return price ? price.toFixed(2) : '0.00';
    },
    userSearchs() {
      this.searchForm.page = 1;
      this.getList();
    },
    resetForm() {
      this.searchForm = {
        title: '',
        category: '',
        dateRange: [],
        status: '1',
        page: 1,
        limit: 15,
      };
      this.getList();
    },
    onStatusTabClick() {
      this.searchForm.page = 1;
      this.getList();
    },
    handleSelectRow(selection, row) {
      this.selectionList = selection;
    },
    handleSelectAll(selection) {
      this.selectionList = selection;
    },
    handleAdd() {
      this.$router.push({ path: this.$routeProStr + '/marketing/store_integral/add_edit' });
    },
    handleEdit(row) {
      this.$router.push({ path: this.$routeProStr + '/marketing/store_integral/add_edit/' + row.id });
    },
    handleDelete(row) {
      this.$modalSure({
        title: '删除积分商品',
        url: `marketing/integral/${row.id}`,
        method: 'DELETE',
      }).then(() => {
        this.getList();
      });
    },
    onChangeStatus(row) {
      if (row.status === 1) {
        this.$confirm('确定下架该积分商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          row.status = 0;
          this.getList();
          this.$message.success('已下架');
        }).catch(() => {});
      } else {
        row.status = 1;
        this.getList();
        this.$message.success('已上架');
      }
    },
    exportList() {
      this.$downloadExcel({
        url: 'marketing/integral/export',
        data: this.searchForm,
        filename: '积分商品列表.xlsx',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.integral-list-page {
  .expand-row {
    display: flex;
    padding: 16px;
  }
  .expand-section {
    flex: 1;
    padding: 0 24px;
    border-right: 1px solid #ebeef5;
    &:last-child {
      border-right: none;
    }
  }
  .expand-section-title {
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 14px;
    color: #303133;
  }
  .expand-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .expand-label {
    color: #909399;
    min-width: 80px;
  }
  .expand-value {
    color: #606266;
    &.price {
      color: #E6A23C;
      font-weight: 600;
    }
  }
  .source-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    &.self {
      background: #f0f9eb;
      color: #67c23a;
    }
    &.flagship {
      background: #eef5ff;
      color: #409eff;
    }
  }
  .product-info-cell {
    display: flex;
    align-items: center;
    
    > :last-child {
      margin-left: auto;
    }
  }
  .product-image {
    width: 60px;
    height: 60px;
    margin-right: 12px;
    border-radius: 4px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .product-detail {
    flex: 1;
    min-width: 0;
  }
  .product-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .product-meta {
    display: flex;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
  .meta-item {
    margin-right: 8px;
  }
  .meta-divider {
    margin: 0 4px;
    color: #ebeef5;
  }
  .price-cell {
    display: flex;
    flex-direction: column;
  }
  .price-main {
    font-size: 16px;
    color: #E6A23C;
    font-weight: 600;
  }
  .integral-info {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    .integral-value {
      color: #67c23a;
      font-weight: 600;
    }
  }
  .stock-cell {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: #606266;
  }
  .stock-status {
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    &.online {
      background: #f0f9eb;
      color: #67c23a;
    }
    &.offline {
      background: #fef0f0;
      color: #f56c6c;
    }
  }
  .stock-info {
    display: flex;
    flex-direction: column;
    font-size: 13px;
  }
  .stock-item {
    display: flex;
    align-items: center;
  }
  .stock-label {
    color: #909399;
  }
  .stock-value {
    color: #606266;
  }
}

.integral-list-page {
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