import uuidv4 from "../../../services/util/uuidv4";

export default class Message {
  id = "";
  createdAt = "";
  message = "";
  senderId = "";
  transit = "";
  matchId = "";
  clientRef = "";
  receiverId = "";

  constructor() {
    this.id = uuidv4();
    this.clientRef = this.id;
    this.createdAt = new Date()
      .toISOString()
      .toLocaleString("en-US", { timeZone: "Asia/Manila" });
  }

  setMessage(message) {
    this.message = message;
  }

  setSenderId(senderId) {
    this.senderId = senderId;
  }

  setTransit(transit) {
    this.transit = transit;
    this.matchId = transit;
  }

  setReceiverId(receiverId) {
    this.receiverId = receiverId;
  }
}
