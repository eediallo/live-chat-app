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
        return { ...(await saveLike(data, userInfo.userId)), type: "like" };
      case "dislike":
        return {
          ...(await saveDislike(data, userInfo.userId)),
          type: "dislike",
        };

      default:
        const { _doc: message } = await saveMsgFromWebsocketToDb(data);
        return { ...message, type: "message" };
    }
  } catch (error) {
    console.error("Error parsing message", error);
    return null;
  }
};
