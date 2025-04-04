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
    const likeDislikeCounts = await getLikesDislikeCounts(messageId);
    console.log(userInfo, "user info");
    switch (data.type) {
      case "like":
        console.log(likeDislikeCounts, "counts===>>>>>>");
        const { _doc: like } = await saveLike(data, userId);
        return { ...like, type: "like", ...likeDislikeCounts };
      case "dislike":
        const { _doc: dislike } = await saveDislike(data, userId);
        return { ...dislike, type: "dislike", ...likeDislikeCounts };

      default:
        const { _doc: message } = await saveMsgFromWebsocketToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
