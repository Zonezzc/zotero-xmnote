# Zotero XMnote Plugin

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/releases)
[![GitHub](https://img.shields.io/github/license/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/blob/main/LICENSE)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

A powerful Zotero plugin that seamlessly integrates with XMnote server for efficient data export and synchronization.

**Languages**: [English](README-en.md) | [简体中文](README.md)

## ✨ Features

- 🔗 **XMnote Integration**: Connect Zotero with XMnote server for seamless data export
- 📤 **Smart Export Options**: Export all items, selected items, or current collection with intelligent default selection
- 📂 **Current Collection Export**: New collection export feature - export all items in the currently selected collection
  with one click
- 🎯 **Intelligent Default Selection**: Automatically selects the most appropriate export scope based on context (
  priority: selected items > current collection > all items)
- 🔄 **Dynamic Interface Updates**: Export description text updates in real-time, clearly showing what content will be
  exported
- ⚙️ **Configurable Server Settings**: Easy setup with IP, port, timeout, and other configurations
- 🖱️ **Context Menu Support**: Quick access through right-click menus on collections and items
- 🌍 **Multi-language Support**: Interface available in English and Chinese (Simplified)
- 🎛️ **User-friendly Preferences**: Intuitive configuration panel with real-time connection testing
- 📊 **Batch Processing**: Configurable batch size and retry mechanisms for large datasets
- 🔒 **Reliable Transfer**: Built-in error handling and connection validation

## 📥 Installation

### Method 1: Download from GitHub Releases (Recommended)

1. Go to the [Releases page](https://github.com/Zonezzc/zotero-xmnote/releases)
2. Download the latest `zotero-xmnote-plugin.xpi` file
3. In Zotero, go to **Tools** → **Add-ons**
4. Click the gear icon ⚙️ → **Install Add-on From File**
5. Select the downloaded `.xpi` file
6. Restart Zotero

### Method 2: Direct Download

- **Direct Link
  **: [Download v1.4.2](https://github.com/Zonezzc/zotero-xmnote/releases/download/v1.4.2/zotero-xmnote-plugin.xpi)
- **File Size**: 60KB
- **SHA256**: `36fdf7e51c3094365573ca8f36d0405e76c919d403c64dbdaaa878ab5000bd10`

## ⚙️ Configuration

### Initial Setup

1. Open Zotero preferences: **Edit** → **Preferences** (or **Zotero** → **Preferences** on macOS)
2. Click on the **XMnote** tab
3. Configure your server settings:

### Server Settings

| Setting          | Description                        | Default         | Range       |
|------------------|------------------------------------|-----------------|-------------|
| **IP Address**   | XMnote server IP address           | `192.168.1.100` | Valid IP    |
| **Port**         | XMnote server port                 | `8080`          | 1-65535     |
| **Timeout (ms)** | Connection timeout in milliseconds | `30000`         | 1000-300000 |

### Import Options

| Option                  | Description            | Default   |
|-------------------------|------------------------|-----------|
| **Include Notes**       | Export item notes      | ✅ Enabled |
| **Include Annotations** | Export PDF annotations | ✅ Enabled |
| **Include Metadata**    | Export item metadata   | ✅ Enabled |
| **Batch Size**          | Items per batch        | `10`      |
| **Retry Count**         | Failed request retries | `3`       |

### Connection Testing

1. After configuring server settings, click **Test Connection**
2. The status indicator will show:
    - 🟢 **Connected**: Server is accessible
    - 🔴 **Failed**: Connection failed (check settings)
    - 🟡 **Testing**: Connection in progress

## 🚀 Usage

### Smart Export Selection

The plugin offers three export methods with intelligent default selection based on current context:

#### Export Selected Items (Highest Priority)

1. Select one or more items in your Zotero library
2. Go to **Tools** → **XMnote** → **Export Selected Items**
3. The export dialog will default to "Selected Items" option
4. Only the selected items will be exported

#### Export Current Collection (Second Priority)

1. Select a collection in the library panel
2. Go to **Tools** → **XMnote** → **Export Selected Items**
3. If no items are selected, the export dialog will default to "Current Collection" option
4. All items in the current collection will be exported

#### Export All Items (Default Option)

1. Go to **Tools** → **XMnote** → **Export All Items**
2. Or when no items or collections are selected, the export dialog will default to "All Items" option
3. The plugin will export all items in your library to the configured XMnote server
4. Progress will be shown in a popup window

### Export Dialog

The export dialog provides flexible options:

- **All Items**: Export all items in the library
- **Selected Items**: Export only currently selected items
- **Current Collection**: Export all items in the currently selected collection
- Description text updates dynamically based on selection, clearly showing the quantity and scope of content to be
  exported

### Context Menu Actions

**For Collections:**

1. Right-click on any collection in the library panel
2. Select **Export to XMnote** from the context menu
3. All items in the collection will be exported

**For Items:**

1. Right-click on any item(s) in the center panel
2. Select **Export to XMnote** from the context menu
3. Selected item(s) will be exported

## 🔧 Technical Details

### System Requirements

- **Zotero Version**: 7.0 or later
- **Operating System**: Windows, macOS, Linux
- **Network**: Access to XMnote server (local network or internet)

### Plugin Information

- **Plugin ID**: `zotero-xmnote`
- **Version**: 1.6.0
- **License**: AGPL-3.0-or-later
- **Architecture**: Event-driven, modular design

### Data Format

The plugin exports Zotero items in a structured format that includes:

- **Bibliographic metadata** (title, authors, publication details)
- **Item notes** (if enabled)
- **PDF annotations** (if enabled and available)
- **Tags and collections** information
- **File attachments** metadata

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Zonezzc/zotero-xmnote.git
cd zotero-xmnote

# Install dependencies
npm install

# Development build with hot reload
npm start

# Production build
npm run build
```

### Project Structure

- `src/` - TypeScript source code
- `addon/` - Static plugin files (manifest, preferences UI, locales)
- `releases/` - Release packages and documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add your feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues)
- **Documentation**: [Project Wiki](https://github.com/Zonezzc/zotero-xmnote/wiki)
- **Email**: zonezzc@foxmail.com

## 📄 License

This project is licensed under the AGPL-3.0-or-later License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- Powered by [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- Thanks to the Zotero development team for their excellent extensibility framework

---

⭐ **If this plugin helps you, please consider giving it a star on GitHub!**
