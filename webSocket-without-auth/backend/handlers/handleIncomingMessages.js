import { saveMsgFromWebsocketToDb } from "../controllers/messages.js";
import { saveDislike, saveLike } from "../controllers/reaction.js";

export const handleIncomingMessages = async (message) => {
  const msgString = message.toString();

  try {
    const messageData = JSON.parse(msgString);
    
    switch (messageData.type) {
      case "like":
        return await saveLike(messageData);
      case "dislike":
        return await saveDislike(messageData);
      default:
        return await saveMsgFromWebsocketToDb(messageData);
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
