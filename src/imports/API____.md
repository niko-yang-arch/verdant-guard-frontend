# 绿植渴了植物养护应用 API 接口文档

## 目录

- [基础信息](#基础信息)
- [认证说明](#认证说明)
- [认证接口](#认证接口)
- [植物管理接口](#植物管理接口)
- [浇水记录接口](#浇水记录接口)
- [AI 智能助手接口](#ai-智能助手接口)
- [文件上传接口](#文件上传接口)
- [错误响应格式](#错误响应格式)

---

## 基础信息

### 服务地址
- **开发环境**: `http://localhost:3000`
- **生产环境**: 待配置

### 请求/响应格式
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`

### 通用 HTTP 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（需要登录） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证说明

### 获取 Token
通过微信登录获取 JWT Token，详见 [微信登录](#微信登录) 接口。

### 使用 Token
在需要认证的接口请求头中添加：

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token 说明
- JWT Token 用于身份验证
- Token 包含用户 ID 信息
- 未携带 Token 或 Token 无效会返回 401 错误

---

## 认证接口

### 健康检查
检查服务是否正常运行。

**接口地址**
```
GET /health
```

**响应示例**
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T08:00:00.000Z"
}
```

---

### 微信登录
使用微信授权码登录，获取用户信息和 JWT Token。

**接口地址**
```
POST /api/auth/wechat/login
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 微信授权码 |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/auth/wechat/login \
  -H "Content-Type: application/json" \
  -d '{"code": "WECHAT_CODE"}'
```

**响应示例**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "plantCount": 3
  }
}
```

---

### 获取当前用户信息
获取当前登录用户的详细信息。

**接口地址**
```
GET /api/auth/me
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例**
```json
{
  "id": "user_id_here",
  "nickname": "测试用户",
  "avatar": "https://example.com/avatar.jpg",
  "plantCount": 3,
  "createdAt": "2026-05-26T08:00:00.000Z"
}
```

---

## 植物管理接口

### 获取植物列表
获取当前用户的所有植物列表。

**接口地址**
```
GET /api/plants/list
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例**
```json
[
  {
    "id": 1,
    "name": "发财树",
    "species": "马拉巴栗",
    "frequency": 10,
    "frequencyType": "DAYS",
    "image": "https://example.com/plant.jpg",
    "lastWatered": null,
    "createdAt": "2026-05-26T08:16:58.126Z",
    "historyCount": 0
  }
]
```

---

### 获取植物详情
获取单个植物的详细信息，包含浇水历史。

**接口地址**
```
GET /api/plants/info/:id
```

**路径参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 植物 ID（纯数字） |

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例**
```json
{
  "id": 1,
  "userId": "user_id_here",
  "name": "发财树",
  "species": "马拉巴栗",
  "frequency": 10,
  "frequencyType": "DAYS",
  "image": "https://example.com/plant.jpg",
  "lastWatered": null,
  "createdAt": "2026-05-26T08:16:58.126Z",
  "history": [
    {
      "id": "water_log_id",
      "date": "2026-05-26T08:00:00.000Z"
    }
  ]
}
```

---

### 添加新植物
添加一株新植物。

**接口地址**
```
POST /api/plants/add
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 植物名称（如"发财树"），1-50 字符 |
| species | string | 是 | 植物种类（如"马拉巴栗"），1-50 字符 |
| frequency | integer | 是 | 浇水频率（整数），1-365 |
| frequencyType | string | 是 | 频率类型，`DAYS`（每 N 天浇水一次）或 `TIMES_PER_DAY`（每天浇水 N 次） |
| image | string | 否 | 植物图片 URL |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/plants/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "富贵竹",
    "species": "富贵竹",
    "frequency": 7,
    "frequencyType": "DAYS"
  }'
```

**响应示例**
```json
{
  "id": 1,
  "name": "富贵竹",
  "species": "富贵竹",
  "frequency": 7,
  "frequencyType": "DAYS",
  "userId": "user_id_here",
  "createdAt": "2026-05-26T08:30:00.000Z"
}
```

---

### 更新植物信息
更新植物的基本信息。

**接口地址**
```
POST /api/plants/update/:id
```

**路径参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 植物 ID（数字） |

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
参数同 [添加新植物](#添加新植物)，但所有参数都是可选的。

**响应示例**
```json
{
  "id": 1,
  "name": "更新后的植物名",
  "species": "更新后的种类",
  "frequency": 10,
  "frequencyType": "DAYS"
}
```

---

### 删除植物
删除一株植物（会级联删除相关浇水记录）。

**接口地址**
```
POST /api/plants/delete/:id
```

**路径参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 植物 ID（纯数字） |

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 植物名称（如"发财树"），1-50 字符 |
| species | string | 是 | 植物种类（如"马拉巴栗"），1-50 字符 |
| frequency | integer | 是 | 浇水频率（整数），1-365 |
| frequencyType | string | 是 | 频率类型，`DAYS`（每 N 天浇水一次）或 `TIMES_PER_DAY`（每天浇水 N 次） |
| image | string | 否 | 植物图片 URL |

**响应示例**
```json
{
  "success": true
}
```

---

## 浇水记录接口

### 记录浇水
给植物记录一次浇水，会同时更新植物的最后浇水时间。

**接口地址**
```
POST /api/water-logs/add
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| plantId | integer | 是 | 植物 ID（数字） |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/water-logs/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plantId": 1}'
```

**响应示例**
```json
{
  "id": "water_log_id_here",
  "date": "2026-05-26T08:45:00.000Z"
}
```

---

### 获取日历视图
获取指定月份的浇水记录，按天聚合显示。

**接口地址**
```
GET /api/water-logs/calendar
```

**查询参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| year | integer | 是 | 年份（如 2026） |
| month | integer | 是 | 月份（1-12） |

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**请求示例**
```bash
curl -X GET "http://localhost:3000/api/water-logs/calendar?year=2026&month=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**
```json
{
  "year": "2026",
  "month": "5",
  "data": {
    "15": [
      {
        "id": 1,
        "name": "发财树",
        "image": "https://example.com/plant.jpg",
        "count": 1
      }
    ],
    "20": [
      {
        "id": 2,
        "name": "绿萝",
        "image": "https://example.com/pothos.jpg",
        "count": 2
      }
    ]
  }
}
```

---

### 获取植物浇水历史
获取指定植物的浇水历史记录。

**接口地址**
```
GET /api/water-logs/plant/:plantId
```

**路径参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| plantId | integer | 是 | 植物 ID（纯数字） |

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应示例**
```json
[
  {
    "id": "water_log_id_1",
    "date": "2026-05-26T08:45:00.000Z"
  },
  {
    "id": "water_log_id_2",
    "date": "2026-05-19T09:30:00.000Z"
  }
]
```

---

## AI 智能助手接口

### 获取植物养护建议
基于植物信息或用户问题，获取 AI 智能养护建议。

**接口地址**
```
POST /api/ai/tips
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| plantName | string | 是 | 植物名称 |
| species | string | 是 | 植物种类 |
| question | string | 否 | 用户具体问题（如"叶子发黄怎么办？"） |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/ai/tips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plantName": "发财树",
    "species": "马拉巴栗",
    "question": "叶子发黄怎么办？"
  }'
```

**响应示例**
```json
{
  "text": "发财树叶子发黄可能的原因及解决方法：\n\n1. 检查浇水：发财树不喜欢过多水分，保持土壤微湿即可\n2. 光照需求：避免阳光直射，放在散光处\n3. 温度控制：适宜温度为15-30度\n\n请根据具体情况调整养护方式。"
}
```

---

## 文件上传接口

### 上传植物图片
上传植物图片到阿里云 OSS，图片信息会保存到数据库。

**接口地址**
```
POST /api/upload/plant-image
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 图片文件，支持 jpg/png/webp/gif，最大 5MB |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/upload/plant-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

**响应示例**
```json
{
  "id": "clx1234567890abcdef",
  "url": "https://your-oss-bucket.oss-cn-hangzhou.aliyuncs.com/plants/user_id_here/timestamp.jpg"
}
```

**响应字段说明**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 图片记录 ID，用于后续删除操作 |
| url | string | 图片访问 URL |

---

### 删除植物图片
通过图片 ID 删除 OSS 中的图片和数据库记录。

**接口地址**
```
POST /api/upload/delete
```

**请求头**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**请求参数**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 图片记录 ID（上传时返回的 id） |

**请求示例**
```bash
curl -X POST http://localhost:3000/api/upload/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "clx1234567890abcdef"}'
```

**响应示例**
```json
{
  "success": true
}
```

**错误响应**
```json
{
  "error": "Image not found"
}
```

---

## 错误响应格式

所有错误响应统一格式：

```json
{
  "error": "错误描述信息"
}
```

### 参数验证错误
```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": "name",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-05-26 | 1.0 | 初始版本，完成基础接口文档 |
| 2026-05-27 | 1.1 | 植物ID改为纯数字类型（integer），移除所有string类型的植物ID示例 |
| 2026-05-27 | 1.2 | 图片上传接口返回 id 和 url；删除接口改为通过 id 删除 |
