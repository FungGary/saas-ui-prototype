<template>
  <div class="product-list-page" :class="{ 'annotation-mode': showAnnotation }">
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

    <!-- 搜索筛选卡片 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <div class="padding-add">
        <el-form
          ref="productFrom"
          :model="productFrom"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form" id="product-filter-section">
            <div class="search-form-box">
              <el-form-item label="商品搜索：">
                <el-input
                  v-model="productFrom.keyword"
                  placeholder="请输入商品名称/关键字/ID"
                  clearable
                  class="form_content_width"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品分类：">
                <el-select
                  v-model="productFrom.cate_id"
                  placeholder="请选择"
                  clearable
                  class="form_content_width"
                >
                  <el-option
                    v-for="item in cateOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="商品品牌：">
                <el-select
                  v-model="productFrom.brand_id"
                  placeholder="请选择品牌"
                  clearable
                  class="form_content_width"
                >
                  <el-option
                    v-for="item in brandOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据来源：">
                <el-select
                  v-model="productFrom.source_type"
                  placeholder="请选择"
                  clearable
                  class="form_content_width"
                >
                  <el-option value="" label="全部"></el-option>
                  <el-option value="self" label="自营"></el-option>
                  <el-option value="flagship" label="旗舰"></el-option>
                  <el-option value="third" label="第三方"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="供应商：">
                <el-input
                  v-model="productFrom.supplier"
                  placeholder="请输入供应商名称"
                  clearable
                  class="form_content_width"
                ></el-input>
                <annotation-point 
                  title="【新增】供应商筛选" 
                  content="优化前：原系统筛选区无供应商筛选条件。&#10;&#10;优化后：新增供应商搜索筛选，支持按供应商名称模糊搜索。&#10;&#10;原因：快速定位被引用的商品，避免误操作引发大范围问题。" 
                  priority="P1"
                />
              </el-form-item>
              <el-form-item label="预售状态：">
                <el-select
                  v-model="productFrom.is_presale"
                  placeholder="请选择"
                  clearable
                  class="form_content_width"
                >
                  <el-option value="" label="全部"></el-option>
                  <el-option :value="1" label="是"></el-option>
                  <el-option :value="0" label="否"></el-option>
                </el-select>
                <annotation-point 
                  title="【新增】预售状态筛选" 
                  content="优化前：原系统筛选区无预售状态筛选条件。&#10;&#10;优化后：新增预售状态筛选，支持按是/否筛选预售商品。&#10;&#10;原因：配合预售商品管理需求，支持运营快速筛选出预售商品。" 
                  priority="P1"
                />
              </el-form-item>
              <el-form-item label="价格区间（售价）：">
                <el-input
                  v-model="productFrom.price_min"
                  placeholder="最低售价"
                  clearable
                  class="form_range_content_width"
                  style="width: 120px"
                ></el-input>
                <span style="margin: 0 6px">-</span>
                <el-input
                  v-model="productFrom.price_max"
                  placeholder="最高售价"
                  clearable
                  class="form_range_content_width"
                  style="width: 120px"
                ></el-input>
                <annotation-point 
                  title="【优化】价格区间明确为售价" 
                  content="优化前：原系统价格区间筛选未明确筛选的是什么价格，容易产生歧义。&#10;&#10;优化后：价格区间标签明确标注为售价，输入框placeholder也提示最低/最高售价。&#10;&#10;原因：避免运营混淆价格类型，提升筛选准确性。" 
                  priority="P2"
                />
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" v-db-click @click="handleSearch">查询</el-button>
              <el-button class="ResetSearch" v-db-click @click="handleReset">重置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表卡片 -->
    <el-card :bordered="false" shadow="never" class="ivu-mt mt16" :body-style="{ padding: '0 20px 20px' }">
      <!-- 旗舰商品提示 -->
      <div class="flagship-tip" id="flagship-warning">
        <i class="el-icon-info"></i>
        <span>旗舰商品来自官方库，不可修改删除</span>
        <annotation-point 
          title="【优化】旗舰商品常驻提示" 
          content="优化前：原系统旗舰商品禁止编辑删除，但无特殊提示，操作无反馈。&#10;&#10;优化后：列表顶部常驻提示'旗舰商品来自官方库，不可修改删除'。&#10;&#10;原因：提升用户反馈，让运营清楚了解旗舰商品的特殊限制。" 
          priority="P1"
        />
      </div>

      <!-- 状态Tabs -->
      <el-tabs v-model="productFrom.status" @tab-click="onClickTab" id="product-tab-filter">
        <el-tab-pane
          v-for="item in statusTabs"
          :key="item.value"
          :name="item.value"
        >
          <span slot="label" @click.stop>
            {{ item.label }} {{ item.count }}
            <annotation-point 
              v-if="item.value === ''"
              title="【优化】重构Tab名称" 
              content="优化前：原系统Tab为出售中、仓库中、已售罄、警戒库存、回收站、导入记录，名称不符合业务认知。&#10;&#10;优化后：调整为全部、出售中、仓库中、已售罄、库存预警、回收站，均带数量；移除导入记录。&#10;&#10;原因：新Tab贴近商品生命周期，更符合业务认知。" 
              priority="P0"
            />
          </span>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <el-row :gutter="24" justify="space-between" class="op-row">
        <el-col :span="24">
          <el-button type="primary" v-db-click @click="handleAdd">添加商品</el-button>
          <el-button v-db-click @click="handleBatchModify">批量修改</el-button>
          <el-button v-db-click @click="handleBatchOff">批量下架</el-button>
          <el-button v-db-click @click="handleExport">商品导出</el-button>
          <el-button v-db-click @click="handleImport">商品导入</el-button>
        </el-col>
        <el-col :span="24" class="userAlert" v-if="selectionList.length">
          <el-alert show-icon>
            <template slot="title">
              已选择<i class="userI"> {{ selectionList.length }} </i>项
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="tableList"
        class="mt16"
        ref="table"
        highlight-current-row
        v-loading="loading"
        empty-text="暂无数据"
        @select="handleSelectRow"
        @select-all="handleSelectAll"
        row-key="id"
      >

        <el-table-column type="selection" width="55" :selectable="checkSelectable" id="selectable-flagship"></el-table-column>
        <el-table-column label="商品ID" prop="id" min-width="90"></el-table-column>
        <el-table-column label="商品信息" min-width="280" id="product-info-column">
          <template slot="header">
            <span>商品信息</span>
            <annotation-point 
              title="【优化】表格视觉优化-商品信息合并" 
              content="优化前：原系统表格字段平铺，商品图、商品名称、商品分类、商品品牌分散在不同列，主次不明显。&#10;&#10;优化后：商品信息合并展示，包含商品图片、商品名称、商品分类、商品品牌，提升信息密度。&#10;&#10;原因：提升运营扫表效率，优化视觉层级。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="product-info-cell">
              <div class="product-image" v-viewer>
                <img v-lazy="scope.row.image" />
              </div>
              <div class="product-detail">
                <div class="product-name">{{ scope.row.name }}</div>
                <div class="product-meta">
                  <span class="meta-item">{{ scope.row.cate_name }}</span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">{{ scope.row.brand_name }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据来源" prop="source_type" min-width="100" id="source-type-column">
          <template slot-scope="scope">
            <span :class="['source-tag', scope.row.source_type]">{{ getSourceText(scope.row.source_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格与库存" min-width="180" id="price-stock-column">
          <template slot="header">
            <span>价格与库存</span>
            <annotation-point 
              title="【优化】表格视觉优化-价格库存合并" 
              content="优化前：原系统表格中商品售价、供货价、可兑换积分、排序、供应商分散在不同列，字段平铺主次不明显。&#10;&#10;优化后：价格与库存合并展示，包含售价和库存两项核心信息，库存低于10时红色警告。&#10;&#10;原因：提升运营扫表效率，突出核心信息，优化视觉层级。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="price-stock-group">
              <div class="price-row">
                <span class="price-label">售价：</span>
                <span class="price-value">{{ formatPrice(scope.row.price) }}</span>
              </div>
              <div class="price-row">
                <span class="price-label">库存：</span>
                <span :class="['stock-value', scope.row.stock <= 10 ? 'warning' : '']">{{ scope.row.stock }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上架状态" min-width="100" id="status-switch">
          <template slot="header">
            <span>上架状态</span>
            <annotation-point 
              title="【优化】字段重命名+下架确认流程" 
              content="优化前：原系统字段名为'商品状态'，容易与商品生命周期状态（如草稿、审核中）混淆；下架时直接执行，无影响面提示。&#10;&#10;优化后：1. 字段名改为'上架状态'，更准确清晰；2. 点击开关上架时，直接变更状态并提示成功；3. 点击开关下架时，先弹出下架确认弹窗，进行引用关联检测（房间引用、未完成订单、参与活动、积分商城），显示具体影响数量；4. 存在引用时弹窗警告是否继续，无引用时提示可安全下架；5. 旗舰商品开关禁用，不可操作。&#10;&#10;原因：原名易混淆，改名后更准确；下架前检测引用防止商品下架误操作，避免影响业务正常运转。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <div class="status-group">
              <el-switch
                :value="scope.row.status === 'on'"
                active-color="#409EFF"
                inactive-color="#EBEEF5"
                @change="(val) => handleStatusChange(scope.row, val)"
                :disabled="scope.row.source_type === 'flagship'"
              ></el-switch>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220" id="operation-column">
          <template slot="header">
            <span>操作</span>
            <annotation-point 
              title="【新增/优化】操作列功能" 
              content="优化前：原系统操作列只有编辑和更多（复制、移到回收站），旗舰商品只有复制，无独立查看入口。&#10;&#10;优化后：新增独立的'查看'按钮，点击后弹出只读详情抽屉，展示商品完整信息（含图片、价格、库存、引用关系等）；自营商品有查看、编辑、更多；旗舰商品只有查看和复制。&#10;&#10;原因：旗舰商品不支持编辑，导致无法查看其详情；自营商品查看也需要进入编辑页，交互存在缺陷。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <template v-if="scope.row.source_type === 'flagship'">
              <a v-db-click @click="handleView(scope.row)" class="action-link">查看</a>
              <el-divider direction="vertical"></el-divider>
              <el-dropdown size="small" @command="handleMenu(scope.row, $event)" :transfer="true">
                <span class="el-dropdown-link">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template v-else>
              <a v-db-click @click="handleView(scope.row)" class="action-link">查看</a>
              <el-divider direction="vertical"></el-divider>
              <a v-db-click @click="handleEdit(scope.row)" class="action-link">编辑</a>
              <el-divider direction="vertical"></el-divider>
              <el-dropdown size="small" @command="handleMenu(scope.row, $event)" :transfer="true">
                <span class="el-dropdown-link">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="recycle">移到回收站</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="productFrom.page"
          :limit.sync="productFrom.limit"
          @pagination="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 商品详情抽屉 -->
    <el-drawer
      :visible.sync="drawerVisible"
      title="商品详情"
      size="800px"
      :before-close="handleCloseDrawer"
    >
      <div v-if="currentProduct" class="drawer-content">
        <div class="drawer-section">
          <h3 class="section-title">商品信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">商品ID</span>
              <span class="detail-value">{{ currentProduct.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品名称</span>
              <span class="detail-value">{{ currentProduct.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品分类</span>
              <span class="detail-value">{{ currentProduct.cate_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品品牌</span>
              <span class="detail-value">{{ currentProduct.brand_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">数据来源</span>
              <span :class="['source-tag', currentProduct.source_type]">{{ getSourceText(currentProduct.source_type) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">单位</span>
              <span class="detail-value">{{ currentProduct.unit || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">商品编号</span>
              <span class="detail-value">{{ currentProduct.product_code || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">外部编号</span>
              <span class="detail-value">{{ currentProduct.external_code || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">商品图片</h3>
          <div class="image-preview">
            <img :src="currentProduct.image" class="main-image" />
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">价格信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">商品售价</span>
              <span class="detail-value price">{{ formatPrice(currentProduct.price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">供货价</span>
              <span class="detail-value">{{ formatPrice(currentProduct.supply_price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">市场价</span>
              <span class="detail-value">{{ formatPrice(currentProduct.market_price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">成本价</span>
              <span class="detail-value">{{ formatPrice(currentProduct.cost_price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">原价</span>
              <span class="detail-value">{{ formatPrice(currentProduct.original_price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">可兑换积分</span>
              <span class="detail-value">{{ currentProduct.integral }}</span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">库存信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">库存</span>
              <span class="detail-value">{{ currentProduct.stock }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">虚拟销量</span>
              <span class="detail-value">{{ currentProduct.fake_sales }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">供应商</span>
              <span class="detail-value">{{ currentProduct.supplier || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上架状态</span>
              <span :class="['status-badge', currentProduct.status === 'on' ? 'success' : 'warning']">
                {{ currentProduct.status === 'on' ? '已上架' : '已下架' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">排序</span>
              <span class="detail-value">{{ currentProduct.sort }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预售状态</span>
              <span :class="['status-badge', currentProduct.is_presale === 1 ? 'info' : 'default']">
                {{ currentProduct.is_presale === 1 ? '预售商品' : '非预售' }}
              </span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">商品详情</h3>
          <div class="detail-content">
            <div class="detail-item full-width">
              <span class="detail-label">商品描述</span>
              <span class="detail-value">{{ currentProduct.description || '暂无商品描述' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">规格信息</span>
              <span class="detail-value">{{ currentProduct.spec_info || '暂无规格信息' }}</span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">引用关系</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">房间引用</span>
              <span class="detail-value ref-count">{{ currentProduct.ref_count || 0 }} 个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">积分商城</span>
              <span class="detail-value ref-count">{{ currentProduct.ref_integral || 0 }} 个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">参与活动</span>
              <span class="detail-value ref-count">{{ currentProduct.ref_activity || 0 }} 个</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">关联订单</span>
              <span class="detail-value ref-count">{{ currentProduct.ref_orders || 0 }} 个</span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">其他信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ currentProduct.created_at || '2023-01-01 10:00:00' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">更新时间</span>
              <span class="detail-value">{{ currentProduct.updated_at || '2023-01-01 10:00:00' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 下架检测引用关联弹窗 -->
    <el-dialog title="下架确认" :visible.sync="offDialogVisible" width="550px" id="batch-off-dialog">
      <div class="batch-dialog-content">
        <div class="warning-icon">
          <i class="el-icon-warning"></i>
        </div>
        <p class="warning-text">即将下架商品：<strong>{{ currentProduct ? currentProduct.name : '' }}</strong>
          <annotation-point 
            title="【新增】批量下架影响检测" 
            content="优化前：原系统下架时直接执行，无影响面提示。&#10;&#10;优化后：下架操作时检测是否被房间引用、在积分商城展示、参与活动、有未完成/未发货订单、有库存占用，并弹窗警告，显示具体影响数量及场景。&#10;&#10;原因：防止商品下架误操作，避免影响业务正常运转。" 
            priority="P0"
          />
        </p>
        <div class="impact-info">
          <h4>引用关联检测</h4>
          <ul>
            <li><i class="el-icon-link"></i> 房间引用：{{ impactData.rooms }} 个</li>
            <li><i class="el-icon-shopping-cart"></i> 未完成订单：{{ impactData.orders }} 个</li>
            <li><i class="el-icon-gift"></i> 参与活动：{{ impactData.activities }} 个</li>
            <li><i class="el-icon-coin"></i> 积分商城：{{ impactData.integral }} 个</li>
          </ul>
        </div>
        <div v-if="hasReferences" class="confirm-section warning">
          <p>该商品存在关联引用，下架后将影响上述业务，是否继续？</p>
        </div>
        <div v-else class="confirm-section">
          <p>该商品暂无关联引用，可以安全下架。</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="offDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmOff">确认下架</el-button>
      </div>
    </el-dialog>

    <!-- 批量下架确认弹窗 -->
    <el-dialog title="批量下架确认" :visible.sync="batchOffDialogVisible" width="500px">
      <div class="batch-dialog-content">
        <div class="warning-icon">
          <i class="el-icon-warning"></i>
        </div>
        <p class="warning-text">即将下架 <strong>{{ batchCount }}</strong> 个商品</p>
        <div class="impact-info">
          <h4>影响范围</h4>
          <ul>
            <li><i class="el-icon-link"></i> {{ impactData.rooms }} 个房间正在引用</li>
            <li><i class="el-icon-shopping-cart"></i> {{ impactData.orders }} 个未完成订单</li>
            <li><i class="el-icon-gift"></i> {{ impactData.activities }} 个活动</li>
          </ul>
        </div>
        <div class="confirm-section">
          <p>确定下架这些商品吗？下架后将影响上述关联业务。</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchOffDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchOff">确认下架</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductListNew',
  components: {
    AnnotationPanel: () => import('@/components/annotation/AnnotationPanel'),
    AnnotationHighlight: () => import('@/components/annotation/AnnotationHighlight'),
    AnnotationPoint: () => import('@/components/AnnotationPoint'),
  },
  data() {
    return {
      loading: false,
      total: 0,
      selectionList: [],
      selectedIds: [],
      ids: [],
      drawerVisible: false,
      offDialogVisible: false,
      batchOffDialogVisible: false,
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      batchCount: 0,
      currentProduct: null,
      impactData: {
        rooms: 0,
        orders: 0,
        activities: 0,
        integral: 0,
      },
      cateOptions: [
        { value: 1, label: '12/123' },
        { value: 2, label: '家居好物/全棉时代' },
        { value: 3, label: '数码生活/游戏卡带,数码生活/大疆' },
        { value: 4, label: '星之卡比' },
        { value: 5, label: '其他/其他1' },
      ],
      brandOptions: [
        { value: 1, label: '其他' },
        { value: 2, label: '小米' },
        { value: 3, label: '迪士尼' },
      ],
      statusTabs: [
        { value: '', label: '全部', count: 87752 },
        { value: 'on', label: '出售中', count: 81507 },
        { value: 'warehouse', label: '仓库中', count: 2353 },
        { value: 'soldout', label: '已售罄', count: 6 },
        { value: 'warning', label: '库存预警', count: 3 },
        { value: 'recycle', label: '回收站', count: 3885 },
      ],
      productFrom: {
        keyword: '',
        cate_id: '',
        brand_id: '',
        source_type: '',
        supplier: '',
        is_presale: '',
        price_min: '',
        price_max: '',
        status: '',
        page: 1,
        limit: 15,
      },
      tableList: [
        {
          id: 87789,
          name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999...',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=golden%20dragon%20plush%20toy%20jellycat%20style%20product%20photo&image_size=square',
          cate_name: '12/123',
          brand_name: '其他',
          source_type: 'self',
          price: 1650.0,
          supply_price: 0.0,
          integral: 14850,
          sort: 0,
          supplier: '',
          status: 'on',
          market_price: 3000.0,
          cost_price: 3000.0,
          fake_sales: 0,
          external_code: '',
          stock: 100,
          original_price: 1999.0,
          unit: '个',
          product_code: 'P001',
          is_presale: 0,
          ref_count: 5,
          ref_integral: 2,
          ref_activity: 1,
          ref_orders: 2,
          ref_stock: 32,
        },
        {
          id: 87769,
          name: 'JELLYCAT神话动物系列金龙毛绒公仔12cm高999',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20blue%20dragon%20plush%20toy%20product%20photo&image_size=square',
          cate_name: '家居好物/全棉时代',
          brand_name: '其他',
          source_type: 'flagship',
          price: 1650.0,
          supply_price: 0.0,
          integral: 14850,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 50,
          original_price: 0.0,
          unit: '个',
          product_code: 'P002',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87767,
          name: '测试000',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=video%20game%20console%20accessory%20product%20photo&image_size=square',
          cate_name: '数码生活/游戏卡带,数码生活/大疆',
          brand_name: '小米',
          source_type: 'flagship',
          price: 10.0,
          supply_price: 0.0,
          integral: 0,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 10,
          original_price: 0.0,
          unit: '个',
          product_code: 'P003',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87765,
          name: '雀巢果味软糖60g*2',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=packaged%20candy%20snack%20product%20photo&image_size=square',
          cate_name: '星之卡比',
          brand_name: '其他',
          source_type: 'flagship',
          price: 10.0,
          supply_price: 0.0,
          integral: 90,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 200,
          original_price: 0.0,
          unit: '袋',
          product_code: 'P004',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87764,
          name: '上迪23新春系列砂糖桔olu挂件',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20orange%20doll%20keychain%20product%20photo&image_size=square',
          cate_name: '其他/其他1',
          brand_name: '迪士尼',
          source_type: 'flagship',
          price: 2322.01,
          supply_price: 0.0,
          integral: 20898,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 30,
          original_price: 0.0,
          unit: '个',
          product_code: 'P005',
          is_presale: 1,
          ref_count: 0,
        },
        {
          id: 87763,
          name: '迪士尼100周年系列olu挂件',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=disney%20anniversary%20keychain%20plush%20product%20photo&image_size=square',
          cate_name: '其他/其他1',
          brand_name: '迪士尼',
          source_type: 'flagship',
          price: 170.0,
          supply_price: 0.0,
          integral: 1650,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 80,
          original_price: 0.0,
          unit: '个',
          product_code: 'P006',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87761,
          name: '112',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=simple%20product%20box%20with%20number%20112&image_size=square',
          cate_name: '星之卡比',
          brand_name: '小米',
          source_type: 'flagship',
          price: 10.0,
          supply_price: 0.0,
          integral: 90,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 5,
          original_price: 0.0,
          unit: '个',
          product_code: 'P007',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87760,
          name: '小米精巧装256L三门电冰箱',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=xiaomi%20refrigerator%20appliance%20product%20photo&image_size=square',
          cate_name: '其他/其他1',
          brand_name: '小米',
          source_type: 'flagship',
          price: 1399.0,
          supply_price: 0.0,
          integral: 12591,
          sort: 0,
          supplier: '',
          status: 'off',
          market_price: 0.0,
          cost_price: 0.0,
          fake_sales: 0,
          external_code: '',
          stock: 15,
          original_price: 0.0,
          unit: '台',
          product_code: 'P008',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87799,
          name: '星之卡比超软抱枕40cm粉红色',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pink%20kirby%20soft%20pillow%20plush%20toy%20cute%20product%20photo&image_size=square',
          cate_name: '星之卡比',
          brand_name: '星之卡比',
          source_type: 'self',
          price: 89.0,
          supply_price: 45.0,
          integral: 800,
          sort: 0,
          supplier: '杭州玩具供应商',
          status: 'on',
          market_price: 129.0,
          cost_price: 48.0,
          fake_sales: 156,
          external_code: 'SKB-001',
          stock: 320,
          original_price: 99.0,
          unit: '个',
          product_code: 'P009',
          is_presale: 0,
          ref_count: 3,
        },
        {
          id: 87798,
          name: 'Switch OLED 宝可梦朱紫限定版游戏卡带',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=nintendo%20switch%20oled%20game%20cartridge%20pokemon%20product%20photo&image_size=square',
          cate_name: '数码生活/游戏卡带',
          brand_name: '任天堂',
          source_type: 'self',
          price: 358.0,
          supply_price: 280.0,
          integral: 3200,
          sort: 0,
          supplier: '上海游戏专营店',
          status: 'on',
          market_price: 399.0,
          cost_price: 285.0,
          fake_sales: 89,
          external_code: 'NS-SW-012',
          stock: 45,
          original_price: 368.0,
          unit: '盒',
          product_code: 'P010',
          is_presale: 0,
          ref_count: 2,
        },
        {
          id: 87797,
          name: '迪士尼草莓熊毛绒公仔30cm限定版',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=disney%20strawberry%20bear%20plush%20toy%2030cm%20cute%20product%20photo&image_size=square',
          cate_name: '其他/其他1',
          brand_name: '迪士尼',
          source_type: 'self',
          price: 199.0,
          supply_price: 85.0,
          integral: 1800,
          sort: 0,
          supplier: '迪士尼官方授权',
          status: 'on',
          market_price: 259.0,
          cost_price: 90.0,
          fake_sales: 234,
          external_code: 'DNF-STB-88',
          stock: 88,
          original_price: 219.0,
          unit: '个',
          product_code: 'P011',
          is_presale: 0,
          ref_count: 5,
        },
        {
          id: 87796,
          name: '小熊电器多功能养生壶1.8L',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=small%20bear%20health%20pot%20electric%20kettle%20product%20photo&image_size=square',
          cate_name: '家居好物/小熊电器',
          brand_name: '小熊',
          source_type: 'self',
          price: 169.0,
          supply_price: 98.0,
          integral: 1500,
          sort: 0,
          supplier: '小熊电器直供',
          status: 'on',
          market_price: 229.0,
          cost_price: 102.0,
          fake_sales: 67,
          external_code: 'BEAR-HP-556',
          stock: 156,
          original_price: 189.0,
          unit: '台',
          product_code: 'P012',
          is_presale: 0,
          ref_count: 1,
        },
        {
          id: 87795,
          name: '大疆 DJI Mini 3 Pro 无人机标准套装',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=dji%20mini%203%20pro%20drone%20product%20photo&image_size=square',
          cate_name: '数码生活/大疆',
          brand_name: '大疆',
          source_type: 'self',
          price: 4788.0,
          supply_price: 4200.0,
          integral: 43000,
          sort: 0,
          supplier: '大疆官方',
          status: 'on',
          market_price: 5999.0,
          cost_price: 4250.0,
          fake_sales: 12,
          external_code: 'DJI-M3P-01',
          stock: 25,
          original_price: 4988.0,
          unit: '套',
          product_code: 'P013',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87794,
          name: '全棉时代纯棉柔巾洗脸巾抽取式80抽*3包',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pure%20cotton%20facial%20tissue%20wet%20wipes%20product%20photo&image_size=square',
          cate_name: '家居好物/全棉时代',
          brand_name: '全棉时代',
          source_type: 'self',
          price: 49.9,
          supply_price: 28.0,
          integral: 450,
          sort: 0,
          supplier: '全棉时代直供',
          status: 'on',
          market_price: 69.9,
          cost_price: 30.0,
          fake_sales: 445,
          external_code: 'PCT-COT-88',
          stock: 890,
          original_price: 59.9,
          unit: '组',
          product_code: 'P014',
          is_presale: 0,
          ref_count: 8,
        },
        {
          id: 87793,
          name: '三利日式纯棉毛巾套装家用吸水不掉毛',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=japanese%20style%20cotton%20towel%20set%20home%20product%20photo&image_size=square',
          cate_name: '家居好物/全棉时代',
          brand_name: '全棉时代',
          source_type: 'self',
          price: 35.0,
          supply_price: 18.0,
          integral: 315,
          sort: 0,
          supplier: '全棉时代直供',
          status: 'off',
          market_price: 55.0,
          cost_price: 20.0,
          fake_sales: 188,
          external_code: 'SL-TOW-20',
          stock: 5,
          original_price: 42.0,
          unit: '套',
          product_code: 'P015',
          is_presale: 0,
          ref_count: 0,
        },
        {
          id: 87792,
          name: '小米手环8 NFC版智能运动手表',
          image:
            'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=xiaomi%20smart%20band%208%20nfc%20fitness%20tracker%20product%20photo&image_size=square',
          cate_name: '数码生活/小米',
          brand_name: '小米',
          source_type: 'self',
          price: 299.0,
          supply_price: 220.0,
          integral: 2690,
          sort: 0,
          supplier: '小米生态链',
          status: 'on',
          market_price: 399.0,
          cost_price: 225.0,
          fake_sales: 321,
          external_code: 'XM-BAND8-NFC',
          stock: 230,
          original_price: 329.0,
          unit: '个',
          product_code: 'P016',
          is_presale: 0,
          ref_count: 4,
        },
      ],
    };
  },
  methods: {
    checkSelectable(row) {
      return row.source_type !== 'flagship';
    },
    formatPrice(val) {
      if (val === null || val === undefined || val === '') return '0.00';
      return Number(val).toFixed(2);
    },
    getSourceText(type) {
      const map = {
        self: '自营',
        flagship: '旗舰',
        third: '第三方',
      };
      return map[type] || type;
    },
    handleSearch() {
      this.ids = [];
      this.selectedIds = [];
      this.selectionList = [];
      this.productFrom.page = 1;
      this.getList();
    },
    handleReset() {
      this.productFrom = {
        keyword: '',
        cate_id: '',
        brand_id: '',
        source_type: '',
        supplier: '',
        is_presale: '',
        price_min: '',
        price_max: '',
        status: '',
        page: 1,
        limit: 15,
      };
      this.selectedIds = [];
      this.getList();
    },
    onClickTab() {
      this.productFrom.page = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      this.total = this.tableList.length;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    handlePageChange() {
      this.selectionList = [];
      this.getList();
    },
    handleSelectRow(selection, row) {
      this.selectionList = selection;
      let ids = selection.map((e) => e.id);
      this.selectedIds = ids;
      this.ids = [...ids];
    },
    handleSelectAll(selection) {
      this.selectionList = selection;
      let ids = selection.map((e) => e.id);
      this.selectedIds = ids;
      this.ids = [...ids];
    },
    handleAdd() {
      this.$router.push({ name: 'product_productAddNew' });
    },
    handleViewAnnotation() {
      this.annotationVisible = true;
    },
    handleEdit(row) {
      this.$router.push({ name: 'product_productAddNew', params: { id: row.id } });
    },
    handleView(row) {
      this.currentProduct = row;
      this.drawerVisible = true;
    },
    handleCloseDrawer() {
      this.drawerVisible = false;
    },
    handleStatusChange(row, val) {
      if (!val) {
        this.currentProduct = row;
        this.impactData = {
          rooms: Math.floor(Math.random() * 10),
          orders: Math.floor(Math.random() * 5),
          activities: Math.floor(Math.random() * 3),
          integral: Math.floor(Math.random() * 2),
        };
        this.offDialogVisible = true;
      } else {
        row.status = 'on';
        this.$message.success('商品已上架');
      }
    },
    confirmOff() {
      if (this.currentProduct) {
        this.currentProduct.status = 'off';
        this.$message.success('商品已下架');
      }
      this.offDialogVisible = false;
    },
    handleMenu(row, name) {
      switch (name) {
        case 'copy':
          this.$message.success('商品复制成功');
          break;
        case 'recycle':
          this.$confirm(`确定将商品【${row.name}】移到回收站吗？`, '提示', {
            type: 'warning',
          })
            .then(() => {
              this.$message.success('已移到回收站');
            })
            .catch(() => {});
          break;
      }
    },
    handleBatchModify() {
      if (!this.ids.length) {
        this.$message.warning('请选择要修改的商品');
        return;
      }
      this.$confirm(
        `确定批量修改选中的 ${this.ids.length} 项商品吗？修改将影响所有选中商品的公共属性。`,
        '批量修改确认',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.$message.success('批量修改成功');
        })
        .catch(() => {});
    },
    handleBatchOff() {
      if (!this.ids.length) {
        this.$message.warning('请选择要下架的商品');
        return;
      }
      this.batchCount = this.ids.length;
      this.impactData = {
        rooms: Math.floor(Math.random() * 10) + 1,
        orders: Math.floor(Math.random() * 20) + 1,
        activities: Math.floor(Math.random() * 5),
      };
      this.batchOffDialogVisible = true;
    },
    confirmBatchOff() {
      this.batchOffDialogVisible = false;
      this.$message.success('批量下架成功');
    },
    handleExport() {
      this.$message.info('商品导出中...');
    },
    handleImport() {
      this.$message.info('商品导入');
    },
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
  },
  computed: {
    hasReferences() {
      return (
        this.impactData.rooms > 0 ||
        this.impactData.orders > 0 ||
        this.impactData.activities > 0 ||
        this.impactData.integral > 0
      );
    },
  },
  mounted() {
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  created() {
    this.getList();
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-tabs__item {
  height: 54px !important;
  line-height: 54px !important;
}

.flagship-tip {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fffbe6;
  border-left: 4px solid #e6a23c;
  margin: 16px 0;
  font-size: 13px;
  color: #ad8b00;

  i {
    margin-right: 8px;
  }
}

.userAlert {
  margin-top: 20px;
}

.userI {
  color: var(--prev-color-primary);
  font-style: normal;
}

.op-row {
  margin-top: 10px;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  color: #303133;
  line-height: 1.5;
  font-weight: 500;
}

.product-meta {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
}

.meta-item {
  color: #909399;
}

.meta-divider {
  margin: 0 8px;
  color: #dcdfe6;
}

.price-text {
  color: #e6a23c;
  font-weight: 500;
}

.price-stock-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-row {
  display: flex;
  align-items: center;
}

.price-label {
  color: #909399;
  font-size: 12px;
  margin-right: 4px;
}

.price-value {
  color: #e6a23c;
  font-weight: 500;
}

.stock-value {
  color: #67c23a;

  &.warning {
    color: #f56c6c;
  }
}

.status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 12px;
  color: #606266;
}

.reference-group {
  display: flex;
  align-items: center;
}

.ref-item {
  display: flex;
  align-items: center;
  color: #409eff;
  font-size: 12px;
  cursor: pointer;

  i {
    margin-right: 4px;
  }
}

.ref-empty {
  color: #909399;
  font-size: 12px;
}

.source-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.self {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.flagship {
    background: #e3f2fd;
    color: #1565c0;
  }

  &.third {
    background: #fce4ec;
    color: #c2185b;
  }
}

.tabBox_img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.action-link {
  color: #409eff;
  cursor: pointer;
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

.drawer-content {
  padding: 16px;
}

.drawer-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  width: calc(50% - 8px);
  display: flex;
  align-items: center;

  &.full-width {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;

    .detail-label {
      margin-bottom: 8px;
    }
  }
}

.detail-label {
  color: #909399;
  min-width: 80px;
  font-size: 13px;
}

.detail-value {
  color: #303133;
  font-size: 13px;

  &.price {
    color: #e6a23c;
    font-weight: 500;
  }

  &.ref-count {
    color: #409eff;
    font-weight: 500;
  }
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  &.success {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.warning {
    background: #fef3c7;
    color: #d97706;
  }

  &.info {
    background: #e3f2fd;
    color: #1565c0;
  }

  &.default {
    background: #f5f5f5;
    color: #757575;
  }
}

.image-preview {
  max-width: 200px;

  .main-image {
    width: 100%;
    border-radius: 4px;
  }
}

.ref-dialog-content {
  padding: 16px;
}

.ref-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;

  h4 {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
  }
}

.ref-count {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.batch-dialog-content {
  padding: 20px;
}

.warning-icon {
  text-align: center;
  margin-bottom: 16px;

  i {
    font-size: 48px;
    color: #e6a23c;
  }
}

.warning-text {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.impact-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;

  h4 {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 12px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: #303133;

    i {
      margin-right: 8px;
      color: #909399;
    }
  }
}

.confirm-section {
  text-align: center;

  p {
    font-size: 13px;
    color: #909399;
  }

  &.warning {
    p {
      color: #e6a23c;
    }
  }
}

.product-info-cell {
  display: flex;
  align-items: center;

  .product-image {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-detail {
    flex: 1;
    margin-left: 10px;
    min-width: 0;
  }
}

.product-list-page {
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
