export const getSenderId = (s: any): string => {
  if (!s) return "";
  if (typeof s === "string") return s;
  if (typeof s === "object" && s._id) return String(s._id);
  if (typeof s === "object" && s.id) return String(s.id);
  return "";
};
