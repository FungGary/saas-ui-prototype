<template>
  <div class="level-edit-page" :class="{ 'annotation-mode': showAnnotation }">
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

    <pages-header
      ref="pageHeader"
      :title="$route.params.id ? '编辑等级页面' : '添加等级页面'"
      :backUrl="$routeProStr + '/user/level_new'"
    ></pages-header>
    
    <el-card :bordered="false" shadow="never" class="mt16">
      <div class="section">
        <h3 class="section-title">基础信息</h3>
        <el-form
          class="form"
          ref="formValidate"
          :model="formValidate"
          :rules="ruleValidate"
          :label-width="labelWidth"
          :label-position="labelPosition"
          @submit.native.prevent
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="等级名称" prop="levelName" label-for="levelName">
                <el-input
                  placeholder="请输入等级名称"
                  v-model="formValidate.levelName"
                  class="content_width"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="等级" prop="level" label-for="level" id="form-level-field">
                <div style="position: relative;">
                  <el-select v-model="formValidate.level" placeholder="请输入等级" class="content_width">
                    <el-option v-for="n in 10" :key="n" :value="n" :label="'LV' + n"></el-option>
                  </el-select>
                  <annotation-point 
                    title="【新增】等级说明" 
                    content="优化前：当前「等级」字段缺少解释，运营不清楚等级数值的含义。&#10;&#10;优化后：增加说明文字：「等级用于排序和等级判断，数值越大等级越高。例如：LV1填1，LV2填2。」&#10;&#10;原因：避免运营误填等级序号，导致等级排序错乱，影响用户体验。" 
                    priority="P0"
                  />
                </div>
                <div class="grey mt5" style="position: relative;">
                  等级用于排序和等级判断，数值越大等级越高。<br/>
                  例如：LV1填1，LV2填2。
                  <annotation-point 
                    title="【优化】等级唯一性校验" 
                    content="优化前：保存后才提示「等级已存在」，用户需重新填写并再次提交，操作效率低。&#10;&#10;优化后：填写时即进行后端校验，实时提示等级是否重复。&#10;&#10;原因：保证用户操作效率，减少返工，提升表单填写体验。" 
                    priority="P1"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="成长值" prop="growthValue" label-for="growthValue" id="form-growthValue-field">
                <div style="position: relative;">
                  <el-input
                    type="number"
                    placeholder="请输入成长值"
                    v-model.number="formValidate.growthValue"
                    class="content_width"
                  />
                  <annotation-point 
                    title="【优化】成长值说明优化" 
                    content="优化前：仅提示「升级到该等级需达到的最低成长值」，术语不够明确。&#10;&#10;优化后：明确为「升级门槛成长值」，并说明「达到该值后可进入该等级」，附带示例说明。&#10;&#10;原因：成长值是核心规则字段，需要清晰定义，让运营准确理解其含义，避免配置错误。" 
                    priority="P0"
                  />
                </div>
                <div class="grey mt5">
                  升级门槛成长值，用户累计成长值达到该数值后，<br/>
                  可进入当前等级。<br/>
                  例如：LV2成长值配置为2000，则用户累计成长值<br/>
                  ≥2000时可升级至LV2。
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="等级描述" label-for="description">
                <el-input
                  type="textarea"
                  placeholder="请输入等级描述"
                  v-model="formValidate.description"
                  class="content_width"
                  :rows="5"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="info-section" id="growth-source-section">
        <div class="info-icon">
          <i class="el-icon-info"></i>
        </div>
        <div class="info-content">
          <h4>成长值来源规则</h4>
          <p>用户可通过充值、消费、投币、邀请好友、完成任务等行为获得成长值，具体发放规则由系统配置决定，本页面仅配置各等级所需的成长值门槛。</p>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">等级装饰</h3>
        <el-form :model="formValidate" :label-width="labelWidth" :label-position="labelPosition">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="字体颜色" label-for="fontColor">
                <div class="color-picker">
                  <el-color-picker v-model="formValidate.fontColor" show-alpha class="color-input"></el-color-picker>
                  <el-input v-model="formValidate.fontColor" placeholder="请输入字体颜色" class="color-text"></el-input>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="进度条颜色" label-for="progressColor">
                <div class="color-picker">
                  <el-color-picker v-model="formValidate.progressColor" show-alpha class="color-input"></el-color-picker>
                  <el-input v-model="formValidate.progressColor" placeholder="请输入进度条颜色" class="color-text"></el-input>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="背景图片" label-for="backgroundImage">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  @success="handleUploadSuccess('backgroundImage')"
                >
                  <div v-if="formValidate.backgroundImage" class="upload-preview">
                    <img :src="formValidate.backgroundImage" alt="背景图片" />
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="el-icon-plus"></i>
                    <span>上传</span>
                  </div>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户等级背景" label-for="levelBackground">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  @success="handleUploadSuccess('levelBackground')"
                >
                  <div v-if="formValidate.levelBackground" class="upload-preview">
                    <img :src="formValidate.levelBackground" alt="等级背景" />
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="el-icon-plus"></i>
                    <span>上传</span>
                  </div>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="图标" label-for="icon">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  @success="handleUploadSuccess('icon')"
                >
                  <div v-if="formValidate.icon" class="upload-preview">
                    <img :src="formValidate.icon" alt="图标" />
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="el-icon-plus"></i>
                    <span>上传</span>
                  </div>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="section">
        <h3 class="section-title">等级礼包</h3>
        <div class="gift-list">
          <div class="gift-item">
            <el-checkbox v-model="formValidate.gifts.coin.enabled">
              <span class="gift-label">送</span>
              <el-input
                type="number"
                placeholder="请输入数量"
                v-model.number="formValidate.gifts.coin.amount"
                class="gift-input"
                :disabled="!formValidate.gifts.coin.enabled"
              />
              <span class="gift-type">金币</span>
            </el-checkbox>
          </div>
          <div class="gift-item">
            <el-checkbox v-model="formValidate.gifts.pointCoin.enabled">
              <span class="gift-label">送</span>
              <el-input
                type="number"
                placeholder="请输入数量"
                v-model.number="formValidate.gifts.pointCoin.amount"
                class="gift-input"
                :disabled="!formValidate.gifts.pointCoin.enabled"
              />
              <span class="gift-type">积分币</span>
            </el-checkbox>
          </div>
          <div class="gift-item">
            <el-checkbox v-model="formValidate.gifts.point.enabled">
              <span class="gift-label">送</span>
              <el-input
                type="number"
                placeholder="请输入数量"
                v-model.number="formValidate.gifts.point.amount"
                class="gift-input"
                :disabled="!formValidate.gifts.point.enabled"
              />
              <span class="gift-type">积分</span>
            </el-checkbox>
          </div>
          <div class="gift-item">
            <el-checkbox v-model="formValidate.gifts.prize">
              <span class="gift-type">奖品设置</span>
            </el-checkbox>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" class="save-btn" v-db-click @click="handleSubmit('formValidate')">保存</el-button>
        <el-button class="cancel-btn" v-db-click @click="handleReset">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AnnotationPanel from '@/components/annotation/AnnotationPanel.vue';
