import { convertToCSV } from '@/app/trade-backlog/lib/csv';

describe('convertToCSV helper (F09-Unit-CSVFormatter)', () => {
  it('returns CSV with quoted values when needed', () => {
    const rows = [
      { id: 1, asset: 'AAPL', note: 'simple' },
      { id: 2, asset: 'MSFT', note: 'Needs, quoting' },
      { id: 3, asset: 'TSLA', note: 'Line\nbreak' },
      { id: 4, asset: 'N"VDA', note: 'quotes "inside"' },
    ];

    const csv = convertToCSV(rows);
    expect(csv).toContain('id,asset,note');
    expect(csv).toContain('2,MSFT,"Needs, quoting"');
    expect(csv).toContain('3,TSLA,"Line\nbreak"');
    expect(csv).toContain('4,"N""VDA","quotes ""inside"""');
  });

  it('returns empty string for empty inputs', () => {
    expect(convertToCSV([])).toBe('');
    expect(convertToCSV(null)).toBe('');
  });
});
