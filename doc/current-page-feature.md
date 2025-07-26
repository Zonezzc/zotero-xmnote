# Current Page Feature (当前页数功能)

## 功能概述

"Include Current Page"功能允许插件在导出到XMnote时包含当前阅读页数信息，帮助用户在XMnote中准确记录阅读进度。

## 智能检测机制

从v1.0.0开始，该功能采用**智能检测机制**，确保导入的稳定性：

### 开启状态下的行为逻辑

1. **检查条目是否具备完整的页数信息**
   - 检查是否存在 `totalPageCount`（总页数）
   - 只有具备总页数的条目才会设置当前页数

2. **完整条目的处理**（有totalPageCount）
   - ✅ **保留** `totalPageCount` 字段
   - ✅ **计算并设置** `currentPage` 字段：
     - 优先使用注释中的最大页数
     - 如无注释则默认设为第1页
   - ✅ **正常导入**到XMnote

3. **不完整条目的处理**（无totalPageCount）
   - 🚫 **移除** `currentPage` 字段
   - 🚫 **移除** `totalPageCount` 字段
   - ⚠️ **记录警告日志**
   - ✅ **避免导入失败**（XMnote要求totalPageCount不能为空）

### 关闭状态下的行为

- 不设置 `currentPage` 字段
- 保留 `totalPageCount` 字段（如果存在）
- 可能因缺少必需字段导致导入失败

## 配置说明

### 默认设置
- **默认状态**: ✅ 已启用
- **推荐设置**: 保持启用状态

### 配置位置
1. 打开Zotero → **编辑** → **首选项**
2. 点击 **XMnote** 标签页
3. 在"Import Options"部分找到：
   ```
   ☑️ Include Current Page (Smart Detection)
   ✅ Auto-skips items without totalPageCount to prevent import failures
   ```

## 使用建议

### 最佳实践

1. **保持功能启用**（推荐）
   - 利用智能检测机制
   - 自动处理不完整的条目
   - 获得最佳的导入成功率

2. **手动维护页数信息**
   - 在Zotero中设置书籍的"页数"字段
   - 确保重要文献有完整的元数据

### 页数信息的获取

插件会按以下优先级尝试获取页数：

1. **Zotero主条目字段**：`numPages`, `pages`, `totalPages` 等
2. **PDF附件信息**：从PDF文件的元数据中提取
3. **手动设置**：用户在Zotero中手动填入的页数信息

如果以上方法都无法获取页数，则视为"不完整条目"。

## 日志信息解读

### 正常处理日志
```
[DEBUG] Including current page as per configuration
[DEBUG] totalPageCount available (233), proceeding with currentPage calculation
[DEBUG] Found max annotation page: 96 for item: 非暴力沟通（修订版）
```

### 智能跳过日志
```
[WARN] No totalPageCount found for item: 某书籍, removing both currentPage and totalPageCount fields to avoid import failure
```

### 功能关闭日志
```
[DEBUG] Skipping current page as per configuration
[WARN] No PDF page count found for item: 某书籍. This may cause XMnote import to fail.
```

## 故障排除

### 问题：条目被跳过处理
**现象**: 日志显示"removing both currentPage and totalPageCount fields"

**解决方案**:
1. 在Zotero中编辑该条目
2. 在"页数"或"# of Pages"字段中输入正确的页数
3. 保存后重新导出

### 问题：仍然导入失败
**现象**: 即使启用智能检测，部分条目仍导入失败

**可能原因**:
- XMnote服务器要求其他必需字段
- 网络连接问题
- 服务器配置问题

**解决方案**:
1. 检查详细的错误信息
2. 确认XMnote服务器的具体要求
3. 检查网络连接和服务器设置

## 技术细节

### 字段映射
- `currentPage`: 当前阅读页数
- `totalPageCount`: 书籍总页数

### API兼容性
- 兼容XMnote API的页数要求
- 遵循"totalPageCount不能为空"的验证规则

### 性能影响
- 智能检测逻辑的性能开销极小
- 不影响正常的导出速度