import AnnotationPoint from '@/components/AnnotationPoint/index.vue';
import AnnotationHighlight from '@/components/annotation/AnnotationHighlight.vue';
import annotationData from '@/annotations/annotations.json';

export default {
  name: 'LevelEdit',
  components: {
    AnnotationPanel,
    AnnotationPoint,
    AnnotationHighlight
  },
  data() {
    return {
      showAnnotation: false,
      showMarkers: true,
      activeAnnotationId: null,
      annotations: annotationData.annotations,
      formValidate: {
        id: null,
        levelName: '',
        level: 1,
        growthValue: 0,
        description: '',
        fontColor: '#ffffff',
        progressColor: '#409eff',
        backgroundImage: '',
        levelBackground: '',
        icon: '',
        gifts: {
          coin: { amount: 0, enabled: false },
          pointCoin: { amount: 0, enabled: false },
          point: { amount: 0, enabled: false },
          prize: false
        }
      },
      ruleValidate: {
        levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
        level: [{ required: true, message: '请选择等级', trigger: 'change' }],
        growthValue: [{ required: true, message: '请输入成长值', trigger: 'blur' }]
      }
    };
  },
  computed: {
    ...mapState('media', ['isMobile']),
    labelWidth() {
      return this.isMobile ? undefined : '100px';
    },
    labelPosition() {
      return this.isMobile ? 'top' : 'right';
    }
  },
  mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.loadData(id);
    }
    this.bus.$on('annotationToggle', this.handleAnnotationToggle);
  },
  beforeDestroy() {
    this.bus.$off('annotationToggle', this.handleAnnotationToggle);
  },
  methods: {
    loadData(id) {
      const mockData = {
        id: id,
        levelName: 'LV' + id,
        level: parseInt(id),
        growthValue: 500 * parseInt(id),
        description: '等级' + id + '专属权益描述',
        fontColor: '#ffffff',
        progressColor: '#409eff',
        backgroundImage: '',
        levelBackground: '',
        icon: '',
        gifts: {
          coin: { amount: 2 * parseInt(id), enabled: true },
          pointCoin: { amount: 10 * parseInt(id), enabled: false },
          point: { amount: 0, enabled: false },
          prize: false
        }
      };
      this.formValidate = { ...mockData };
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        this.$message.error('请上传图片文件');
        return false;
      }
      return true;
    },
    handleUploadSuccess(field, response) {
      this.formValidate[field] = response.data?.url || '';
    },
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$message.success(this.formValidate.id ? '编辑成功' : '添加成功');
          this.$router.push(this.$routeProStr + '/user/level_new');
        }
      });
    },
    handleReset() {
      this.$router.push(this.$routeProStr + '/user/level_new');
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
.level-edit-page {
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

.section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }
}

.form {
  ::v-deep .el-form-item {
    margin-bottom: 20px;
  }
}

.grey {
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.mt5 {
  margin-top: 5px;
}

.info-section {
  background: #f5f7fa;
  border-left: 4px solid #409eff;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;

  .info-icon {
    margin-right: 10px;
    font-size: 16px;
    color: #409eff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-content {
    flex: 1;

    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 6px 0;
    }

    p {
      font-size: 12px;
      color: #606266;
      margin: 0;
      line-height: 1.5;
    }
  }
}

.color-picker {
  display: flex;
  align-items: center;

  .color-input {
    width: 50px;
    margin-right: 10px;
  }

  .color-text {
    width: 150px;
  }
}

.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #409eff;
  }
}

.upload-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;

  i {
    font-size: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}

.gift-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.gift-item {
  display: flex;
  align-items: center;

  .gift-label {
    color: #909399;
    margin-right: 8px;
  }

  .gift-input {
    width: 100px;
    margin-right: 8px;
  }

  .gift-type {
    color: #606266;
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 30px;
  border-top: 1px solid #ebeef5;
  margin-top: 20px;

  .save-btn, .cancel-btn {
    width: 120px;
    margin-right: 10px;
  }
}
</style>