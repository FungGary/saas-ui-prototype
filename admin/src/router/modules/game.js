// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------

import LayoutMain from '@/layout';
import setting from '@/setting';
let routePre = setting.routePre;

const pre = 'game_';

export default {
  path: routePre + '/game',
  name: 'game',
  header: 'game',
  redirect: {
    name: `${pre}roomRoomList`,
  },
  is_show: 1,
  component: LayoutMain,
  children: [
    {
      // 房间 -> 房间列表
      path: 'room/roomList',
      name: `${pre}roomRoomList`,
      meta: {
        auth: true,
        title: '房间列表',
        keepAlive: true,
      },
      is_show: 1,
      component: () => import('@/pages/game/room/roomList'),
    },
    {
      // 添加/编辑房间
      path: 'room/roomAddEdit/:id?',
      name: `${pre}roomAddEdit`,
      meta: {
        auth: true,
        title: '添加房间',
        keepAlive: false,
      },
      is_show: 0,
      component: () => import('@/pages/game/room/roomAddEdit'),
    },
    {
      // 房间 -> 审核管理
      path: 'review/list',
      name: `${pre}reviewList`,
      meta: {
        auth: true,
        title: '审核管理',
        keepAlive: true,
      },
      is_show: 1,
      component: () => import('@/pages/game/review'),
    },
    {
      // 房间 -> 申诉管理 -> 申诉列表
      path: 'appeal/list',
      name: `${pre}appealList`,
      meta: {
        auth: true,
        title: '申诉列表',
        keepAlive: true,
      },
      is_show: 1,
      component: () => import('@/pages/game/appeal/list'),
    },
    {
      // 房间 -> 申诉管理 -> 申诉黑名单
      path: 'appeal/blacklist',
      name: `${pre}appealBlacklist`,
      meta: {
        auth: true,
        title: '申诉黑名单',
        keepAlive: true,
      },
      is_show: 1,
      component: () => import('@/pages/game/appeal/blacklist'),
    },
    {
      // 配置管理
      path: 'config',
      name: `${pre}config`,
      meta: {
        auth: true,
        title: '配置管理',
        keepAlive: false,
      },
      is_show: 1,
      redirect: { name: `${pre}config_backpack` },
      component: () => import('@/pages/game/config'),
      children: [
        {
          path: 'backpack',
          name: `${pre}config_backpack`,
          meta: {
            auth: true,
            title: '背包配置',
            keepAlive: false,
            activeMenu: routePre + '/game/config',
          },
          is_show: 0,
          component: () => import('@/pages/game/config/backpack'),
        },
        {
          path: 'clawMachine',
          name: `${pre}config_clawMachine`,
          meta: {
            auth: true,
            title: '娃娃机配置',
            keepAlive: false,
            activeMenu: routePre + '/game/config',
          },
          is_show: 0,
          component: () => import('@/pages/game/config/clawMachine'),
        },
        {
          path: 'recharge',
          name: `${pre}config_recharge`,
          meta: {
            auth: true,
            title: '充值配置',
            keepAlive: false,
            activeMenu: routePre + '/game/config',
          },
          is_show: 0,
          component: () => import('@/pages/game/config/recharge'),
        },
        {
          path: 'icon',
          name: `${pre}config_icon`,
          meta: {
            auth: true,
            title: 'icon配置',
            keepAlive: false,
            activeMenu: routePre + '/game/config',
          },
          is_show: 0,
          component: () => import('@/pages/game/config/icon'),
        },
      ],
    },

  ],
};
