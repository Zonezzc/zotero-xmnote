# Zotero XMnote Plugin

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/releases)
[![GitHub](https://img.shields.io/github/license/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/blob/main/LICENSE)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

A powerful Zotero plugin that seamlessly integrates with XMnote server for efficient data export and synchronization.

**Languages**: [English](README.md) | [简体中文](README-zh.md)

## ✨ Features

- 🔗 **XMnote Integration**: Connect Zotero with XMnote server for seamless data export
- 📤 **Flexible Export Options**: Export all items or selected items with customizable settings
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

- **Direct Link**: [Download v1.0.0](https://github.com/Zonezzc/zotero-xmnote/releases/download/v1.0.0/zotero-xmnote-plugin.xpi)
- **File Size**: 54KB
- **SHA256**: `f45931620bc3b3b73611c339ffd3c4f8dc541c0182583b89e6ad1dfc5d18d126`

## ⚙️ Configuration

### Initial Setup

1. Open Zotero preferences: **Edit** → **Preferences** (or **Zotero** → **Preferences** on macOS)
2. Click on the **XMnote** tab
3. Configure your server settings:

### Server Settings

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| **IP Address** | XMnote server IP address | `192.168.1.100` | Valid IP |
| **Port** | XMnote server port | `8080` | 1-65535 |
| **Timeout (ms)** | Connection timeout in milliseconds | `30000` | 1000-300000 |

### Import Options

| Option | Description | Default |
|--------|-------------|---------|
| **Include Notes** | Export item notes | ✅ Enabled |
| **Include Annotations** | Export PDF annotations | ✅ Enabled |
| **Include Metadata** | Export item metadata | ✅ Enabled |
| **Batch Size** | Items per batch | `10` |
| **Retry Count** | Failed request retries | `3` |

### Connection Testing

1. After configuring server settings, click **Test Connection**
2. The status indicator will show:
   - 🟢 **Connected**: Server is accessible
   - 🔴 **Failed**: Connection failed (check settings)
   - 🟡 **Testing**: Connection in progress

## 🚀 Usage

### Export All Items

1. Go to **Tools** → **XMnote** → **Export All Items**
2. The plugin will export all items in your library to the configured XMnote server
3. Progress will be shown in a popup window

### Export Selected Items

1. Select one or more items in your Zotero library
2. Go to **Tools** → **XMnote** → **Export Selected Items**
3. Only the selected items will be exported

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

- **Plugin ID**: `zonezzc@foxmail.com`
- **Version**: 1.0.0
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