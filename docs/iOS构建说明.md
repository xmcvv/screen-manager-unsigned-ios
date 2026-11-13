# iOS 构建说明

此目录包含完整的 Expo SDK 58 / React Native 0.88 TypeScript 源码。

## 方式一：Mac + Xcode

```bash
npm install
npx expo prebuild --platform ios
npx expo run:ios
```

打开 `ios/*.xcworkspace` 后配置 Development Team、Bundle ID 和签名。

默认 Bundle ID：

```text
com.sd5580.screenmanager
```

## 方式二：EAS 云构建

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

`eas.json` 已经包含 development、preview、production 三种配置。

EAS 会要求：

- Apple Developer 账号
- App Bundle ID
- Distribution Certificate
- Provisioning Profile

没有上述凭据时，只能完成源码、JS/Hermes bundle 和类型检查，不能合法生成可安装 IPA。

## 已验证

- `npm run typecheck` 通过
- `npx expo-doctor` 20/20 通过
- iOS production Hermes bundle 成功生成
