import { saveMsgFromWebsocketToDb } from "../controllers/messages.js";
import { saveDislike, saveLike } from "../controllers/reaction.js";

export const handleIncomingMessages = async (message, ws, userConnection) => {
  const dataString = message.toString();
  console.log(dataString, "INCOMING MESSAGE");
  try {
    const data = JSON.parse(dataString);
    const userInfo = userConnection.get(ws);
    console.log(userInfo, "user info");
    switch (data.type) {
      case "like":
        const { _doc: like } = await saveLike(data.userInfo.userId);
        return { ...like, type: "like" };
      case "dislike":
        const { _doc: dislike } = await saveDislike(data, userInfo.userId);
        return { ...dislike, type: "dislike" };

      default:
        const { _doc: message } = await saveMsgFromWebsocketToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
