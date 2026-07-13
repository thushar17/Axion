export function extractMentions(content: string): string[]{
     const matches = content.match(/@([a-zA-Z0-9_]+)/g) || [];
     return matches.map((mention) => mention.slice(1));
}