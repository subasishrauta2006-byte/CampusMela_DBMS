import { useState } from 'react';

const SORT_ICONS = { asc: ' ▲', desc: ' ▼', none: ' ⇅' };

export default function DataTable({ columns, data, emptyMessage = 'No data found.' }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  let processed = [...data];

  // Filter
  if (filter.trim()) {
    const q = filter.toLowerCase();
    processed = processed.filter(row =>
      columns.some(col => {
        const val = col.render ? col.render(row) : row[col.key];
        return String(val).toLowerCase().includes(q);
      })
    );
  }

  // Sort
  if (sortCol) {
    processed.sort((a, b) => {
      let aVal = a[sortCol];
      let bVal = b[sortCol];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="data-table-wrapper">
      <div className="table-toolbar">
        <div className="table-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search table…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <span className="table-count">{processed.length} record{processed.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => !col.noSort && handleSort(col.key)}
                  className={col.noSort ? '' : 'sortable'}
                >
                  {col.label}
                  {!col.noSort && (
                    <span className="sort-icon">
                      {sortCol === col.key ? SORT_ICONS[sortDir] : SORT_ICONS.none}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr><td colSpan={columns.length} className="empty-row">{emptyMessage}</td></tr>
            ) : (
              processed.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
