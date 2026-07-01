# 前端原型开发 Prompt：UI风格对齐CRMEB参考

## 1. 你的角色

你是资深前端工程师，擅长根据 UI 参考生成高质量 B 端 SaaS 可点击原型。

## 2. 开发目标

将现有原型页面的UI风格对齐到参考页面 `https://v6.crmeb.net/admin/user/group` 的样式，打造专业的B端SaaS管理后台。

## 3. 参考UI特征分析

### 3.1 整体布局结构
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (200px)  │         Main Content               │
│  - Logo区域       │  ┌─────────────────────────────┐  │
│  - 菜单项         │  │ 页面标题 + 右侧操作按钮      │  │
│  - 底部折叠按钮    │  ├─────────────────────────────┤  │
│                   │  │ 筛选区域 (input + select +   │  │
│                   │  │         buttons)             │  │
│                   │  ├─────────────────────────────┤  │
│                   │  │ 数据表格                     │  │
│                   │  │ (带边框、斑马纹)             │  │
│                   │  ├─────────────────────────────┤  │
│                   │  │ 分页器                       │  │
│                   │  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 侧边栏规范
| 属性 | 值 |
|------|-----|
| 宽度 | 200px |
| 背景色 | #001529 (深蓝) |
| Logo背景 | 与侧边栏同色 |
| 菜单项文字 | rgba(255,255,255,0.65) |
| 菜单hover | rgba(255,255,255,0.08) |
| 选中菜单背景 | #1890ff (主蓝) |
| 选中菜单文字 | #ffffff |
| 子菜单背景 | #001529 (与父级同色，非黑色) |
| 展开箭头 | 选中时旋转90度 |

### 3.3 主内容区规范
| 属性 | 值 |
|------|-----|
| 背景色 | #f0f2f5 (浅灰) |
| 内边距 | 24px |
| 卡片背景 | #ffffff |
| 卡片圆角 | 8px |
| 卡片阴影 | 0 1px 2px rgba(0,0,0,0.03) |

### 3.4 页面标题区规范
- 标题在左侧，使用 20px 字体
- 操作按钮组在右侧（新建、导出等）
- 按钮使用 el-button type="primary"

### 3.5 筛选区域规范
- 放在卡片内，与表格之间无额外间隔
- 筛选区域包含：输入框、下拉选择、日期范围、查询按钮、重置按钮
- 布局：flex 横向排列，间距 12px
- 按钮：查询按钮 primary，重置按钮 default

### 3.6 表格规范
- 使用 el-table 组件
- 带 border
- 斑马纹：true (stripe)
- 表头背景：#fafafa
- 行高：48px
- 列：操作列固定在右侧，宽度约120px
- 操作按钮：小按钮，编辑/删除/详情

### 3.7 分页器规范
- 使用 el-pagination
- 位于表格下方
- 包含：总数、每页条数选择、翻页

### 3.8 状态标签规范
| 状态 | el-tag type |
|------|-------------|
| 正常/启用 | success (绿色) |
| 禁用 | info (灰色) |
| 待审核 | warning (橙色) |
| 已通过 | success (绿色) |
| 未通过 | danger (红色) |

## 4. 本轮实现范围

### 4.1 核心用户路径
用户分组管理页面 - 筛选、搜索、新建、编辑、删除

### 4.2 涉及页面改造
1. src/components/Sidebar.vue - 侧边栏样式对齐
2. src/pages/UsersPage.vue - 改造为用户分组页面

## 5. 侧边栏菜单结构调整

参考CRMEB菜单结构：

```
├── 首页
├── 用户管理
│   ├── 用户列表
│   ├── 会员等级
│   ├── 用户标签
│   ├── 账户充值
│   └── 提现管理
├── 客服管理
│   ├── 客服列表
│   ├── 客服话术
│   ├── 常见问题
│   ├── 自动回复
│   ├── 会话管理
│   └── 消息管理
├── 订单管理
│   ├── 背包管理
│   ├── 发货管理
│   ├── 存分记录
│   └── 赠送记录
├── 房间管理
│   ├── 设备管理
│   ├── 房间列表
│   ├── 房间分类
│   ├── 房间玩法
│   ├── 房间属性
│   ├── 审核管理
│   ├── 抓取记录
│   ├── 申诉管理
│   └── 申诉黑名单
├── 应用管理
├── 财务管理
│   ├── 充值记录
│   ├── 财务流水
│   ├── 账单记录
│   └── 退款记录
├── 统计
├── 配置管理
├── 装修管理
└── 设置
```

## 6. 用户分组页面功能

### 6.1 页面标题
用户分组

### 6.2 筛选区域
| 字段 | 组件 | 宽度 |
|------|------|------|
| 分组名称 | el-input | 200px |
| 状态 | el-select (全部/启用/禁用) | 120px |
| 查询 | el-button type="primary" | - |
| 重置 | el-button | - |

