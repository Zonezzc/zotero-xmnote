# CI/CD 故障排除指南

本文档提供了诊断和修复 GitHub Actions CI 失败的完整流程。

## 诊断CI失败问题

### 1. 查看最近的CI运行状态

```bash
gh run list --limit 5
```

显示最近5次workflow运行的状态和ID。

### 2. 查看失败的具体运行详情

```bash
gh run view <run-id>
# 例如: gh run view 17118726001
```

显示特定运行的详细信息，包括各个job的状态。

### 3. 查看失败日志的详细信息

```bash
gh run view <run-id> --log-failed
```

显示失败job的完整日志输出，帮助定位具体错误。

## 修复代码格式问题

### 4. 自动修复代码格式和lint问题

```bash
npm run lint:fix
```

自动修复Prettier格式问题和ESLint规范问题。

### 5. 提交并推送修复

```bash
git add -A
git commit -m "style: fix code formatting issues"
git push
```

将修复提交并推送，触发CI重新运行。

## 完整故障排除流程

```bash
# 步骤1: 检查CI状态
gh run list --limit 5

# 步骤2: 查看失败详情（替换为实际的run-id）
gh run view <run-id> --log-failed

# 步骤3: 修复格式问题
npm run lint:fix

# 步骤4: 提交修复
git add -A && git commit -m "style: fix formatting issues" && git push
```

## 常见CI失败原因及解决方案

### 代码格式问题

- **症状**: Prettier检查失败，提示"Code style issues found"
- **解决**: 运行 `npm run lint:fix`
- **原因**: 文件格式不符合Prettier配置要求

### ESLint规范问题

- **症状**: ESLint检查失败，提示代码规范错误
- **解决**: 运行 `npm run lint:fix`
- **原因**: 代码不符合ESLint规则

### TypeScript编译错误

- **症状**: 构建失败，提示类型错误
- **解决**: 检查和修复TypeScript类型定义
- **调试**: 运行 `npm run build` 本地测试

### 测试失败

- **症状**: 测试job失败
- **解决**: 运行 `npm test` 本地调试
- **调试**: 检查测试用例和实现逻辑

## 预防措施

### 本地开发检查

在提交代码前运行以下命令：

```bash
# 检查格式和规范
npm run lint:check

# 本地构建测试
npm run build

# 运行测试
npm test
```

### 提交前自动修复

```bash
# 一键修复格式问题
npm run lint:fix

# 检查修复结果
npm run lint:check
```

## 工具命令参考

| 命令                            | 作用                   |
| ------------------------------- | ---------------------- |
| `gh run list`                   | 列出workflow运行记录   |
| `gh run view <id>`              | 查看运行详情           |
| `gh run view <id> --log-failed` | 查看失败日志           |
| `npm run lint:check`            | 检查代码格式和规范     |
| `npm run lint:fix`              | 自动修复格式和规范问题 |
| `npm run build`                 | 本地构建测试           |
| `npm test`                      | 运行测试               |

## 注意事项

1. **及时修复**: CI失败时应立即处理，避免影响团队开发
2. **本地测试**: 修复后在本地验证，确保问题解决
3. **提交规范**: 使用清晰的commit message描述修复内容
4. **定期检查**: 定期运行本地检查命令，预防CI失败

---

**最后更新**: 2025-08-21  
**适用版本**: v1.6.0+
