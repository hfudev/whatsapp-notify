#!/usr/bin/env node

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

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const yaml = require("js-yaml");

const config = yaml.load(fs.readFileSync("config.yaml", "utf8"));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("QR code");
  qrcode.generate(qr, { small: true });
});

client.initialize();

client.on("authenticated", () => {
  console.log("Authenticated Successfully");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failed", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

// real code starts here
client.on("ready", async () => {
  console.log("Start notifications");

  Object.keys(config.notifications).forEach(setupReminder);
});

function setupReminder(config_name) {
  const notification = config.notifications[config_name];

  if (!notification) {
    console.error(`No configuration found for ${config_name}`);
    return;
  }

  console.log(`executing ${config_name}`);

  const {
    init_message,
    interval = 0,
    remind_until_receive,
    remind_interval,
    success_message,
    to_numbers,
  } = notification;

  to_numbers.forEach((number) => {
    client.sendMessage(number, init_message);

    let remindIntervalId;
    if (remind_until_receive && remind_interval) {
      remindIntervalId = setInterval(() => {
        client.sendMessage(number, init_message);
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
        client.sendMessage(number, success_message);
        client.removeListener("message_create", messageListener);
        console.log(`reminder for ${config_name} is done`);

        if (interval > 0) {
          console.log(
            `setting up next reminder for ${config_name} in ${interval} seconds`,
          );
          setTimeout(() => {
            setupReminder(config_name);
          }, interval * 1000);
        }
      }
    };

    client.on("message_create", messageListener);
  });
}
