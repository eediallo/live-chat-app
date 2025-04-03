import { saveMsgFromWebsocketToDb } from "../controllers/messages.js";
import { saveDislike, saveLike } from "../controllers/reaction.js";

export const handleIncomingMessages = async (message) => {
  const msgString = message.toString();

  try {
    const messageData = JSON.parse(msgString);

    switch (messageData.type) {
      case "like":
        return { ...(await saveLike(messageData)), type: "like" };
      case "dislike":
        return { ...(await saveDislike(messageData)), type: "dislike" };
      default:
        return {
          ...(await saveMsgFromWebsocketToDb(messageData)),
          type: "message",
        };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