### 6.3 操作按钮
右侧固定："新建分组" button

### 6.4 表格列
| 列名 | 字段 | 宽度 |
|------|------|------|
| 分组ID | id | 100px |
| 分组名称 | name | - |
| 用户数量 | userCount | 120px |
| 状态 | status | 100px (tag) |
| 创建时间 | createTime | 180px |
| 操作 | - | 150px |

### 6.5 操作列
- 编辑 (text button)
- 删除 (text button, danger)

### 6.6 分页
- 默认每页10条
- 显示总数

### 6.7 新建/编辑弹窗
- 分组名称 input (必填)
- 状态 select (启用/禁用)
- 备注 textarea

## 7. Mock数据

```typescript
interface UserGroup {
  id: number
  name: string
  userCount: number
  status: 'enabled' | 'disabled'
  createTime: string
}

const userGroups: UserGroup[] = [
  { id: 1, name: '高价值用户', userCount: 156, status: 'enabled', createTime: '2024-01-15 10:30:00' },
  { id: 2, name: '活跃用户', userCount: 892, status: 'enabled', createTime: '2024-02-20 14:15:00' },
  { id: 3, name: '沉默用户', userCount: 2341, status: 'enabled', createTime: '2024-03-10 09:00:00' },
  { id: 4, name: '新用户', userCount: 567, status: 'disabled', createTime: '2024-06-01 16:45:00' },
  { id: 5, name: 'VIP用户', userCount: 89, status: 'enabled', createTime: '2024-01-05 08:30:00' }
]
```

## 8. 组件标识要求

每个核心元素必须添加 data-component-id：

```html
<!-- 页面容器 -->
<div data-component-id="user-group-page">

<!-- 筛选表单 -->
<el-form data-component-id="user-group-filter-form">
  <el-input data-component-id="user-group-name-input" />
  <el-select data-component-id="user-group-status-select" />
  <el-button data-component-id="user-group-search-btn" />
  <el-button data-component-id="user-group-reset-btn" />
</el-form>

<!-- 新建按钮 -->
<el-button data-component-id="user-group-create-btn" />

<!-- 数据表格 -->
<el-table data-component-id="user-group-table">
  <el-table-column data-component-id="user-group-column-id" />
  <el-table-column data-component-id="user-group-column-name" />
  <el-table-column data-component-id="user-group-column-count" />
  <el-table-column data-component-id="user-group-column-status" />
  <el-table-column data-component-id="user-group-column-time" />
  <el-table-column data-component-id="user-group-column-actions" />
</el-table>

<!-- 分页器 -->
<el-pagination data-component-id="user-group-pagination" />

<!-- 新建/编辑弹窗 -->
<el-dialog data-component-id="user-group-dialog">
  <el-form data-component-id="user-group-form">
    <el-form-item data-component-id="user-group-form-name" />
    <el-form-item data-component-id="user-group-form-status" />
    <el-form-item data-component-id="user-group-form-remark" />
  </el-form>
</el-dialog>
```

## 9. 交互要求

| 操作 | 反馈 |
|------|------|
| 点击查询 | 筛选表格数据 |
| 点击重置 | 清空筛选条件 |
| 点击新建 | 打开弹窗 |
| 点击编辑 | 打开弹窗，填充数据 |
| 点击删除 | 二次确认后删除 |
| 提交表单 | 表单校验 + 成功提示 |
| 分页切换 | 更新表格数据 |

## 10. 状态覆盖

| 状态 | 实现 |
|------|------|
| 默认状态 | 显示模拟数据表格 |
| 空状态 | 无数据时显示空状态插图和提示 |
| 加载状态 | 按钮点击显示 loading |
| 成功状态 | 操作成功显示 Message 提示 |
| 失败状态 | 显示错误提示 |

## 11. 验收标准

| 编号 | 验收项 |
|------|--------|
| B001 | 侧边栏背景色为 #001529 |
| B002 | 选中菜单背景色为 #1890ff |
| B003 | 子菜单背景色与侧边栏一致 |
| B004 | 主内容区背景色为 #f0f2f5 |
| B005 | 表格带斑马纹和边框 |
| B006 | 页面标题左侧，操作按钮右侧 |
| B007 | 筛选区域在卡片内，横向排列 |
| B008 | 分页器在表格下方 |
| B009 | 所有核心元素有 data-component-id |
| B010 | 新建/编辑弹窗表单校验完整 |
| B011 | 删除有二次确认 |
| B012 | 操作成功/失败有提示 |

## 12. 修改文件清单

1. src/components/Sidebar.vue - 侧边栏样式调整
2. src/pages/UsersPage.vue - 改造为用户分组管理页面
3. src/style.css - 检查并统一颜色变量
