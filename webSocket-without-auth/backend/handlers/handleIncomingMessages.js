import { saveMsgFromWebsocketToDb } from "../controllers/messages.js";

export const handleIncomingMessages = async (message) => {
  const msgString = message.toString();

  try {
    const messageData = JSON.parse(msgString);
    const newMessage = await saveMsgFromWebsocketToDb(messageData);
    return newMessage;
  } catch (error) {
    console.error("Error parsing message", error);
    return null; // Return null on error
  }
};
