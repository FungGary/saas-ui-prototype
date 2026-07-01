import AnnotationLayer from './AnnotationLayer.vue';
import AnnotationPanel from './AnnotationPanel.vue';
import AnnotationMarker from './AnnotationMarker.vue';
import AnnotationDetail from './AnnotationDetail.vue';
import annotationData from '@/annotations/annotations.json';

export {
  AnnotationLayer,
  AnnotationPanel,
  AnnotationMarker,
  AnnotationDetail
};

export default {
  install(Vue) {
    Vue.component('AnnotationLayer', AnnotationLayer);
    Vue.component('AnnotationPanel', AnnotationPanel);
    Vue.component('AnnotationMarker', AnnotationMarker);
    Vue.component('AnnotationDetail', AnnotationDetail);
  }
};

export { annotationData };