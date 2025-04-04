import { saveMsgFromWebsocketToDb } from "../controllers/messages.js";
import {
  getLikesDislikeCounts,
  saveDislike,
  saveLike,
} from "../controllers/reaction.js";

export const handleIncomingMessages = async (message, ws, userConnection) => {
  const dataString = message.toString();
  try {
    const data = JSON.parse(dataString);
    const { messageId } = data;
    const userInfo = userConnection.get(ws); // get user info from ws
    const userId = userInfo?.userId;
    switch (data.type) {
      case "like":
        const { _doc: like } = await saveLike(data, userId);
        const likesCounts = await getLikesDislikeCounts(messageId);
        return { ...like, type: "like", ...likesCounts };
      case "dislike":
        const { _doc: dislike } = await saveDislike(data, userId);
        const dislikesCounts = await getLikesDislikeCounts(messageId);
        return { ...dislike, type: "dislike", ...dislikesCounts };

      default:
        const { _doc: message } = await saveMsgFromWebsocketToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
