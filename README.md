# whatsapp-notify

> [!CAUTION]
> Use this tool at your own risk. Your WhatsApp account may be banned. This tool is not affiliated with WhatsApp.
> The author is not responsible for any damage caused by the use of this tool.

## Installation

![NPM Version](https://img.shields.io/npm/v/whatsapp-notify)

```bash
npm install -g whatsapp-notify
```

## Usage

This system is designed to send notifications at specified intervals to designated numbers. It can be used for reminders, alerts, or any other type of periodic notification.

## Getting Started

Create your `config.yaml` file with the desired notification details. The configuration file should be placed in the current working directory.

run the following command to start the notification system:

```bash
whatsapp-notify
```

### Configuration File

The configuration file is written in YAML format and contains the details for each notification type. Below is an example configuration file:

```yaml
notifications:
  init:
    init_message: "welcome! I'm here to help you with reminders and notifications."
    interval: 0
    to_numbers:
      - "test@c.us"
  test:
    init_message: "ping! reply pong to stop me"
    interval: 0
    to_numbers:
      - "test@c.us"
    remind_until_receive: "pong"
    remind_interval: 30
    success_message: "success! test notification received."
  drink_water:
    init_message: "time to drink water! reply done to stop me"
    interval: 3600
    to_numbers:
      - "test@c.us"
    remind_until_receive: "done"
    remind_interval: 60
    success_message: "nice! see you in an hour."
```

### Explanation of Keys

- `init_message`: The initial message that will be sent when the notification is triggered.
- `interval`: The time interval (in seconds) between each notification.
- `to_numbers`: A list of numbers to which the notification will be sent.

optional keys:

- `remind_until_receive`: The keyword that the system will wait for in the response to stop sending reminders.
- `remind_interval`: The time interval (in seconds) between each reminder if the expected response is not received.
- `success_message`: The message that will be sent once the expected response is received.

### TODO

- [ ] hot reload configuration file
- [ ] support `run_from` and `run_to` keys in configuration file
