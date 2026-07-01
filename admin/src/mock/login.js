export const loginMock = {
  login: {
    success: {
      status: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-123456789',
        expires_time: Math.round(Date.now() / 1000) + 86400,
        user_info: {
          id: 1,
          account: 'admin',
          nickname: '超级管理员',
          head_pic: '',
          role_id: 1,
          role_name: '超级管理员',
        },
        site_func: ['admin-index-index', 'admin-product-list', 'admin-order-list'],
        unique_auth: ['admin-index-index', 'admin-product-list', 'admin-order-list'],
        menus: [
          {
            id: 1,
            pid: 0,
            name: '仪表盘',
            path: '/admin/index',
            icon: 'icon-shuju',
            component: 'index/index',
            children: [],
          },
          {
            id: 2,
            pid: 0,
            name: '商品管理',
            path: '/product',
            icon: 'icon-shangpin',
            component: '',
            children: [
              {
                id: 3,
                pid: 2,
                name: '商品列表',
                path: '/product/list',
                icon: '',
                component: 'product/list',
              },
              {
                id: 4,
                pid: 2,
                name: '商品分类',
                path: '/product/category',
                icon: '',
                component: 'product/category',
              },
            ],
          },
          {
            id: 5,
            pid: 0,
            name: '订单管理',
            path: '/order',
            icon: 'icon-dingdan',
            component: '',
            children: [
              {
                id: 6,
                pid: 5,
                name: '订单列表',
                path: '/order/list',
                icon: '',
                component: 'order/list',
              },
            ],
          },
        ],
        logo: '',
        logo_square: '',
        version: 'CRMEB 5.7.0',
        newOrderAudioLink: '',
      },
    },
    fail: {
      status: 400,
      message: '账号或密码错误',
      data: null,
    },
  },
};

export const loginInfoMock = {
  success: {
    status: 200,
    message: '获取成功',
    data: {
      site_name: 'CRMEB管理后台',
      login_logo: '',
      slide: [],
      key: 'mock-key',
      copyright: 'CRMEB 版权所有',
      version: 'CRMEB 5.7.0',
      login_captcha: 0,
    },
  },
};

export const menuMock = {
  success: {
    status: 200,
    message: '获取菜单成功',
    data: [],
  },
};

export const dashboardMock = {
  success: {
    status: 200,
    message: '获取数据成功',
    data: {
      today_order: 123,
      today_money: 4567.89,
      today_users: 89,
      total_users: 12345,
      order_trend: [120, 135, 142, 138, 156, 167, 178],
      user_trend: [80, 85, 92, 88, 95, 102, 110],
    },
  },
};

export const customAdminJsMock = '';
