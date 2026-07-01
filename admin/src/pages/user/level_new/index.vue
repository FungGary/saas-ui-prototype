<template>
  <div class="user-level-page" :class="{ 'annotation-mode': showAnnotation }">
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
          ref="levelFrom"
          :model="levelFrom"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <el-form-item label="等级名称：" label-for="levelName">
            <el-input v-model="levelFrom.levelName" placeholder="请输入等级名称" clearable class="form_content_width">
            </el-input>
          </el-form-item>
          <el-form-item label="状态：" label-for="status">
            <el-select v-model="levelFrom.status" placeholder="请选择" clearable class="form_content_width">
              <el-option value="" label="全部"></el-option>
              <el-option value="1" label="启用"></el-option>
              <el-option value="0" label="禁用"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="search-form-sub">
            <el-button class="ResetSearch" v-db-click @click="reset('levelFrom')">重置</el-button>
            <el-button type="primary" v-db-click @click="userSearchs">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card :bordered="false" shadow="never" class="ivu-mt mt14">
      <el-button type="primary" v-db-click @click="handleAdd" class="mr14">添加用户等级</el-button>
      <el-table
        :data="levelLists"
        ref="table"
        class="mt14"
        v-loading="loading"
        highlight-current-row
        no-userFrom-text="暂无数据"
        no-filtered-userFrom-text="暂无筛选结果"
      >
        <el-table-column label="等级名称" min-width="120" prop="levelName">
          <template slot-scope="scope">
            <span>{{ scope.row.levelName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级成长值" min-width="120" prop="growthValue" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.growthValue }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级权益" min-width="180" prop="benefits">
          <template slot-scope="scope">
            <span>{{ scope.row.benefits }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级礼包" min-width="150">
          <template slot-scope="scope">
            <div v-for="(gift, index) in scope.row.giftPackages" :key="index" style="line-height: 1.8;">
              {{ gift }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户数量" min-width="100" prop="userCount" sortable>
          <template slot-scope="scope">
            <span style="color: #409eff;">{{ scope.row.userCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" id="table-status-column">
          <template slot="header">
            <span>状态</span>
            <annotation-point 
              title="【优化】状态改为开关控制" 
              content="优化前：状态仅用标签展示（启用/禁用），操作列单独提供禁用/启用按钮。&#10;&#10;优化后：状态改为开关控制，开启状态下点击关闭需确认提示，确认后开关才变更为关闭。&#10;&#10;原因：操作更直接便捷，减少列空间占用，同时保留防误操作的确认机制。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              :value="scope.row.status"
              @change="handleStatusChange(scope.row, scope.$index)"
              size="large"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="120">
          <template slot="header">
            <span>操作</span>
            <annotation-point 
              title="【优化】操作列精简" 
              content="优化前：操作列包含编辑、禁用/启用、删除三个操作。&#10;&#10;优化后：操作列精简为编辑、删除两个操作，状态切换移至状态列开关控制。&#10;&#10;原因：操作列更简洁，状态切换更直观，减少操作步骤。" 
              priority="P0"
            />
          </template>
          <template slot-scope="scope">
            <a v-db-click @click="edit(scope.row)">编辑</a>
            <el-divider direction="vertical"></el-divider>
            <a v-db-click @click="del(scope.row, '删除等级', scope.$index)">删除</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="acea-row row-right page">
        <pagination
          v-if="total"
          :total="total"
          :page.sync="levelFrom.page"
          :limit.sync="levelFrom.limit"
          @pagination="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import AnnotationPanel from '@/components/annotation/AnnotationPanel.vue';
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'UserLevelNew',
  components: {
    AnnotationPanel,
    AnnotationPoint,
    AnnotationHighlight
  },
  data() {
    return {
      loading: false,
      total: 4,
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      annotations: annotationData.annotations,
      levelFrom: {
        levelName: '',
        status: '',
        page: 1,
        limit: 15
      },
      levelLists: [
        {
          id: 1,
          levelName: 'LV1',
          growthValue: 500,
          benefits: '下单享受9折折扣',
          giftPackages: ['2金币', '10积分'],
          userCount: 1250,
          status: 1
        },
        {
          id: 2,
          levelName: 'LV2',
          growthValue: 1500,
          benefits: '下单享受8.5折折扣',
          giftPackages: ['5金币', '20积分', '专属头像框'],
          userCount: 856,
          status: 1
        },
        {
          id: 3,
          levelName: 'LV3',
          growthValue: 3000,
          benefits: '下单享受8折折扣',
          giftPackages: ['10金币', '50积分', '专属头像框', '优先客服'],
          userCount: 432,
          status: 0
        },
        {
          id: 4,
          levelName: 'LV4',
          growthValue: 5000,
          benefits: '下单享受7.5折折扣',
          giftPackages: ['20金币', '100积分', '专属头像框', '优先客服', '生日礼包'],
          userCount: 198,
          status: 0
        }
      ]
    };
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
    getList() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    userSearchs() {
      this.levelFrom.page = 1;
      this.getList();
    },
    reset(name) {
      this.levelFrom = {
        levelName: '',
        status: '',
        page: 1,
        limit: 15
      };
      this.getList();
    },
    handleAdd() {
      this.$router.push('/admin/user/level_new/edit');
    },
    edit(row) {
      this.$router.push('/admin/user/level_new/edit/' + row.id);
    },
    del(row, tit, num) {
      let delfromData = {
        title: tit,
        num: num,
        url: `user/user_level/delete/${row.id}`,
        method: 'DELETE',
        ids: ''
      };
      this.$modalSure(delfromData)
        .then(res => {
          this.$message.success(res.msg);
          this.levelLists.splice(num, 1);
          this.total--;
        })
        .catch(res => {
          this.$message.error(res.msg);
        });
    },
    handleStatusChange(row, index) {
      if (row.status === 1) {
        this.$confirm(`确定要禁用等级 ${row.levelName} 吗？禁用后该等级将不再对新用户开放。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.levelLists[index].status = 0;
          this.$message.success('等级已禁用');
        }).catch(() => {});
      } else {
        this.levelLists[index].status = 1;
        this.$message.success('等级已启用');
      }
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
  }
};
</script>

<style lang="scss" scoped>
.search-form-sub {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}

.user-level-page {
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