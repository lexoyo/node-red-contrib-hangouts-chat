const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {google} = require('googleapis');
const fs = require('fs');
const unirest = require('unirest');

module.exports = function(RED) {

  function HangoutsChatInNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
      
			node.status({fill:"grey",shape:"dot",text:"waiting for message"});
      RED.httpNode.post('/hangouts-chat/bot-url', bodyParser.json(), bodyParser.urlencoded({extended:true}),onPost);
      RED.httpNode.get('/hangouts-chat/test', (req, res) => res.sendStatus(200));
    function onPost(req,res) {
			node.status({fill:"green",shape:"dot",text:"connected"});
      const roomId = req.body.space.name;
      console.log('someone pinged @<bot-name>', roomId);

      node.send(Object.assign({}, req.body, {
				payload: req.body.message.text,
				roomId: roomId,
			}));

      return res.json({
      });

    }
  }

  RED.nodes.registerType("hangouts-chat-in", HangoutsChatInNode);

  function HangoutsChatOutNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    const { keyFile } = config;

    console.log('init', keyFile);

    fs.readFile(keyFile, (err, content) => {
      console.log('key file:', err, content);
      if(err) {
        node.status({fill:"red",shape:"ring",text:"Key file not found"});
      }
      else {
        try {
          node.key = JSON.parse(content.toString());
          afterInit();
        }
        catch(e) {
          node.status({fill:"red",shape:"ring",text:"Key file invalid"});
        }
      }
    });
    function afterInit() {
      node.status({fill:"green",shape:"dot",text:"connected"});
			node.on('input', msg => {
				if(msg.roomId) {
					postMessage(msg.payload, node.key, msg.roomId);
				}
				else {
					console.error('Input has to provide a roomId field');
					node.error('Input has to provide a roomId field');
        node.status({fill:"red",shape:"ring",text:"Input has to provide a roomId field"});
				}
			});
    }
  }

  RED.nodes.registerType("hangouts-chat-out", HangoutsChatOutNode);

};

function getJWT(gkeys) {
	return new Promise((resolve, reject) => {
		let jwtClient = new google.auth.JWT(
			gkeys.client_email,
			null,
			gkeys.private_key, ['https://www.googleapis.com/auth/chat.bot']);

		jwtClient.authorize((err, tokens) => {
			if (err) {
				console.log('Error create JWT hangoutchat');
				reject(err);
			} else {
				resolve(tokens.access_token);
			}
		});
	});
}

function postMessage(message, key, roomId) {
	console.log('post message to space', roomId);
	return new Promise((resolve, reject) => {
		getJWT(key).then((token) => {
			console.log('token', token);
			unirest.post('https://chat.googleapis.com/v1/' + roomId + '/messages')
				.headers({
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				})
				.send(JSON.stringify({
					'text': message,
				}))
				.end((res) => {
					console.log('sent', res.body);
					resolve();
				});
		}).catch((err) => {
			reject(err);
		});
	});
}


