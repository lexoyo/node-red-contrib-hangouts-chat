# Hangouts Chat for Node-RED

A node for you to make a chat bot on [Hangouts Chat](https://chat.google.com) with [node red](https://nodered.org). Please note that **Hangouts Chat is only available for paid G Suite customers**.

This is a work in progress, please write issues to ask for changes

## Installation

Use `npm install node-red-contrib-hangouts-chat` to install.

## Usage

This package provides nodes to send and receive messages on [Hangouts Chat](https://chat.google.com/) via Node-RED. 

The input node is used to receive messages from hangouts chat. You can use `msg.roomId` to filter incoming messages by conversation. The message contains the message in msg.payload, the conversation id in msg.roomId and the complete message event object in msg.event.

The output node is used to send messages to an existing conversation. You can use the conversation id on the properties or provide a valid conversation id in `msg.roomId`. The `msg.payload` will be send to the conversation.

You will need to create a project in Google cloud platform with Hangouts chat enabled. To do so, login to [developer console](https://console.developers.google.com/). Create a new project, and enable Hangout Chat API. Under configuration, set:

* status: live
* bot name (this is how you will add and ping the bot)
* avatar
* description
* functionality: rooms
* connection settings – bot URL: <your node-red server HTTPS url>
* permission: everyone in your domain


You will need a google service account to use the send node.

## License

MIT
