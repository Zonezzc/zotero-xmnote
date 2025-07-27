# Zotero XMnote Plugin v1.1.0

## 🎉 Major Features

### 🧠 Smart Current Page Detection

- **New Feature**: Intelligent current page detection system
- **Auto-Skip Logic**: Automatically skips items without `totalPageCount` to prevent import failures
- **Default Enabled**: Smart detection is enabled by default for better user experience
- **Progress Tracking**: Accurately tracks reading progress when complete metadata is available

### 📋 Enhanced Error Reporting

- **Detailed Error Messages**: Export summaries now show specific error reasons
- **User-Friendly Feedback**: Clear indication of what went wrong and how to fix it
- **Better Debugging**: Comprehensive logging for troubleshooting

## 🔧 Improvements

### Configuration Options

- Added `includeCurrentPage` configuration option with smart detection
- Updated preferences UI with clearer descriptions and warnings
- Improved configuration management and persistence

### Import Reliability

- **Intelligent Field Management**: Only includes page fields when complete data is available
- **Reduced Import Failures**: Prevents XMnote server errors due to missing required fields
- **Graceful Degradation**: Falls back to basic import when metadata is incomplete

### User Experience

- **Smart Defaults**: Optimal settings out-of-the-box
- **Clear Feedback**: Better progress indication and error reporting
- **Comprehensive Documentation**: Added detailed feature documentation

## 📊 Technical Details

### New Configuration Options

| Setting              | Default | Description                                 |
| -------------------- | ------- | ------------------------------------------- |
| `includeCurrentPage` | `true`  | Smart current page detection with auto-skip |

### API Compatibility

- Maintains full backward compatibility with v1.0.0
- Enhanced XMnote API integration with better error handling
- Improved field validation and data integrity

### Smart Detection Logic

1. **Complete Items** (with totalPageCount):
   - ✅ Includes both `currentPage` and `totalPageCount`
   - ✅ Calculates current page from annotations or defaults to page 1
   - ✅ Successful import to XMnote

2. **Incomplete Items** (without totalPageCount):
   - 🚫 Removes both `currentPage` and `totalPageCount` fields
   - ⚠️ Logs warning for user awareness
   - ✅ Prevents import failures

## 🛠️ Breaking Changes

**None** - This release is fully backward compatible with v1.0.0

## 📖 Documentation

- Added comprehensive current page feature documentation
- Updated configuration guides with new options
- Enhanced troubleshooting section

## 🐛 Bug Fixes

- Fixed async Promise handling in PDF page count extraction
- Improved database query error handling
- Enhanced field validation and type checking

## 🙏 Acknowledgments

- Enhanced error handling based on user feedback
- Smart detection system designed for real-world usage patterns
- Thanks to the community for testing and feedback

---

## Download

- **Plugin File**: `zotero-xmnote-plugin.xpi`
- **Version**: 1.1.0
- **Compatible**: Zotero 7 and later
- **Languages**: English, Chinese (Simplified)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
