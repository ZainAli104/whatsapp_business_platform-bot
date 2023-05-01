import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// this is for verification of the webhook
export function handleGetRequest(request, response) {
    console.log("Received GET request", request.query);
    let queryParams = request.query;
    if (queryParams != null) {
      const mode = queryParams["hub.mode"];
      if (mode == "subscribe") {
        const verifyToken = queryParams["hub.verify_token"];
        if (verifyToken == "hello") {
          console.log("Verified token", queryParams["hub.challenge"]);
          let challenge = queryParams["hub.challenge"];
          response.status(200).json(parseInt(challenge));
        } else {
          const responseBody = "Error, wrong validation token";
  
          response.status(403).json(responseBody);
        }
      }
    }
};

// this is for handling the incoming messages
export async function handlePostRequest(request, response) {
  console.log("Received POST request");
  const messageNotification = request.body;

  if (messageNotification) {
    const { entry } = messageNotification;
    const { changes } = entry[0];

    if (changes[0].value.contacts && changes[0].value.messages) {
      handleContactMessage(changes[0].value);
    } else if (changes[0].value.statuses) {
      handleStatusNotification(changes[0].value);
    }

    response.status(200).send("ok");
  } else {
    console.log(request);
    response.status(400).send("Bad Request");
  }
}

function handleContactMessage(value) {
  const { contacts, messages } = value;
  const { profile: { name } } = contacts[0];
  const { type: msgType, from: fromNumber, text: { body: message } } = messages[0];

  console.log(message, fromNumber, name, msgType);

  const replyMessage = `Hello ${name}, we received your message: ${message}`;
  sendMessage(fromNumber, replyMessage);
}

function handleStatusNotification(value) {
  const { statuses } = value;
  const status = statuses[0]["status"];
  const conversation = statuses[0]["conversation"];
  const pricing = statuses[0]["pricing"];

  console.log("Received status notification", status, conversation, pricing);
}

async function sendMessage(toPhoneNumber, messageContent) {
  const apiUrl = `https://graph.facebook.com/v16.0/${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: messageContent
        }
      })
    });

    if (response.ok) {
      console.log('Message sent successfully.');
    } else {
      console.error('Error sending message: ', response.statusText);
    }
  } catch (error) {
    console.error('Error sending message: ', error);
  }
}

