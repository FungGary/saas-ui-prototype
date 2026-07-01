// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------

import axios from 'axios';
import { Message } from 'element-ui';
import { getCookies, removeCookies } from '@/libs/util';
import Setting from '@/setting';
import router from '@/router';
import { loginMock, loginInfoMock, menuMock, dashboardMock } from '@/mock/login';

const mockHandlers = {
  '/login/info': () => {
    return { data: loginInfoMock.success };
  },
  '/login': () => {
    return { data: loginMock.login.success };
  },
  '/menu': () => {
    return { data: menuMock.success };
  },
  '/dashboard': () => {
    return { data: dashboardMock.success };
  },
  '/menus': () => {
    return { data: menuMock.success };
  },
  '/auth': () => {
    return { data: { status: 200, message: 'success', data: { force_reminder: 0 } } };
  },
  '/home/header': () => {
    return { data: { status: 200, message: 'success', data: { today_order: 123, today_money: 4567.89, today_users: 89, total_users: 12345 } } };
  },
  '/home/order': () => {
    return { data: { status: 200, message: 'success', data: { series: [], xAxisData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], today_order: 123, yesterday_order: 100, today_money: 4567.89, yesterday_money: 3890.50 } } };
  },
  '/home/user': () => {
    return { data: { status: 200, message: 'success', data: { series: [], xAxisData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], new_users: 89, active_users: 456 } } };
  },
  '/home/rank': () => {
    return { data: { status: 200, message: 'success', data: { list: [] } } };
  },
};

const defaultMockData = (url, method) => {
  const baseResponse = {
    status: 200,
    message: '操作成功',
  };
  if (method === 'get') {
    if (url.includes('/list') || url.includes('/index')) {
      return { data: { ...baseResponse, data: { list: [], count: 0, page: 1, limit: 10 } } };
    }
    return { data: { ...baseResponse, data: [] } };
  }
  return { data: { ...baseResponse, data: {} } };
};

const mockAdapter = (config) => {
  return new Promise((resolve, reject) => {
    const url = config.url;

    for (const mockUrl in mockHandlers) {
      if (url.includes(mockUrl)) {
        const result = mockHandlers[mockUrl](config);
        resolve({ ...result, status: 200, statusText: 'OK' });
        return;
      }
    }

    // 开发环境：所有未匹配的请求返回 mock 数据
    const mockResult = defaultMockData(url, config.method);
    resolve({ ...mockResult, status: 200, statusText: 'OK' });
  });
};

const service = axios.create({
  baseURL: Setting.apiBaseURL,
  timeout: 100000,
  adapter: mockAdapter,
});

axios.defaults.withCredentials = true;

service.interceptors.request.use(
  (config) => {
    if (config.kefu) {
      let baseUrl = Setting.apiBaseURL.replace(/adminapi/, 'kefuapi');
      config.baseURL = baseUrl;
    } else {
      config.baseURL = Setting.apiBaseURL;
    }
    if (config.file) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    const token = getCookies('token');
    const kefuToken = getCookies('kefu_token');
    if (token || kefuToken) {
      config.headers['Authori-zation'] = config.kefu ? 'Bearer ' + kefuToken : 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    let obj = {};
    if (!!response.data) {
      if (typeof response.data == 'string') {
        obj = JSON.parse(response.data);
      } else {
        obj = response.data;
      }
    }
    let status = response.data ? obj.status : 0;
    // let status = response.data ? response.data.status : 0;
    const code = status;
    switch (code) {
      case 200:
        return obj;
      case 401:
        localStorage.clear();
        removeCookies('token');
        removeCookies('expires_time');
        removeCookies('uuid');
        router.replace({ name: 'login' }).catch(() => {});
        return Promise.reject({ msg: '未登录' });
      case 402:
        removeCookies('kefuInfo');
        removeCookies('kefu_token');
        removeCookies('kefu_expires_time');
        removeCookies('kefu_uuid');
        router.replace({ path: '/kefu' }).catch(() => {});
        return Promise.reject({ msg: '未登录' });
      case 403:
        router.replace({ name: 'system_opendir_login' }).catch(() => {});
        return Promise.reject({ msg: '没有权限' });
      default:
        return Promise.reject(obj || { msg: '未知错误' });
    }
  },
  (error) => {
    Message.error(error.msg);
    return Promise.reject(error);
  },
);

export default service;
