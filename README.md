# Hangouts Chat for Node-RED

A node for you to make a chat bot on hangouts chat with red-node.

This is a work in progress, please write issues to ask for changes

## Installation

Use `npm install node-red-contrib-hangouts-chat` to install.

## Usage

This package provides nodes to send and receive messages on [Hangouts Chat](https://chat.google.com/) via Node-RED. 

You will need a google service account to use the send node.

The input node is used to receive messages from hangouts chat. You can use `msg.roomId` to filter incoming messages by conversation. The message contains the message in msg.payload, the conversation id in msg.roomId and the complete message event object in msg.event.

The output node is used to send messages to an existing conversation. You can use the conversation id on the properties or provide a valid conversation id in `msg.roomId`. The `msg.payload` will be send to the conversation.

## License

MIT
