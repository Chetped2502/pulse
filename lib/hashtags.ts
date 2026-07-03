const HASHTAG_PATTERN = /#[\w฀-๿]+/g;

export function parseHashtags(description: string): string[] {
  const matches = description.match(HASHTAG_PATTERN);
  return matches ? Array.from(new Set(matches)) : [];
}
