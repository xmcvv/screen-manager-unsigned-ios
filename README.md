# 车屏管家

面向 SD5580 + ESP32-P4 车机屏幕的 Android/iOS 本地管理 App。

## 已实现

- 通过车机 `SD5580-CARPLAY` 热点管理，不依赖云端账号
- 首页同时显示 Wi-Fi、高速 USB、P4、CarPlay 连接状态
- 实时速度、电压、电流、功率、温度、SOC、SOH、续航、挡位和告警
- P4 六个仪表槽位自由换指标、排序、显隐和日夜主题
- 图片自动居中裁剪为 800 × 480，并在手机端转换为 RGB565
- 壁纸 CRC32 校验后写入 P4 独立分区并热重载
- P4 固件选择、MD5 显示、上传进度、ESP OTA 镜像校验和自动重启
- 车机地址测试与保存，断线时保留最近状态
- OLED 深色中文界面，Wi-Fi/USB 图标按状态整体变色和闪烁

## 架构

```text
Android / iOS App
        |
        | HTTP, 192.168.4.1:8080
        v
SD5580 wlan1 AP
        |
        | existing framed link, TCP :9000 / UDP :9001
        v
ESP32-P4 192.168.77.1
```

管理服务直接编入 `uinputd`，避免再创建第二条 P4 上游连接。

## 开发

```powershell
npm install
npm run typecheck
npm run web
```

Web 预览仅用于界面验收。原生模块用于相册、文件、固件和二进制上传。

## Android

本地开发构建需要 JDK 17 与 Android SDK：

```powershell
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleRelease
```

APK 输出在：

```text
android/app/build/outputs/apk/release/app-release.apk
```

仓库使用 Expo 生成的 debug keystore 签署预览包。正式上架前应换成独立 release keystore。

## iOS

Windows 不能编译或签署 IPA。工程和 `eas.json` 已准备好，可在 macOS 上：

```powershell
npx expo run:ios
```

或由 EAS 云构建：

```powershell
npx eas-cli@latest build --platform ios --profile preview
```

产出可安装 IPA 需要 Apple Developer 账号、Bundle ID 和签名凭据。

## 板端部署

板端管理网关源码：

```text
C:\esp\sd5580_link\screen_manager_api.c
C:\esp\sd5580_link\uinputd.c
```

P4 固件：

```text
C:\esp\sd5580_link\main\ui\ui.c
C:\esp\sd5580_link\main\sd5580_link_main.c
```

编译：

```powershell
& 'C:\esp\py311\Lib\site-packages\ziglang\zig.exe' cc `
  -target aarch64-linux-musl -static -O2 `
  C:\esp\sd5580_link\uinputd.c `
  -o .\outputs\screen_manager_api_uinputd
```

P4 使用 ESP-IDF 5.5.4 构建，具体环境变量见根目录交接文档。

## API

完整端点、二进制负载和 P4 帧说明见 [docs/API.md](docs/API.md)。
