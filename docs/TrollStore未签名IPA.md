# TrollStore / 越狱安装说明

本项目提供 GitHub macOS CI 工作流。仓库公开后，可在 Actions 页面手动运行，
不要求 Apple Developer 账号：

```text
.github/workflows/build-unsigned-ios.yml
```

它执行以下步骤：

1. Ubuntu/Windows 不需要参与 iOS 编译。
2. GitHub 的 `macos-15` runner 自动生成 Expo iOS 工程。
3. CocoaPods 安装原生依赖。
4. `xcodebuild` 生成 arm64 Release `.app`。
5. 强制使用：
   - `CODE_SIGNING_ALLOWED=NO`
   - `CODE_SIGNING_REQUIRED=NO`
   - 空 `CODE_SIGN_IDENTITY`
   - 空 `DEVELOPMENT_TEAM`
6. 将 `.app` 放入 `Payload/`，压缩成未签名 IPA。

产出文件：

```text
ScreenManager-v1.0.0-ios-trollstore-unsigned.ipa
```

TrollStore 安装的是永久签名版本，不需要 Apple Developer 证书。越狱设备也可以通过 Filza 解压到 `/Applications`，或使用 TrollStore 安装。

注意：

- 必须使用 arm64 IPA。
- TrollStore 和 iOS 版本的兼容范围由设备当前 TrollStore 版本决定。
- 未签名 IPA 不能通过 Apple Configurator 或普通 Xcode 安装。
