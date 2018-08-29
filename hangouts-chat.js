const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {google} = require('googleapis');
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

      node.send({
        payload: req.body.message.text,
        roomId: roomId,
        event: req.body,
      });

      return res.json({
      });

    }
  }

  RED.nodes.registerType("hangouts-chat-in", HangoutsChatInNode);

  function HangoutsChatOutNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const varPath = (config['varName'] || 'googlekeys').split('.');
    node.status({fill:"grey",shape:"dot",text:"waiting for message"});
    node.on('input', msg => {
      const varValue = varPath.reduce((acc, val) => acc = acc[val], msg);
      if(!!varValue) {
				node.key = populateKey(varValue);
				if(node.key) {
					if(msg.roomId) {
						node.status({fill:"green",shape:"dot",text:"sending"});
						postMessage(msg.payload, node.key, msg.roomId)
							.then(res => {
								node.status({fill:"green",shape:"dot",text:"connected"});
							})
							.catch(e => {
								console.error('Could not send message to hangouts chat', e);
								node.error('Could not send message to hangouts chat', e);
								node.status({fill:"red",shape:"ring",text:e});
							})
					}
					else {
						console.error('Input has to provide a roomId field');
						node.error('Input has to provide a roomId field');
						node.status({fill:"red",shape:"ring",text:"Input has to provide a roomId field"});
					}
				}
				else {
					node.status({fill:"red",shape:"ring",text:"Key file invalid"});
					node.error('Key file is invalid');
				}
			}
      else {
        console.error(`Input has to provide a msg.${varPath.join('.')} field`);
        node.error(`Input has to provide a msg.${varPath.join('.')} field`);
        node.status({fill:"red",shape:"ring",text:`Input has to provide a msg.${varPath.join('.')} field`});
      }
    });
    function populateKey(content) {
      try {
        return JSON.parse(content);
      }
      catch(e) {
				return null;
      }
    }


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
        if(key && key !== '') {
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
        }
        else {
          reject('Error: missing key file');
        }
      });
    }
  }
  RED.nodes.registerType("hangouts-chat-out", HangoutsChatOutNode);
}


