# Zotero XMnote Plugin v1.1.1

## 🐛 Critical Bug Fix

### Fixed Selective Export Issue

- **Bug**: Selecting "Selected Items (1)" in export dialog would export all items instead of just the selected item
- **Root Cause**: Property name mismatch in interface and dialog data binding failure
- **Solution**: Fixed interface consistency and improved UI state detection

## 🔧 Technical Fixes

### Code Improvements

- **Interface Consistency**: Unified `selectedItems` property naming across SelectiveExportOptions
- **Dialog State Detection**: Added direct UI state reading to bypass data binding issues
- **Debug Logging**: Enhanced logging for export scope detection and troubleshooting

### Affected Components

- `src/modules/exporter.ts`: Fixed SelectiveExportOptions interface
- `src/modules/ui/exportDialog.ts`: Improved export scope detection logic

## 📊 Impact

### Before Fix

- ❌ "Selected Items (1)" exported all items (incorrect behavior)
- ❌ User selection was ignored due to data binding failure

### After Fix

- ✅ "Selected Items (1)" exports exactly 1 selected item (correct behavior)
- ✅ Export scope properly respects user selection
- ✅ Improved reliability and user experience

## 🛠️ Breaking Changes

**None** - This release is fully backward compatible with v1.1.0

## 📖 Upgrade Notes

- Users experiencing selective export issues should update immediately
- No configuration changes required
- Plugin will automatically respect selected items properly

## 🙏 Acknowledgments

- Thanks for reporting the selective export bug
- Quick turnaround fix to maintain plugin reliability

---

## Download

- **Plugin File**: `zotero-xmnote-plugin.xpi`
- **Version**: 1.1.1
- **Compatible**: Zotero 7 and later
- **Languages**: English, Chinese (Simplified)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
