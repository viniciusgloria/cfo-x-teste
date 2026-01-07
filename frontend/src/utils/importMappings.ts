export const makeHeaderSignature = (headers: string[]) => headers.map(h => (h || '').trim().toLowerCase()).join('|');

export const headersSimilarity = (a: string[], b: string[]) => {
  const sa = a.map(x => x.trim().toLowerCase());
  const sb = b.map(x => x.trim().toLowerCase());
  const setB = new Set(sb);
  let common = 0;
  sa.forEach(s => { if (setB.has(s)) common++; });
  // similarity as ratio of common to average length
  const avgLen = (sa.length + sb.length) / 2 || 1;
  return common / avgLen;
};
