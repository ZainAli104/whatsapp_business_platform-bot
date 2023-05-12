import { handleTextMessage, notTextMsg, sendMessage } from '../models/messageModel.js';

export const verifyWebhook = async (request, response) => {
    console.log("Received GET request", request.query);
    let queryParams = request.query;
  
    if (queryParams) {
      const mode = queryParams["hub.mode"];
      const verifyToken = queryParams["hub.verify_token"];
      const challenge = queryParams["hub.challenge"];
  
      if (mode === "subscribe" && verifyToken === "hello") {
        console.log("Verified token", challenge);
        response.status(200).json(parseInt(challenge));
      } else {
        response.status(403).json("Error, wrong validation token");
      }
    }
}

export const processNotification = async (request, response) => {
    console.log("Received POST request");
    const messageNotification = request.body;
  
    if (messageNotification) {
      const { entry } = messageNotification;
      const { changes } = entry[0];
  
      if (changes[0].value.contacts && changes[0].value.messages) {
        await handleContactMessage(changes[0].value);
      } else if (changes[0].value.statuses) {
        await handleStatusNotification(changes[0].value);
      } else {
        console.log("Another type of notification");
      }
  
      response.status(200).send("ok");
    } else {
      console.log(request);
      response.status(400).send("Bad Request");
    }
}

export const handleContactMessage = async (value) => {
    const { contacts, messages } = value;
    const { profile: { name } } = contacts[0];
    const { type: msgType, from: fromNumber } = messages[0];
  
    let replyMessage = msgType === 'text' ? await handleTextMessage(name, messages[0].text.body, fromNumber) : await notTextMsg(name, msgType);
  
    await sendMessage(fromNumber, replyMessage);
    console.log(fromNumber, name, msgType);
}

export const handleStatusNotification = async (value) => {
    const { statuses } = value;
    const status = statuses[0]["status"];
    const conversation = statuses[0]["conversation"];
    const pricing = statuses[0]["pricing"];
  
    console.log("Received status notification");
}
