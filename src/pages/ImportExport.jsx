import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import memberService from '../services/memberService';
import relationshipService from '../services/relationshipService';
import { exportMembersToExcel, downloadMemberTemplate, parseExcelFile } from '../utils/excelUtils';
import { exportToJson, parseJsonFile, exportToCsv, parseCsvFile } from '../utils/backupUtils';

// ── Icons ────────────────────────────────────────────────────────────────────
function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Format Card ───────────────────────────────────────────────────────────────
function FormatCard({ icon, color, title, ext, desc, features, onExport, onImport, exportLabel, importLabel, exportDisabled }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            <span style={{ background: color + '18', color, padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>{ext}</span>
          </div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>

      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.9 }}>
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
          onClick={onExport}
          disabled={exportDisabled}
        >
          <IconDownload /> {exportLabel || 'Xuất file'}
        </button>
        {onImport && (
          <label
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}
          >
            <IconUpload /> {importLabel || 'Nhập file'}
            <input type="file" style={{ display: 'none' }} onChange={onImport} />
          </label>
        )}
      </div>
    </div>
  );
}

// ── Preview Table ─────────────────────────────────────────────────────────────
function PreviewTable({ rows, onConfirm, importing, importProgress }) {
  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>Xem trước — {rows.length} dòng</h3>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            <span style={{ color: '#10b981', fontWeight: 600, marginRight: 10 }}>✓ Hợp lệ: {validCount}</span>
            {invalidCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Lỗi: {invalidCount}</span>}
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={validCount === 0 || importing}
          onClick={onConfirm}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          Nhập {validCount} thành viên hợp lệ
        </button>
      </div>

      {importing && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Đang nhập... ({importProgress}%)</div>
          <div style={{ background: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${importProgress}%`, background: 'var(--color-primary)', height: '100%', transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-subtle,#f8fafc)', borderBottom: '2px solid var(--color-border)' }}>
              {['Dòng', 'Trạng thái', 'Họ và tên', 'Giới tính', 'Đời', 'Năm sinh', 'Còn sống', 'Nghề nghiệp', 'Nơi ở'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', background: row.isValid ? 'transparent' : 'rgba(239,68,68,0.04)' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>{row.rowIndex}</td>
                <td style={{ padding: '6px 10px' }}>
                  {row.isValid
                    ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconCheck />OK</span>
                    : <span title={row.errors.join(', ')} style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconAlert />{row.errors[0]}</span>
                  }
                </td>
                <td style={{ padding: '6px 10px', fontWeight: 500 }}>{row.fullName || '—'}</td>
                <td style={{ padding: '6px 10px' }}>{row.gender === 0 ? 'Nam' : row.gender === 1 ? 'Nữ' : 'Khác'}</td>
                <td style={{ padding: '6px 10px' }}>Đời {row.generationLevel}</td>
                <td style={{ padding: '6px 10px' }}>{row.birthYear || '—'}</td>
                <td style={{ padding: '6px 10px' }}>{row.isAlive ? 'Sống' : 'Đã mất'}</td>
                <td style={{ padding: '6px 10px' }}>{row.occupation || '—'}</td>
                <td style={{ padding: '6px 10px' }}>{row.currentResidence || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ImportExport() {
  const { currentTree } = useFamilyTree();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // shared import state
  const [parsedRows, setParsedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  useEffect(() => { loadMembers(); }, [currentTree]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await memberService.getMembers();
      setMembers(data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const resetImport = () => {
    setParsedRows([]);
    setImportResult(null);
    setImportError('');
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (!validRows.length) return;
    if (!confirm(`Nhập ${validRows.length} thành viên vào gia phả?`)) return;

    setImporting(true);
    setImportProgress(0);
    let successCount = 0, failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await memberService.createMember({
          fullName: row.fullName,
          gender: row.gender,
          isAlive: row.isAlive,
          generationLevel: row.generationLevel,
          birthYear: row.birthYear,
          birthMonth: row.birthMonth,
          birthDay: row.birthDay,
          deathYear: row.deathYear,
          occupation: row.occupation,
          currentResidence: row.currentResidence,
          biography: row.biography,
          note: row.note,
          tabooName: row.tabooName,
          courtesyName: row.courtesyName,
          phoneNumber: row.phoneNumber,
        });
        successCount++;
      } catch {
        failCount++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImporting(false);
    setImportResult({ successCount, failCount });
    setParsedRows([]);
    await loadMembers();
  };

  // ── Export handlers ──────────────────────────────────────────────────────────
  const handleExportExcel = () => exportMembersToExcel(members, currentTree?.name);

  const handleExportJson = async () => {
    try {
      let rels = { parents: [], spouses: [] };
      try { rels = await relationshipService.getRelationships(); } catch { /* ignore nếu thiếu quyền */ }
      exportToJson(members, rels, currentTree?.name);
    } catch (err) {
      alert('Lỗi xuất JSON: ' + err.message);
    }
  };

  const handleExportCsv = () => exportToCsv(members, currentTree?.name);

  // ── Import handlers ──────────────────────────────────────────────────────────
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetImport();
    try {
      const rows = await parseExcelFile(file);
      setParsedRows(rows);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetImport();
    try {
      const rows = await parseCsvFile(file);
      setParsedRows(rows);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetImport();
    try {
      const { meta, members: importedMembers } = await parseJsonFile(file);
      // Chuyển về format preview giống Excel/CSV
      const rows = importedMembers.map((m, idx) => {
        const errors = [];
        if (!m.fullName?.trim()) errors.push('Thiếu họ và tên');
        return {
          rowIndex: idx + 1,
          fullName: m.fullName || '',
          gender: m.gender ?? 0,
          isAlive: m.isAlive ?? true,
          generationLevel: m.generationLevel || 1,
          birthYear: m.birthYear || null,
          birthMonth: m.birthMonth || null,
          birthDay: m.birthDay || null,
          deathYear: m.deathYear || null,
          occupation: m.occupation || '',
          currentResidence: m.currentResidence || '',
          biography: m.biography || '',
          note: m.note || '',
          tabooName: m.tabooName || '',
          courtesyName: m.courtesyName || '',
          phoneNumber: m.phoneNumber || '',
          isValid: errors.length === 0,
          errors,
        };
      });
      setParsedRows(rows);
      if (meta?.treeName) {
        setImportResult(prev => ({ ...prev, _jsonMeta: meta }));
      }
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const treeName = currentTree?.name || 'Gia Phả';
  const exportDisabled = loading || members.length === 0;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div className="section-header" style={{ marginBottom: 28 }}>
          <h1 className="section-title">Sao lưu &amp; Phục hồi Dữ liệu</h1>
          <p className="section-sub">
            Xuất và nhập dữ liệu dòng họ <strong>{treeName}</strong> theo nhiều định dạng phù hợp để lưu trữ và chia sẻ.
            {!loading && <span style={{ marginLeft: 8, color: 'var(--color-primary)', fontWeight: 600 }}>{members.length} thành viên</span>}
          </p>
        </div>

        {/* Format Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>

          {/* Excel */}
          <FormatCard
            icon="📊"
            color="#107c41"
            title="Microsoft Excel"
            ext=".xlsx"
            desc="Định dạng bảng tính phổ biến. Hỗ trợ xem, chỉnh sửa trong Excel và Google Sheets."
            features={[
              'Nhiều sheet: Danh sách + Thống kê',
              'Tự động căn chỉnh cột, hỗ trợ tiếng Việt',
              'Nhập hàng loạt thành viên từ file mẫu',
            ]}
            exportLabel="Xuất Excel (.xlsx)"
            importLabel="Nhập từ Excel"
            onExport={handleExportExcel}
            onImport={handleImportExcel}
            exportDisabled={exportDisabled}
          />

          {/* JSON */}
          <FormatCard
            icon="🗂️"
            color="#6366f1"
            title="JSON Backup"
            ext=".json"
            desc="Định dạng backup đầy đủ — bao gồm thành viên và quan hệ gia đình. Lý tưởng để sao lưu và phục hồi."
            features={[
              'Backup toàn bộ: thành viên + quan hệ',
              'Có thể phục hồi lại gia phả từ file này',
              'Dễ đọc, tương thích với mọi hệ thống',
            ]}
            exportLabel="Xuất JSON (.json)"
            importLabel="Nhập từ JSON"
            onExport={handleExportJson}
            onImport={handleImportJson}
            exportDisabled={exportDisabled}
          />

          {/* CSV */}
          <FormatCard
            icon="📋"
            color="#f59e0b"
            title="CSV (Bảng tính)"
            ext=".csv"
            desc="Định dạng văn bản thuần, tương thích rộng rãi với mọi phần mềm bảng tính và database."
            features={[
              'Mở được trong Excel, LibreOffice, Numbers',
              'Nhẹ, dễ chia sẻ và xử lý bằng script',
              'Hỗ trợ đầy đủ thông tin thành viên',
            ]}
            exportLabel="Xuất CSV (.csv)"
            importLabel="Nhập từ CSV"
            onExport={handleExportCsv}
            onImport={handleImportCsv}
            exportDisabled={exportDisabled}
          />

          {/* Template download card */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#06b6d418', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>File Mẫu Nhập Liệu</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  <span style={{ background: '#06b6d418', color: '#06b6d4', padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>Excel Template</span>
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Tải file Excel mẫu có sẵn cấu trúc cột và dữ liệu ví dụ. Điền thông tin vào rồi nhập lại qua ô "Nhập từ Excel".
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.9 }}>
              <li>Sheet hướng dẫn chi tiết từng cột</li>
              <li>Dữ liệu mẫu 3 thành viên sẵn có</li>
              <li>Cấu trúc chuẩn, không cần chỉnh sửa tiêu đề</li>
            </ul>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, marginTop: 'auto' }}
              onClick={downloadMemberTemplate}
            >
              <IconDownload /> Tải file mẫu Excel
            </button>
          </div>
        </div>

        {/* Import result notification */}
        {importResult && importResult.successCount !== undefined && (
          <div className="card" style={{
            padding: '16px 20px',
            marginBottom: 16,
            background: importResult.failCount === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${importResult.failCount === 0 ? '#10b981' : '#f59e0b'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
          }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {importResult.failCount === 0 ? '✅ Nhập thành công!' : '⚠️ Nhập xong có lỗi'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Thành công: <strong>{importResult.successCount}</strong> thành viên
                {importResult.failCount > 0 && <span style={{ color: '#ef4444', marginLeft: 12 }}>Lỗi: <strong>{importResult.failCount}</strong> dòng</span>}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setImportResult(null)}>Đóng</button>
          </div>
        )}

        {/* Import error */}
        {importError && (
          <div className="card" style={{ padding: '14px 20px', marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#dc2626' }}><IconAlert /> {importError}</div>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setImportError('')}>Đóng</button>
          </div>
        )}

        {/* Preview Table */}
        {parsedRows.length > 0 && !importing && (
          <PreviewTable
            rows={parsedRows}
            onConfirm={handleImportSubmit}
            importing={importing}
            importProgress={importProgress}
          />
        )}

        {/* Progress */}
        {importing && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Đang nhập dữ liệu... ({importProgress}%)</div>
            <div style={{ background: '#e2e8f0', height: 10, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${importProgress}%`, background: 'var(--color-primary)', height: '100%', transition: 'width 0.2s' }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
