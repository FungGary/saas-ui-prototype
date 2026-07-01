import LayoutMain from '@/layout';
import setting from '@/setting';
let routePre = setting.routePre;

const pre = 'merchant_';

export default {
  path: routePre + '/merchant',
  name: 'merchant',
  header: 'merchant',
  meta: {
    title: '商户管理',
    auth: ['merchant'],
  },
  redirect: { name: `${pre}paramConfig` },
  component: LayoutMain,
  children: [
    {
      path: 'param_config',
      name: `${pre}paramConfig`,
      meta: {
        auth: ['merchant-param-config'],
        title: '参数配置',
      },
      component: () => import('@/pages/merchant/paramConfig/index'),
    },
  ],
};
