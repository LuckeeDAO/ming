# TC-MING 仪式型 NFT：定时铸造 + 赞助 Gas + 媒体 + 封局(默认三天/可指定) + 链上评价

## 适用范围（Ming 仓库）

该用例面向 `ming/srcs` 前端与其 E2E 测试框架（Playwright），并与钱包侧联调（AnDaoWallet Provider 或跨窗口桥接）。

## 对齐的 Use Case

- `works-docs/道安钱包项目/h5/docs/testing/use-cases/UC-01-普通用户_赞助Gas_定时铸造NFT_音频_封局评价_释放流通.md`
- `works-docs/道安钱包项目/h5/docs/testing/use-cases/UC-02-专业用户_自付Gas_定时铸造NFT_视频_释放自我保存.md`

## 测试用例

### TC-MING-001 赞助 Gas：选择未来时间定时铸造成功

- 前置条件
  - Ming 配置可连接钱包（AnDaoWallet 或 mock）
  - Sponsor/Paymaster 可用
- 步骤
  - 打开仪式铸造页面
  - 选择未来时间 `T`
  - 触发铸造并在钱包确认
- 期望
  - UI 显示“已计划/已发送/已完成”状态
  - 链上 mint 成功（可通过 txHash 或链上查询验证）

### TC-MING-002 媒体触发：铸造完成自动播放音频/打开视频

- 步骤
  - 等待铸造完成
- 期望
  - 音频播放状态触发（或视频弹层/页面打开）

### TC-MING-003 封局(链上 close) 与链上评价

- 前置条件
  - 可在测试环境缩短封局时间（或 mock 时间），或直接指定较短的 `closeAt`
- 步骤
  - 等待到 `closeAt` 并观察 close 交易链上确认
  - 提交评价并观察 review 交易链上确认
- 期望
  - close/review 都可查询且幂等

### TC-MING-004 失败：选择过去时间/非法时间

- 期望
  - Ming 在提交前阻止并提示

### TC-MING-005 失败：Paymaster 拒绝赞助

- 期望
  - 明确错误提示
  - 允许切换为自付（若支持）
