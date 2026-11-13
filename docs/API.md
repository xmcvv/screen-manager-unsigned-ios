# 车屏管家本地 API

默认地址：`http://192.168.4.1:8080`

服务运行在 SD5580 的 `uinputd` 内，复用其已经建立的 P4 TCP/UDP 帧连接。手机不需要加入 P4 的 `192.168.77.0/24` USB 内网。

## GET /api/v1/health

服务存活检查。

```json
{
  "ok": true,
  "service": "screen-manager",
  "apiVersion": 1
}
```

## GET /api/v1/status

返回 5580、P4、USB、Wi-Fi、CarPlay 与系统资源状态。

## GET /api/v1/telemetry

返回最近一次 56 字节 `T_TELEMETRY` 帧转换后的 JSON：

- 车速、转速
- 电压、电流、功率
- 电机/控制器/电池温度
- SOC、SOH、续航、里程
- 挡位、模式、充电状态、胎压和告警

## GET /api/v1/dashboard

读取六个仪表槽位、显隐状态和日夜主题。

## PUT /api/v1/dashboard

请求体必须为 9 字节：

```text
[0] version = 1
[1] theme: 0=night, 1=day
[2] visible_mask，bit0..bit5 对应第 1..6 个槽位
[3..8] 指标 ID
```

指标 ID：

| ID | 指标 |
|---:|---|
| 0 | 电机转速 |
| 1 | 功率 |
| 2 | 电流 |
| 3 | 电压 |
| 4 | 电机温度 |
| 5 | 续航 |
| 6 | 电池健康 |
| 7 | 前轮胎压 |
| 8 | 后轮胎压 |
| 9 | 电池温度 |

5580 将配置保存到 `/data/dashboard.cfg`，并通过 `T_UI_CONFIG (0x27)` 下发；P4 再写入 NVS，P4 返回 `0xA8` 确认。

## PUT /api/v1/wallpaper?crc32=0xXXXXXXXX

请求体必须为 800 × 480 RGB565 little-endian，固定 768000 字节。

5580 首先校验长度和 CRC32，然后向 P4 发送：

```text
T_WP_BEGIN 0x23 [u32 total][u32 crc32]
T_WP_DATA  0x24 [u32 offset][bytes]
T_WP_END   0x25
```

P4 完成写入并复核 CRC 后才提交壁纸头和热重载。

## POST /api/v1/firmware/p4?md5=...

请求体为 ESP32-P4 的 `sd5580_link.bin`。单包不能超过 8 MiB。

5580 转成 `T_OTA_BEGIN/DATA/END` 帧，P4 使用 ESP-IDF OTA 写入备用分区。`esp_ota_end()` 验证镜像通过后才设置启动分区并重启。

## 帧校验

所有 P4 帧保持现有格式：

```text
0x7E | type | len_hi | len_lo | payload | crc8
```

CRC8 多项式为 `0x07`。
