export const getSenderId = (sender: any): string => {
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  if (typeof sender === "object" && sender._id) return String(sender._id);
  if (typeof sender === "object" && sender.id) return String(sender.id);
  return "";
};
