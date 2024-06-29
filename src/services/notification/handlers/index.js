import onDriverCancel from "./onDriverCancel";

export default function handler(notification) {
  if (notification.yourCondition === true) {
    return onDriverCancel(notification);
  }

  // todo: insert your handler here.
}
