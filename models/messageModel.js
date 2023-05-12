import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const admin = require("firebase-admin");
const { usersCollectionPromise } = require("../firebase/connect.cjs");

dotenv.config();

export const handleTextMessage = async (name, message, number) => {
  console.log(message, number);
  const usersCollection = await usersCollectionPromise;
  let user = (await usersCollection.doc(number).get()).data();

  const electronicsProducts = [
    {
      name: "Smartphone",
      description:
        "iPhone 18 Pro Max with 1TB storage. 1000MP camera. 5G support. 10000mAh battery. 8K display. 16GB RAM. 10nm processor. 1mm thin.",
      price: "$5000",
    },
    {
      name: "Laptop",
      description:
        "Alienware Area 51m with 64GB RAM, 10TB SSD, 10nm processor, 1000MP camera, 8K display, 10000mAh battery, 5G support, 1mm thin",
      price: "$999",
    },
    {
      name: "Television",
      description:
        "Samsung 100 inch 8K TV with 1000MP camera, 5G support, 10000mAh battery, 10nm processor, 64GB RAM, 10TB SSD, 1mm thin",
      price: "$8800",
    },
  ];

  if (!user) {
    user = {
      name: name,
      number: number,
      messages: {
        received: [],
        sent: [],
      },
      state: "new",
      lastAction: "",
    };
    await usersCollection.doc(number).set(user);
  } else {
    await usersCollection.doc(number).update({
      "messages.received": admin.firestore.FieldValue.arrayUnion(message),
    });
  }

  if (user.state === "new") {
    await usersCollection.doc(number).update({
      state: "menu",
    });
    return `Hello ${name}, welcome!

Please select one of the following product categories:
1. Electronics`;
  } else if (user.state === "menu") {
    if (message == "1") {
      await usersCollection.doc(number).update({
        state: "electronics_product_selection",
      });

      return `You selected Electronics category.

Please choose a product:
1. ${electronicsProducts[0].name}
2. ${electronicsProducts[1].name}
3. ${electronicsProducts[2].name}`;
    } else {
      return `Invalid selection. Please select one of the following product categories:
1. Electronics`;
    }
  } else if (user.state === "electronics_product_selection") {
    const productIndex = parseInt(message) - 1;

    if (productIndex >= 0 && productIndex < electronicsProducts.length) {
      const selectedProduct = electronicsProducts[productIndex];

      await usersCollection.doc(number).update({
        state: "buy_confirmation",
        selectedProduct: selectedProduct,
      });

      return `You selected ${selectedProduct.name}.
  
  Product details:
  Description: ${selectedProduct.description}
  Price: ${selectedProduct.price}
  
  Do you want to buy this product? Please reply with "yes" or "no".`;
    } else {
      return `Invalid selection. Please choose a valid product:
1. ${electronicsProducts[0].name}
2. ${electronicsProducts[1].name}
3. ${electronicsProducts[2].name}`;
    }
  } else if (user.state === "buy_confirmation") {
    const selectedProduct = user.selectedProduct;

    if (message.toLowerCase() === "yes") {
      await usersCollection.doc(number).update({
        "messages.sent": admin.firestore.FieldValue.arrayUnion(selectedProduct),
        state: "product_details",
      });

      return `You bought ${selectedProduct.name}! Thank you for your purchase.`;
    } else if (message.toLowerCase() === "no") {
      await usersCollection.doc(number).update({
        state: "electronics_product_selection",
      });

      return `You did not buy ${selectedProduct.name}. Please choose another product:
      ${electronicsProducts[0].name}
      2. ${electronicsProducts[1].name}
      
      ${electronicsProducts[2].name}`;
    } else {
      return `Invalid input. Please reply with "yes" or "no".`;
    }
  } else {
    return `Unknown command. Please select one of the following product categories:
      Electronics`;
  }
};

export const notTextMsg = async (name, messageType) => {
  return `Hello ${name}, we received your message but we don't know how to handle *${messageType}* yet. 
So please send us a text message.`;
};

export const sendMessage = async (
  toPhoneNumber,
  messageContent,
  retries = 3
) => {
  const apiUrl = `https://graph.facebook.com/v16.0/${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: messageContent,
        },
      }),
    });

    if (response.ok) {
      console.log("Message sent successfully.");
    } else {
      console.error("Error sending message: ", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message: ", error);

    if (retries > 0) {
      console.log(`Retrying... attempts remaining: ${retries}`);
      await new Promise((resolve) =>
        setTimeout(resolve, 2 ** (3 - retries) * 1000)
      ); // Exponential backoff
      await sendMessage(toPhoneNumber, messageContent, retries - 1);
    } else {
      console.error("All retries exhausted. Message not sent.");
      return;
    }
  }
};

//In this code I want that when user select a catagory like electronics then select a product then show that the details of that specific product
