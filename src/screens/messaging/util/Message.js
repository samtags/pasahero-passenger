import uuidv4 from "../../../services/util/uuidv4";

export default class Message {
  id = "";
  created_at = "";
  message = "";
  sender_id = "";
  transit = "";

  constructor() {
    this.id = uuidv4();
    this.created_at = new Date()
      .toISOString()
      .toLocaleString("en-US", { timeZone: "Asia/Manila" });
  }

  setMessage(message) {
    this.message = message;
  }

  setSenderId(sender_id) {
    this.sender_id = sender_id;
  }

  setTransit(transit) {
    this.transit = transit;
  }
}
