// Spreadsheet apps run text starting with = + - @ as a formula. Prefix those
// cells so exported post text can never execute.
const FORMULA_START = /^[=+\-@\t\r]/;

function textCell(value) {
  let text = value == null ? '' : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function postsToCsv(posts) {
  const header = ['ID', 'Topic', 'Text', 'Sentiment', 'Score', 'Latitude', 'Longitude', 'Created at'];
  const rows = posts.map((p) => [
    p.id,
    textCell(p.keyword),
    textCell(p.post_text),
    p.sentiment_label,
    p.sentiment_score,
    p.latitude ?? '',
    p.longitude ?? '',
    textCell(p.created_at),
  ]);
  return [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
}

export function downloadCsv(posts, filename) {
  // A Blob (not a data: URL) keeps characters like # and newlines intact.
  const blob = new Blob(['\ufeff', postsToCsv(posts)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
