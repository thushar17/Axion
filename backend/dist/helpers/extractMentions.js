export function extractMentions(content) {
    const matches = content.match(/@([a-zA-Z0-9_]+)/g) || [];
    return matches.map((mention) => mention.slice(1));
}
//# sourceMappingURL=extractMentions.js.map