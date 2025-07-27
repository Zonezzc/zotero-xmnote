# Release Notes - v1.3.1

## 🎯 Smart Content Prioritization

### ✨ New Feature: Intelligent Sorting by Note Content

XMnote Plugin now automatically prioritizes books with rich content, ensuring your most valuable research materials are imported first.

#### 📊 Key Features

- **Smart Priority**: Books with more notes and annotations are imported first
- **Content Analysis**: Automatic calculation of note count + annotation count for each item
- **Flexible Sorting**: Multiple sorting options (by notes, annotations, total content, title, date)
- **User Control**: Customizable sort order (descending/ascending) and sorting criteria

#### 🎯 Default Behavior

```typescript
// Default configuration
{
  sortBy: "totalContent",    // Sort by notes + annotations count
  sortOrder: "desc"          // Content-rich books first
}
```

#### 📈 Benefits

- **Immediate Access**: Your most annotated books appear first in XMnote
- **Research Efficiency**: Focus on content-rich materials when energy is high
- **Smart Organization**: Automatically identifies your most valuable resources
- **Time Saving**: No need to manually sort through hundreds of books

### 🔧 Technical Implementation

#### Enhanced Data Structure
- Added `noteCount` and `annotationCount` fields to `ZoteroItem` type
- Real-time content statistics during data extraction
- Comprehensive logging for transparency

#### Sorting Options
- `totalContent` (default): Combined notes + annotations
- `noteCount`: Sort by number of notes only
- `annotationCount`: Sort by number of annotations only  
- `title`: Alphabetical sorting
- `dateAdded`: Sort by addition date
- `none`: Disable sorting

#### Performance Optimized
- Sorting happens after data extraction (no database impact)
- Content statistics calculated on-demand
- Fast sorting even for large libraries (>1000 items)

### 📊 Example Output

```
Sorting 50 items by totalContent in desc order
First item: "Advanced Deep Learning" (15 notes, 47 annotations)
Top items by content:
  1. "Advanced Deep Learning": 62 total (15 notes + 47 annotations)
  2. "Machine Learning in Practice": 38 total (12 notes + 26 annotations)
  3. "Data Science Fundamentals": 28 total (8 notes + 20 annotations)
```

### 🔄 Backward Compatibility

- ✅ All existing export functions work unchanged
- ✅ Optional feature - can be disabled with `sortBy: "none"`
- ✅ Existing workflows unaffected
- ✅ Zero breaking changes

### 📚 Documentation

- Comprehensive sorting feature documentation added
- Developer API examples included
- Usage scenarios and best practices outlined

### 🐛 Bug Fixes & Improvements

- Improved code organization with removal of unused modules
- Enhanced error handling and logging
- Better TypeScript type definitions
- Optimized build process

---

## 🚀 Usage

### Quick Start
The plugin now automatically sorts by content richness - no configuration needed!

### Custom Sorting
```typescript
const exportOptions = {
  sortBy: "noteCount",       // Sort by notes only
  sortOrder: "desc",         // Richest content first
  includeNotes: true,
  includeAnnotations: true
};
```

### Disable Sorting
```typescript
const exportOptions = {
  sortBy: "none"            // Keep original order
};
```

## 📦 Installation

1. Download the `zotero-xmnote-plugin.xpi` file from this release
2. In Zotero, go to **Tools** → **Add-ons**
3. Click the gear icon ⚙️ → **Install Add-on From File**
4. Select the downloaded `.xpi` file
5. Restart Zotero

## 🎉 Perfect For

- **Researchers**: Prioritize heavily annotated papers
- **Students**: Focus on books with extensive notes
- **Academics**: Highlight core literature with rich content
- **Knowledge Workers**: Access most valuable resources first

---

**Release Date**: 2025-07-27  
**Previous Version**: v1.3.0  
**New Features**: Smart content-based sorting with priority import

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>