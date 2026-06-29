export const getSenderId = (sender: any): string => {
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  if (sender._id) return String(sender._id);
  if (sender.id) return String(sender.id);
  return "";
};
