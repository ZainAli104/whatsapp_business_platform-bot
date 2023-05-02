import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

export const handleTextMessage = (name, message) => {
    console.log(message);
    if (message === "1") {
      return "You selected 1";
    } else if (message === "2") {
      return "You selected 2";
    } else {
      return `Hello ${name}, we received your message: *${message}*

Please select one of the following options:
        1. Option 1
        2. Option 2
      `;
    }
}

export const generateReplyMessage = (name, messageType) => {
    return `Hello ${name}, we received your message but we don't know how to handle *${messageType}* yet. 
So please send us a text message.`;
}

export const sendMessage = async (toPhoneNumber, messageContent, retries = 3) => {
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
  
      if (retries > 0) {
        console.log(`Retrying... attempts remaining: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 2 ** (3 - retries) * 1000)); // Exponential backoff
        await sendMessage(toPhoneNumber, messageContent, retries - 1);
      } else {
        console.error('All retries exhausted. Message not sent.');
        return;
      }
    }
  }
  
