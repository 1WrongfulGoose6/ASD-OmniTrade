export function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  const dataRows = data.map((row) =>
    headers
      .map((field) => {
        let value = row[field];
        if (value == null) return '';
        const stringValue = String(value);
        if (/[",\n]/.test(stringValue)) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(','),
  );
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csvString, fileName) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
