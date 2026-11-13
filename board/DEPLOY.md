# 板端更新说明

## 文件

- `uinputd`：5580 管理网关，监听 `0.0.0.0:8080`
- `sd5580_link.bin`：P4 固件，包含 `T_UI_CONFIG=0x27`
- `source/screen_manager_api.c`：HTTP API
- `source/uinputd.c`：接入 API 的主程序
- `source/sd5580_link_main.c`：P4 协议处理
- `source/main/netlink_rx.c`：P4 TCP/UDP 与链路 watchdog
- `source/main/link_proto.h`：P4 控制命令与传输准备确认
- `source/ui.c` / `ui.h`：六槽位布局和 NVS 持久化
- `p4-net-watch.sh`：P4 OTA 重启后恢复 `usb1` 地址

`uinputd` 和 P4 固件必须成对更新。新版 5580 会等待 P4 的 `0xA9/0xAA`
存储准备确认，再发送壁纸或固件数据。

## 5580 部署

先把二进制放到板上临时目录，确认长度和内容后再替换。

```sh
kill -9 <old_uinputd_pid>
cp /tmp/uinputd /data/uinputd
chmod +x /data/uinputd
/data/uinputd /dev/ttyUSB0
```

校验：

```sh
netstat -ltn | grep 8080
wget -qO- http://127.0.0.1:8080/api/v1/health
```

管理热点地址：

```text
http://192.168.4.1:8080
```

## P4 刷写

可直接使用 App 的“P4 固件”页面，或从板上执行：

```sh
/data/tcp_otapush /tmp/sd5580_link.bin 192.168.77.1 9000
```

P4 重启后，如 `usb1` 尚未恢复 IP：

```sh
ifconfig usb1 192.168.77.2 netmask 255.255.255.0 up
```

## 回滚

部署前备份：

```sh
cp /data/uinputd /data/uinputd.rollback
```

P4 页面或直接 OTA 写入旧版 `sd5580_link.bin` 即可回滚。
