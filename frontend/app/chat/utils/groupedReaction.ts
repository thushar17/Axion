
 // grouping reactions

export const groupedReaction = (
  reactions: { emoji: string }[]
) => {
  const grouped: Record<string, number> = {};

  reactions.forEach((reaction) => {
    grouped[reaction.emoji] =
      (grouped[reaction.emoji] || 0) + 1;
  });

  return grouped;
};