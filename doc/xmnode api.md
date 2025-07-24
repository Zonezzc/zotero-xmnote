> 原文地址 [https://docs.xmnote.com/#/import/api/api](https://docs.xmnote.com/#/import/api/api)

## [API 使用说明](#/import/api/api?id=api-%e4%bd%bf%e7%94%a8%e8%af%b4%e6%98%8e)

### [笔记导入](#/import/api/api?id=%e7%ac%94%e8%ae%b0%e5%af%bc%e5%85%a5)

```
http://ip:port/send
```

- 请求方法: POST
- ContentType: application/json

> 💡 此接口支持跨域，因此您在基于 Web 技术栈开发时无需考虑跨域问题。

### [Body 内容](#/import/api/api?id=body%e5%86%85%e5%ae%b9)

```
{
    "title": "山茶文具店", // 🍬 书名：必填
    "bookSummary": "在镰仓，有一家帮人代笔的文具店，每代店主均由女性担任，只要有委托便会接受，即使是餐厅的菜单也会帮忙…………",  // 内容简介：选填
    "cover": "https://img2.doubanio.com/view/subject/l/public/s29707472.jpg", // 书籍封面：选填
    "author":"[日] 小川糸", // 作者：选填
    "authorIntro": "热门疗愈电影、畅销小说《蜗牛食堂》作者。日本清泉女子大学日本古代文学毕业…………", // 作者简介：选填
    "translator":"王蕴洁", // 译者：选填
    "publisher": "湖南文艺出版社", // 出版社：选填
    "publishDate": 1519833600, // 出版日期：单位秒，选填
    "isbn": "9787540485337", // ISBN：选填
    "type": 1, // 🍬 书籍类型，必填。可取值：0：纸质书；1：电子书
    "locationUnit": 1, // 🍬 书籍页码类型，必填。可取值：0：进度；1：位置；2：页码
    "totalPageCount": 320, // 书籍总页码，是否选填由 currentPage 和 locationUnit 决定。（若当前 locationUnit 的类型为进度（0），totalPageCount 无需填写。若 currentPage 填写了，则 totalPageCount 为必填项）
    "currentPage": 10, // 当前阅读位置（页码、位置、进度），选填
    "rating": 5.0, // 书籍评分（取值范围[0.0, 5.0]），选填
    "readingStatus": 2, // 阅读状态，选填。可取值：1：想读；2：在读；3：已读；4：弃读
    "readingStatusChangedDate": 1519833600, // 阅读状态变更的日期时间，选填（若不填写，默认值为插入时的时间）
    "group": "治愈文学", // 书籍所属的分组，选填（若分组不存在，导入时会自动创建）
    "tags": ["日本", "治愈"], // 书籍标签，选填（若标签不存在，导入时会自动创建）
    "source": "微信读书", // 书籍来源，选填（若来源不存在，导入时会自动创建）
    "purchaseDate": 1519833600, // 书籍购买日期，选填
    "purchasePrice": 35.0 // 书籍购买价格，选填

   "preciseReadingDurations": [ // 精确阅读时长记录（已经阅读开始时间和结束时间），选填
        {
            "startTime": 1736428889486, // 🍬 阅读开始的时间（必填）
            "endTime": 1736429089486, // 🍬 阅读开始的时间（必填）
            "position": 10.0 // 阅读结束时所在的位置，浮点类型（页码、位置、进度）（选填）
        }
    ],

    "fuzzyReadingDurations": [ // 模糊阅读时长记录（仅知道阅读的日期和阅读时长），选填
        {
            "date": "1736416789486", // 🍬 阅读的日期（必填），日期时间戳，在 App 中时间会识别成 yyyy-MM-dd
            "durationSeconds": 3600, //  🍬 一次阅读的时长，单位秒（必填）
            "position": 100.0
        }
    ],

    "entries": [ // 笔记数组：选填
         {
             "page": 100, // 书籍页码、位置、进度，选填
             "text": "与其苦苦追寻失去的东西，还不如好好珍惜自己眼前拥有的东西。", // 原文摘录，选填
             "note": "如果可以预测人生的一切，那么一定很无聊。", // 想法，选填
             "chapter": "春", // 章节，选填
             "time": 1652544669 // 笔记创建日期时间，选填
         }
    ]
}
```

> 💡 在开始前请注意以下几点：
>
> 1. 在调试 API 前，我们建议您先备份应用数据，避免在调试的过程中扰乱您原有的数据内容。
> 2. type 将会决定 locationUnit 的取值。若 type 的值为 0（书籍为纸质书），那么 locationUnit 的值只能取 2 。若 type 为 1（书籍为电子书），那么 locationUnit 的值可取：0、1。
> 3. 时间戳的单位为：秒。
> 4. 对于选填的字段，如果您的确不需要，在构造 JSON 时应直接忽略不写。一个最简单 JSON 示例： `{"title": "山茶文具店", "type": 1, "locationUnit": 1}`。
> 5. 在书籍导入前，纸间还会自动进行一次书籍数据的在线匹配，尽管有些字段您没有填写，我们也会尽可能的帮您补全。

### [响应结果](#/import/api/api?id=%e5%93%8d%e5%ba%94%e7%bb%93%e6%9e%9c)

<table><thead><tr><th>状态码</th><th>含义</th></tr></thead><tbody><tr><td>200</td><td>笔记导入成功</td></tr><tr><td>500</td><td>笔记导入失败，错误发生在业务层</td></tr></tbody></table>

## [🧝‍♀️ 一些工具](#/import/api/api?id=%f0%9f%a7%9d%e2%99%80%ef%b8%8f-%e4%b8%80%e4%ba%9b%e5%b7%a5%e5%85%b7)

### [](#/import/api/api?id=%e5%af%bc%e5%85%a5%e3%80%8ckoreader%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)[导入「KOReader」的笔记](#/import/api/api?id=%f0%9f%aa%84-%e5%af%bc%e5%85%a5%e3%80%8ckoreader%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

### [](#/import/api/api?id=%e5%af%bc%e5%85%a5%e3%80%8ccalibre%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)[导入「Calibre」的笔记](#/import/api/api?id=%f0%9f%aa%84-%e5%af%bc%e5%85%a5%e3%80%8ccalibre%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

### [](#/import/api/api?id=%e5%af%bc%e5%85%a5%e3%80%8c%e9%98%85%e8%af%bb%e8%ae%b0%e5%bd%95%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)[导入「阅读记录」的笔记](#/import/api/api?id=%f0%9f%aa%84-%e5%af%bc%e5%85%a5%e3%80%8c%e9%98%85%e8%af%bb%e8%ae%b0%e5%bd%95%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

### [](#/import/api/api?id=%e9%80%9a%e8%bf%87-quicker-%e5%88%9b%e5%bb%ba%e7%ac%94%e8%ae%b0)[通过 Quicker 创建笔记](https://getquicker.net/Sharedaction?code=9f138895-253b-49ea-827a-08db901ae082)

> 🌱 如果您有开发好用的工具，请联系我（微信：scarecrow0x18），我会将您的作品发布至此处。

## [💙 导入「KOReader」的笔记](#/import/api/api?id=%f0%9f%92%99-%e5%af%bc%e5%85%a5%e3%80%8ckoreader%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

### [](#/import/api/api?id=koreader)[KOReader](http://koreader.rocks/)

KOReader 是 E Ink 设备的文档查看器。支持的文件格式包括 EPUB、PDF、DjVu、XPS、CBT、CBZ、FB2、PDB、TXT、HTML、RTF、CHM、DOC、MOBI 和 ZIP 文件。它适用于 Kindle、Kobo、PocketBook、Android 和桌面 Linux。

> 💡 各类电纸书设备需要在越狱后才能安装使用。

KOReader 2024.01 更新已包含纸间书摘的高亮导出插件。只需将您的 KOReader 更新至版本 2024.01 或更高版本，即可使用此功能。

![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20240128-191255%402x.png)

KOReader 高亮导出插件配置的操作步骤：

![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20240128-192034%402x.png)

> 💡 重要提示：
>
> 1. 导入笔记到 KOReader 时，请保持「通过 API 导入」界面开启。
> 2. 确保 KOReader 和您的手机连接同一 Wi-Fi 网络，以便笔记能成功发送到手机。
> 3. 您可以在纸间书摘中的「通过 API 导入」功能界面的底部看到当前设备的 IP 信息。它包含在：[http://192.168.199.127:8080/send（示例）](http://192.168.199.127:8080/send%EF%BC%88%E7%A4%BA%E4%BE%8B%EF%BC%89) 当中。**您只需要将 192.168.199.127（示例）填写到输入框即可。**

## [🪄 导入「Calibre」的笔记](#/import/api/api?id=%f0%9f%aa%84-%e5%af%bc%e5%85%a5%e3%80%8ccalibre%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

> 💡 纸间书摘笔记导出插件由 [Cusanity](https://github.com/Cusanity) 开发。
>
> 项目地址：[https://github.com/Cusanity/xmnote_calibre](https://github.com/Cusanity/xmnote_calibre)

### [](#/import/api/api?id=calibre)[calibre](https://calibre-ebook.com/zh_HK)

Calibre 是一个免费的开源的 “一站式” 的电子书解决方案，它可以全面满足你的电子书需求。 Calibre 是免费的，源代码开放，拥有跨平台的设计。 它是一个完整的电子图书馆，包括图书馆管理，格式转换，新闻，将材料转换为电子书，以及电子书阅读器同步功能、整合进电子图书阅读器。

### [插件使用说明](#/import/api/api?id=%e6%8f%92%e4%bb%b6%e4%bd%bf%e7%94%a8%e8%af%b4%e6%98%8e)

[calibre 纸间书摘笔记导出插件](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/calibre_xmnote.zip)

在开始前， 您需要先将👆👆插件安装文件先下载到本地。

#### [为 calibre 安装纸间书摘插件](#/import/api/api?id=%e4%b8%ba-calibre-%e5%ae%89%e8%a3%85%e7%ba%b8%e9%97%b4%e4%b9%a6%e6%91%98%e6%8f%92%e4%bb%b6)

1. 打开 calibre 设置界面，点击「插件」。

   ![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-134420%402x.png)

2. 进入「插件」设置界面后，点击「从档案载入外挂」。

   ![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-134433%402x.png)

3. 选择已下载的插件文件（calibre_xmnote.zip），开始安装。

   ![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-141352%402x.png)

4. 若成功安装，您将在已安装的插件中看到「纸间书摘」这一项。

   ![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-134556%402x.png)

5. 安装成功后需要重启 calibre ，否则无法生效。
6. 重启后，您将在主界面看到「纸间书摘」图标。

   ![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-134800%402x.png)

#### [将笔记导出至「纸间书摘」](#/import/api/api?id=%e5%b0%86%e7%ac%94%e8%ae%b0%e5%af%bc%e5%87%ba%e8%87%b3%e3%80%8c%e7%ba%b8%e9%97%b4%e4%b9%a6%e6%91%98%e3%80%8d)

> 💡 开始前的注意事项：
>
> 1. 请确保运行 calibre 的电脑与手机处在同一局域网下（连接同一个 Wi-Fi），否则将无法导出。
> 2. 通过插件进行导出时，请确保「通过 API 导入」这个功能界面是一直打开的。
> 3. 您可以在「通过 API 导入」功能界面的底部看到当前设备的 IP 信息。它包含在：[http://192.168.199.127:8080/send（示例）](http://192.168.199.127:8080/send%EF%BC%88%E7%A4%BA%E4%BE%8B%EF%BC%89) 当中。您只需要填写 IP 部分即可，如：192.168.199.127（示例）。

在 calibre 主页，选中需要导出的书籍，点击顶部工具栏中的「纸间书摘」图标，即可看到导出到纸间书摘的弹窗。你需要检查目标设备 IP 是否已设置正确，确保无误后，点击导出到纸间书摘，即可完成笔记的导出。

![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-134855%402x.png)

![](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/WX20230225-144102%402x.png)

## [🪄 导入「阅读记录」的笔记](#/import/api/api?id=%f0%9f%aa%84-%e5%af%bc%e5%85%a5%e3%80%8c%e9%98%85%e8%af%bb%e8%ae%b0%e5%bd%95%e3%80%8d%e7%9a%84%e7%ac%94%e8%ae%b0)

[阅读记录笔记迁移程序. zip](https://doc-1252413502.cos.ap-nanjing.myqcloud.com/%E9%98%85%E8%AF%BB%E8%AE%B0%E5%BD%95.zip)

1. 首先您需要将待迁移的书籍笔记以 TXT 的形式导出，并转存到您的电脑以备后续使用。
2. 下载「阅读记录. zip」文件，这是一个基于「导入 API」实现的笔记迁移程序。
3. 解压，您将会得到一个 「阅读记录. html」的文件。
4. 确保电脑和手机处在同一个网络环境下（电脑可以 ping 通手机的 ip ）。
5. 通过浏览器打开「阅读记录. html」文件。
6. 按照界面提示依次输入设备的 ip 地址，在选择好需要导入的 TXT 笔记文件后，点击「导入」即可。

   ![](https://blog-1252413502.cos.ap-shanghai.myqcloud.com/WX20220520-224244%402x.png)

> 💡 使用时的注意事项：
>
> 1. 在通过上述工具进行导入时，**请确保「通过 API 导入」这个功能界面是一直打开的。**
> 2. 您可以在纸间书摘中的「通过 API 导入」功能界面的底部看到当前设备的 ip 信息。它包含在：[http://192.168.199.127:8080/send（示例）](http://192.168.199.127:8080/send%EF%BC%88%E7%A4%BA%E4%BE%8B%EF%BC%89) 当中。**您只需要将 192.168.199.127（示例） 填写到输入框即可。**
> 3. 「选择文件」支持多选。
