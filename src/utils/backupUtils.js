/**
 * Xuất toàn bộ dữ liệu dòng họ ra file JSON (backup đầy đủ)
 */
export const exportToJson = (members, relationships, treeName) => {
  const payload = {
    _meta: {
      version: '1.0',
      app: 'LacViet GiaPha',
      exportedAt: new Date().toISOString(),
      treeName,
      totalMembers: members.length,
    },
    members,
    relationships,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GiaPha_${(treeName || 'backup').replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Đọc và parse file JSON backup
 * @returns {{ members, relationships, meta }} hoặc throw Error
 */
export const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.members || !Array.isArray(data.members)) {
          throw new Error('File JSON không hợp lệ: thiếu danh sách thành viên.');
        }
        resolve({
          meta: data._meta || {},
          members: data.members,
          relationships: data.relationships || { parents: [], spouses: [] },
        });
      } catch (err) {
        reject(new Error('Không thể đọc file JSON: ' + err.message));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
};

// ──────────────────────────────────────────────
// CSV
// ──────────────────────────────────────────────

const CSV_COLUMNS = [
  { key: 'fullName',          label: 'Họ và tên' },
  { key: 'gender',            label: 'Giới tính' },
  { key: 'generationLevel',   label: 'Thế hệ' },
  { key: 'birthYear',         label: 'Năm sinh' },
  { key: 'birthMonth',        label: 'Tháng sinh' },
  { key: 'birthDay',          label: 'Ngày sinh' },
  { key: 'deathYear',         label: 'Năm mất' },
  { key: 'isAlive',           label: 'Còn sống' },
  { key: 'occupation',        label: 'Nghề nghiệp' },
  { key: 'currentResidence',  label: 'Nơi ở' },
  { key: 'phoneNumber',       label: 'Số điện thoại' },
  { key: 'biography',         label: 'Tiểu sử' },
  { key: 'note',              label: 'Ghi chú' },
  { key: 'tabooName',         label: 'Tên húy' },
  { key: 'courtesyName',      label: 'Tên tự' },
];

const genderLabel = (g) => g === 0 ? 'Nam' : g === 1 ? 'Nữ' : 'Khác';
const escapeCell = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

/**
 * Xuất danh sách thành viên ra file CSV
 */
export const exportToCsv = (members, treeName) => {
  const headers = CSV_COLUMNS.map(c => escapeCell(c.label)).join(',');
  const rows = members.map(m => CSV_COLUMNS.map(c => {
    if (c.key === 'gender') return escapeCell(genderLabel(m.gender));
    if (c.key === 'isAlive') return escapeCell(m.isAlive ? 'Còn sống' : 'Đã mất');
    return escapeCell(m[c.key] ?? '');
  }).join(','));

  const csv = '\uFEFF' + [headers, ...rows].join('\r\n'); // BOM để Excel đọc đúng UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GiaPha_${(treeName || 'backup').replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse file CSV thành danh sách thành viên
 */
export const parseCsvFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = e.target.result;
        // Bỏ BOM nếu có
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) throw new Error('File CSV trống hoặc không có dữ liệu.');

        const headerRow = parseCsvLine(lines[0]);
        const colMap = {};
        CSV_COLUMNS.forEach(col => {
          const idx = headerRow.findIndex(h =>
            h.trim().toLowerCase() === col.label.toLowerCase() ||
            h.trim().toLowerCase() === col.key.toLowerCase()
          );
          if (idx !== -1) colMap[col.key] = idx;
        });

        if (colMap.fullName === undefined) throw new Error('Không tìm thấy cột "Họ và tên" trong file CSV.');

        const rows = lines.slice(1).map((line, idx) => {
          const cells = parseCsvLine(line);
          const get = (key) => colMap[key] !== undefined ? (cells[colMap[key]] || '').trim() : '';

          const fullName = get('fullName');
          const rawGender = get('gender').toLowerCase();
          const gender = rawGender === 'nữ' || rawGender === 'nu' ? 1 : rawGender === 'khác' ? 2 : 0;
          const isAlive = get('isAlive').toLowerCase() !== 'đã mất' && get('isAlive').toLowerCase() !== 'da mat';
          const birthYear = parseInt(get('birthYear'), 10) || null;
          const deathYear = parseInt(get('deathYear'), 10) || null;
          const generationLevel = parseInt(get('generationLevel'), 10) || 1;

          const errors = [];
          if (!fullName) errors.push('Thiếu họ và tên');
          if (birthYear && (birthYear < 1000 || birthYear > new Date().getFullYear())) errors.push('Năm sinh không hợp lệ');
          if (deathYear && birthYear && deathYear < birthYear) errors.push('Năm mất < năm sinh');

          return {
            rowIndex: idx + 2,
            fullName,
            gender,
            isAlive,
            generationLevel,
            birthYear,
            birthMonth: parseInt(get('birthMonth'), 10) || null,
            birthDay: parseInt(get('birthDay'), 10) || null,
            deathYear,
            occupation: get('occupation'),
            currentResidence: get('currentResidence'),
            phoneNumber: get('phoneNumber'),
            biography: get('biography'),
            note: get('note'),
            tabooName: get('tabooName'),
            courtesyName: get('courtesyName'),
            isValid: errors.length === 0,
            errors,
          };
        }).filter(r => r.fullName || r.errors.length > 0);

        resolve(rows);
      } catch (err) {
        reject(new Error('Không thể đọc file CSV: ' + err.message));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
};

// Parser CSV đơn giản hỗ trợ ô có dấu phẩy và ngoặc kép
function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
