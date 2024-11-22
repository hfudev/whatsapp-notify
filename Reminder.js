// whatsapp-notify - A simple WhatsApp bot to send reminders
// Copyright (C) 2024 Fu Hanxi <hfudev@gmail.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const { Client } = require("whatsapp-web.js");

class Reminder {
  constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  setup(configName) {
    const notification = this.config.notifications[configName];

    if (!notification) {
      console.error(
        `Configuration for '${configName}' not found. Please check your config.yaml file.`,
      );
      return;
    }

    console.log(`Executing reminder setup for '${configName}'`);

    const {
      init_message,
      interval = 0,
      remind_until_receive,
      remind_interval,
      success_message,
      to_numbers,
    } = notification;

    to_numbers.forEach((number) => {
      this.client.sendMessage(number, init_message);

      let remindIntervalId;
      if (remind_until_receive && remind_interval) {
        remindIntervalId = setInterval(() => {
          this.client.sendMessage(number, init_message);
        }, remind_interval * 1000);
      }

      const messageListener = (msg) => {
        if (
          remind_until_receive &&
          msg.from === number &&
          msg.body.toLowerCase() === remind_until_receive.toLowerCase()
        ) {
          if (remindIntervalId) {
            clearInterval(remindIntervalId);
          }
          this.client.sendMessage(number, success_message);
          this.client.removeListener("message_create", messageListener);
          console.log(`Reminder for '${configName}' completed successfully.`);

          if (interval > 0) {
            console.log(
              `Setting up next reminder for '${configName}' in ${interval} seconds.`,
            );
            setTimeout(() => {
              this.setup(configName);
            }, interval * 1000);
          }
        }
      };

      this.client.on("message_create", messageListener);
    });
  }
}

module.exports = Reminder;
