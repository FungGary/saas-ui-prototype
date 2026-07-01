# 用户管理模块 - 原型标注系统

## 概述

本文档介绍用户管理模块的原型标注系统，用于产品评审、研发评审和测试验收。

## 标注文件结构

```
admin/src/
├── annotations/
│   └── annotations.json          # 标注数据文件
├── components/
│   └── annotation/
│       ├── index.js             # 组件导出
│       ├── AnnotationContainer.vue  # 主容器组件
│       ├── AnnotationLayer.vue     # 标注层(页面标注点)
│       ├── AnnotationPanel.vue     # 右侧标注面板
│       ├── AnnotationMarker.vue     # 单个标注点
│       └── AnnotationDetail.vue    # 标注详情
└── pages/
    └── user/
        └── list_new/
            ├── index.vue               # 原始用户列表页
            ├── annotation-index.vue    # 带标注的用户列表页
            └── annotation-review.vue   # 标注评审独立页面
```

## 访问方式

### 1. 标注评审页面（推荐）

独立页面，可查看所有标注的详细列表和筛选功能：

```
http://localhost:1618/admin/user/annotation/review
```

### 2. 带标注的用户列表页

在用户列表页面上显示标注点：

```
http://localhost:1618/admin/user/annotation/list
```

## 功能说明

### 标注评审页面

- **统计概览**：显示总标注数、P0/P1/P2 各级别数量
- **筛选功能**：按页面、标注类型、优先级、状态筛选
- **页面清单**：可快速切换到不同页面
- **标注列表**：右侧列表展示所有标注
- **详情查看**：点击标注查看完整详情

### 带标注的用户列表页

- **显示/隐藏标注**：右上角工具栏控制
- **标注点**：红色(P0)、橙色(P1)、灰色(P2)
- **标注面板**：右侧面板显示标注列表
- **交互联动**：点击标注点或列表项可高亮定位

## 标注 ID 说明

| ID 范围 | 页面 |
|---|---|
| A001-A006 | 用户列表页 |
| A007-A009 | 金币积分调整弹窗 |
| A010-A012 | 客服派币弹窗 |
| A013-A017 | 禁言设置弹窗 |
| A018 | 修改身份弹窗 |
| A019 | 新增用户抽屉 |
| A020-A023 | 用户详情抽屉 |

## 标注优先级

- **P0**：核心功能，必须标注
- **P1**：重要功能，建议标注
- **P2**：辅助信息，可选标注

## 技术实现

### 依赖组件

- Vue 2.x
- ElementUI
- SCSS

### 标注数据结构

每条标注包含：

- `id`: 标注唯一标识
- `pageId`: 所属页面 ID
- `type`: 标注类型（字段说明/交互说明/状态说明/权限说明）
- `title`: 标注标题
- `description`: 标注说明
- `businessRule`: 业务规则
- `interaction`: 交互规则
- `validation`: 校验规则
- `permission`: 权限说明
- `priority`: 优先级
- `status`: 状态（confirmed/inferred/pending_confirm）

## 后续扩展

### 补充 data-component-id

当前标注使用推断定位，建议在正式实现时为所有标注元素补充稳定的 `data-component-id`：

```html
<el-date-picker
  data-component-id="filter-registration-time"
  v-model="userFrom.dateRange"
  ...
></el-date-picker>
```

### 其他模块标注

可参考用户管理模块的标注结构，为其他模块生成标注：

- 房间管理
- 抓娃记录
- 申诉管理
- 订单管理

## 注意事项

1. 标注数据存储在 `annotations.json` 中，可独立维护
2. 标注面板不影响原型原有业务交互
3. 定位失败时有明确提示
4. 支持版本对比（通过 ID 和 status 字段）

## 版本信息

- 版本：V1.0
- 更新时间：2026-06-22
- 更新内容：初始版本，包含 23 条标注