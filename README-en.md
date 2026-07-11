# Zotero XMnote Plugin

[![Zotero 7-10](https://img.shields.io/badge/Zotero-7--10-CC2936?style=flat-square&logo=zotero&logoColor=white)](https://www.zotero.org/)
[![CI](https://github.com/Zonezzc/zotero-xmnote/actions/workflows/ci.yml/badge.svg)](https://github.com/Zonezzc/zotero-xmnote/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/releases)
[![License](https://img.shields.io/github/license/Zonezzc/zotero-xmnote?style=flat-square)](LICENSE)

Send bibliographic data, notes, and PDF annotations from Zotero to the XMnote API import queue.

> This is a one-way export plugin, not a bidirectional synchronization tool. A successful API response only means that XMnote accepted the data into its pending import list. You must still confirm the import in the app.

**Languages**: [简体中文](README.md) | [English](README-en.md)

## Features

- Supports Zotero 7, 8, 9, and 10
- Exports all items, selected items, or the current collection
- Provides Tools menu, item context menu, and collection context menu actions
- Exports metadata such as title, authors, translators, publisher, publication date, ISBN, abstract, tags, and collection
- Exports Zotero item notes and PDF annotations
- Optionally exports the current reading position and estimated reading duration
- Supports batched requests, retries, progress feedback, and per-item errors
- Accepts a complete import URL, hostname, IPv4, IPv6, or HTTPS endpoint
- Uses a read-only `OPTIONS` request for connection tests and never creates a test book
- Validates XMnote API constraints before sending data

## Compatibility

| Zotero | Menu implementation                        | Verification          |
| ------ | ------------------------------------------ | --------------------- |
| 7      | `zotero-plugin-toolkit` compatibility path | Verified              |
| 8      | Native `Zotero.MenuManager`                | Verified              |
| 9      | Native `Zotero.MenuManager`                | Verified              |
| 10     | Native `Zotero.MenuManager`                | Verified by GitHub CI |

The plugin selects the menu API through capability detection instead of hard-coded version branches. Its manifest declares support for Zotero 7–10.

## Installation

1. Open the [Releases page](https://github.com/Zonezzc/zotero-xmnote/releases).
2. Download the latest `zotero-xmnote-plugin.xpi`.
3. In Zotero, open **Tools → Add-ons**.
4. Click the gear button and choose **Install Add-on From File**.
5. Select the downloaded `.xpi` file and restart Zotero when prompted.

[Download the latest release directly](https://github.com/Zonezzc/zotero-xmnote/releases/latest/download/zotero-xmnote-plugin.xpi)

## Quick Start

### 1. Start the XMnote API service

Open **API Import** in XMnote and start the service. The app displays addresses similar to:

```text
http://xmnote.local:8080/send
http://192.168.1.20:8080/send
```

Zotero and the device running XMnote must be on networks that can reach each other.

### 2. Configure the plugin

Open **Zotero Settings/Preferences → XMnote**:

- We recommend pasting the complete import address from the app into **Server Address / URL**.
- Alternatively, enter only a hostname or IP address and specify the port separately.
- The separate port setting is ignored when you provide a complete URL.
- Click **Test Connection (no data sent)** to check reachability. This does not add anything to the pending import list.

### 3. Send data

You can send data from:

- **Tools menu**: send all items or the currently selected items
- **Item context menu**: quick send or open the export options dialog
- **Collection context menu**: send items in the current collection

The plugin reports how many items XMnote accepted and how many failed. Partial failures are no longer reported as a complete success.

### 4. Confirm in XMnote

After sending, open the **API Import** list in XMnote and review the pending data. Items enter the main library only after you confirm them in the app.

## Configuration

### Server

| Setting              | Description                                      | Default         |
| -------------------- | ------------------------------------------------ | --------------- |
| Server Address / URL | Complete import URL, hostname, or IP             | `192.168.1.100` |
| Port                 | Used only when the address is not a complete URL | `8080`          |
| Timeout              | Request timeout in milliseconds                  | `30000`         |

### Exported content

| Option                   | Description                                                                   | Default |
| ------------------------ | ----------------------------------------------------------------------------- | ------- |
| Include Notes            | Include Zotero item notes                                                     | Enabled |
| Include Annotations      | Include PDF annotations and comments                                          | Enabled |
| Include Metadata         | Include bibliographic metadata, tags, and collection                          | Enabled |
| Include Current Page     | Send a current page only when total pages and an annotation page are reliable | Enabled |
| Include Reading Duration | Estimate daily reading duration from note timestamps                          | Enabled |

Reading duration is a heuristic derived from note timestamps. It is sent as fuzzy daily duration and never presented as a precise reading session. The plugin does not invent a reading status when Zotero has no trustworthy source for it.

## Data and Behavior Boundaries

- The plugin only sends data to XMnote's `/send` endpoint. It cannot read or delete books already stored in the app.
- `code=200` means that XMnote accepted the request for confirmation; it does not mean that the final import has completed.
- Physical books use pages. E-books use progress or location. The plugin validates these combinations before sending.
- The current page is sent only when both a total page count and a valid annotation page are available. It is no longer fabricated as page 1.
- Purchase data, reviews, and reading status are not guessed when Zotero has no reliable corresponding data.

## Development

Node.js 20 is required.

```bash
git clone https://github.com/Zonezzc/zotero-xmnote.git
cd zotero-xmnote
npm install

# Development mode
npm start

# Build, lint, and test
npm run build
npm run lint:check
npm test
```

Main directories:

- `src/modules/xmnote/`: API types, URL handling, validation, and client
- `src/modules/zotero/`: Zotero extraction and transformation
- `src/modules/reading/`: reading-duration estimation
- `src/modules/ui/`: menus, dialogs, and result feedback
- `test/`: API contract, transformation, outcome, and compatibility tests

## Support

- [GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues)
- Email: zonezzc@foxmail.com

When reporting an issue, include the Zotero version, plugin version, operating system, and any error message that is safe to share. Do not upload private notes, server addresses, or other sensitive information.

## License

This project is licensed under [AGPL-3.0-or-later](LICENSE).

## Acknowledgments

- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- The developers and users of Zotero and XMnote
