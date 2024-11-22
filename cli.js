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
const Reminder = require("./Reminder");

let config;
try {
  config = yaml.load(fs.readFileSync("config.yaml", "utf8"));
} catch (error) {
  console.error("Failed to load configuration file: config.yaml", error);
  process.exit(1);
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("Please scan the QR code to authenticate:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Authenticated successfully.");
});

client.on("auth_failure", (msg) => {
  console.error(
    "Authentication failed. Please check your credentials and try again.",
    msg,
  );
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out. Reason:", reason);
});

client.on("ready", async () => {
  console.log("Client is ready. Starting notifications...");

  const reminder = new Reminder(client, config);
  Object.keys(config.notifications).forEach((configName) => {
    reminder.setup(configName);
  });
});

client.initialize();
