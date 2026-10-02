# 🎵 Spotify API 集成指南

LunaTV 现已集成 Spotify API,可以直接获取数百万首真实音乐数据!

## 快速设置 (3 分钟)

### 1️⃣ 创建 Spotify 开发者应用

1. 访问 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. 用 Spotify 账户登录(没有就创建免费账户)
3. 点击 "**Create an App**"
4. 填写应用名称和描述
5. 同意条款,点击 "**Create**"

### 2️⃣ 获取凭证

应用创建后,你会看到:
- **Client ID** - 复制这个
- **Client Secret** - 点击"Show Client Secret"后复制这个

### 3️⃣ 配置环境变量

**在 Railway 中:**

1. 打开你的 LunaTV 项目
2. 进入 "Variables" 标签
3. 添加两个环境变量:
   ```
   SPOTIFY_CLIENT_ID=<你的 Client ID>
   SPOTIFY_CLIENT_SECRET=<你的 Client Secret>
   ```
4. 点击 "Deploy" 重新部署

**本地开发:**

创建 `.env.local` 文件:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 4️⃣ 完成! 🎉

现在音乐播放器会显示:
- ✅ 热门歌曲(首次加载)
- ✅ 搜索功能(搜索真实 Spotify 歌曲)
- ✅ 歌曲预览(30 秒片段)
- ✅ 艺术家和专辑信息

## 功能详情

### 获取热门歌曲

首次访问音乐页面时,会自动加载当前 Spotify 热门曲目(每周更新)。

### 搜索歌曲

输入歌曲名称或艺术家名字搜索。例如:
- `Taylor Swift`
- `Blinding Lights`
- `周杰伦`

### 预览音乐

Spotify 提供每首歌曲的 30 秒预览链接。点击播放即可试听!

## 常见问题

### Q: 我没有 Spotify 高级账户可以吗?
A: 可以!Spotify 免费账户完全可以使用开发者 API。

### Q: 预览音乐为什么有时不可用?
A: 某些歌曲出于版权原因可能没有预览 URL。搜索其他歌曲就可以了。

### Q: 可以直接播放完整歌曲吗?
A: 当前使用 Spotify 的预览功能(30 秒)。要播放完整歌曲需要 Spotify Premium 账户和额外的认证流程。

### Q: API 有速率限制吗?
A: Spotify 对开发者免费账户的速率限制很宽松(每秒几个请求),完全足够日常使用。

### Q: 环境变量配置后还是显示备用数据?
A: 
1. 检查变量名是否正确: `SPOTIFY_CLIENT_ID` 和 `SPOTIFY_CLIENT_SECRET`
2. 确保已重新部署应用
3. 检查 Railway 部署日志中是否有错误信息

## 技术细节

### 认证方式
使用 **Client Credentials Flow**(服务器到服务器认证):
- 无需用户登录
- 自动令牌刷新
- 适合获取公开数据

### API 端点
- `/api/music/songs` - 获取热门歌曲或搜索
  - 查询参数: `?q=搜索关键词&limit=20`

### 数据缓存
- Spotify 访问令牌在内存中缓存 (有效期 1 小时)
- 减少不必要的认证请求
- 提高响应速度

### 备用方案
如果 Spotify API 失败:
- 自动返回本地示例数据
- 确保应用不会完全崩溃
- 用户可以继续使用收藏和播放列表功能

## 更多功能可以添加

- 🎸 获取艺术家信息
- 🎼 获取专辑详情
- 📊 用户播放历史(需要 OAuth 认证)
- 🎯 个性化推荐
- 🔄 用户播放列表同步

## 需要帮助?

- [Spotify API 文档](https://developer.spotify.com/documentation/web-api)
- [Spotify 开发者论坛](https://developer.spotify.com/community)

