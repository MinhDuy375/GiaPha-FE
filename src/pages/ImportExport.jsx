import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import memberService from '../services/memberService';
import { exportMembersToExcel, downloadMemberTemplate, parseExcelFile } from '../utils/excelUtils';

function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconFileExcel() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#107c41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13l3 3m0-3l-3 3" />
      <path d="M16 13l-3 3m0-3l3 3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function ImportExport() {
  const { currentTree } = useFamilyTree();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('export');

  // Import State
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    loadMembers();
  }, [currentTree]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await memberService.getMembers();
      setMembers(data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách thành viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportMembersToExcel(members, currentTree?.name || 'Gia Phả');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setImportResult(null);

    try {
      const rows = await parseExcelFile(file);
      setParsedRows(rows);
    } catch (err) {
      alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file!');
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Không có hàng dữ liệu nào hợp lệ để nhập!');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn nhập ${validRows.length} thành viên vào gia phả?`)) return;

    setImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await memberService.createMember({
          fullName: row.fullName,
          gender: row.gender,
          isAlive: row.isAlive,
          generationLevel: row.generationLevel,
          birthYear: row.birthYear,
          deathYear: row.deathYear,
          occupation: row.occupation,
          currentResidence: row.currentResidence,
          bio: row.bio
        });
        successCount++;
      } catch (err) {
        console.error(`Lỗi tạo dòng ${row.rowIndex}:`, err);
        failCount++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImporting(false);
    setImportResult({ successCount, failCount });
    setParsedRows([]);
    setFileName('');
    await loadMembers();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="page">
      <Navbar />

      <main className="page-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconFileExcel /> Nhập & Xuất Dữ liệu Excel
          </h1>
          <p className="section-sub">
            Quản lý, sao lưu dữ liệu dòng họ chuẩn định dạng Microsoft Excel (.xlsx) với tốc độ cao và giao diện trực quan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
          <button
            className={`btn ${activeTab === 'export' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('export')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <IconDownload /> Xuất Dữ liệu Excel
          </button>
          <button
            className={`btn ${activeTab === 'import' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('import')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <IconUpload /> Nhập Hàng Loạt từ Excel
          </button>
        </div>

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 12 }}>Tải về File Excel Gia Phả</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                Xuất toàn bộ danh sách thành viên hiện có cùng sheet thống kê tổng quan (Nam/Nữ, Số thế hệ, Trạng thái) ra file chuẩn Excel (.xlsx).
              </p>

              <div style={{ background: 'var(--color-bg-subtle, #f8fafc)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Thông tin dữ liệu sẽ xuất:</div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                  <li>Tổng số thành viên: <strong>{members.length}</strong></li>
                  <li>Số thế hệ ghi nhận: <strong>{members.reduce((m, x) => Math.max(m, x.generationLevel || 1), 1)} thế hệ</strong></li>
                  <li>Định dạng file: <strong>Microsoft Excel (.xlsx)</strong></li>
                  <li>Bao gồm Sheet Thống kê tổng quan & Sheet Chi tiết thành viên</li>
                </ul>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 20px', fontSize: 15, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                onClick={handleExport}
                disabled={loading || members.length === 0}
              >
                <IconDownload /> Xuất ngay File Excel (.xlsx)
              </button>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 12 }}>Tính năng hỗ trợ xuất Excel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(16, 124, 65, 0.1)', color: '#107c41', padding: 8, borderRadius: 6 }}>
                    <IconCheck />
                  </div>
                  <div>
                    <strong>Tối ưu định dạng ô & độ rộng cột:</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>Cột tự động căn chỉnh vừa vặn với độ dài nội dung tiếng Việt.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(16, 124, 65, 0.1)', color: '#107c41', padding: 8, borderRadius: 6 }}>
                    <IconCheck />
                  </div>
                  <div>
                    <strong>Báo cáo Đa Sheet (Multi-sheet):</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>Phân tách riêng Sheet Thống Kê và Sheet Danh Sách giúp dễ xem báo cáo.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(16, 124, 65, 0.1)', color: '#107c41', padding: 8, borderRadius: 6 }}>
                    <IconCheck />
                  </div>
                  <div>
                    <strong>Bảo toàn Tiếng Việt có dấu:</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 2 }}>Mã hóa UTF-8 chuẩn xác, không bị lỗi font khi mở trong Excel, Google Sheets.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, fontSize: 18, marginBottom: 12 }}>Các bước nhập hàng loạt thành viên từ Excel</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                {/* Bước 1 */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Bước 1</div>
                  <div style={{ fontWeight: 600, margin: '6px 0 8px' }}>Tải file Excel Mẫu</div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    Tải mẫu Excel chuẩn có sẵn cấu trúc cột và hướng dẫn nhập.
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={downloadMemberTemplate} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <IconDownload /> Tải file mẫu (.xlsx)
                  </button>
                </div>

                {/* Bước 2 */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Bước 2</div>
                  <div style={{ fontWeight: 600, margin: '6px 0 8px' }}>Chọn file Excel để tải lên</div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    Chọn file Excel chứa thông tin các thành viên đã điền.
                  </p>
                  <label className="btn btn-primary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                    <IconUpload /> {fileName ? 'Thay đổi file' : 'Chọn file Excel'}
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {fileName && (
                <div style={{ background: 'var(--color-bg-subtle, #f1f5f9)', padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Tên file đã chọn: <strong>{fileName}</strong></span>
                  {isParsing && <span style={{ color: 'var(--color-primary)' }}>Đang đọc dữ liệu...</span>}
                </div>
              )}
            </div>

            {/* Notification after import */}
            {importResult && (
              <div className="card" style={{ padding: 20, background: importResult.failCount === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${importResult.failCount === 0 ? '#10b981' : '#ef4444'}` }}>
                <h4 style={{ margin: '0 0 8px', color: importResult.failCount === 0 ? '#065f46' : '#991b1b' }}>
                  Kết quả nhập dữ liệu
                </h4>
                <div>Nhập thành công: <strong>{importResult.successCount}</strong> thành viên.</div>
                {importResult.failCount > 0 && <div>Bị lỗi: <strong>{importResult.failCount}</strong> dòng.</div>}
              </div>
            )}

            {/* Progress indicator */}
            {importing && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Đang nhập dữ liệu vào Gia Phả... ({importProgress}%)</div>
                <div style={{ background: '#e2e8f0', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${importProgress}%`, background: 'var(--color-primary)', height: '100%', transition: 'width 0.2s' }} />
                </div>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && !importing && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Xem trước dữ liệu ({parsedRows.length} dòng)</h3>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      <span style={{ color: '#10b981', fontWeight: 600, marginRight: 12 }}>✓ Hợp lệ: {validCount}</span>
                      {invalidCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Có lỗi: {invalidCount}</span>}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={validCount === 0}
                    onClick={handleImportSubmit}
                    style={{ padding: '8px 20px', fontWeight: 600 }}
                  >
                    Nhập {validCount} thành viên hợp lệ vào Gia Phả
                  </button>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--color-bg-subtle, #f8fafc)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                        <th style={{ padding: '10px 12px' }}>Dòng Excel</th>
                        <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                        <th style={{ padding: '10px 12px' }}>Họ và tên</th>
                        <th style={{ padding: '10px 12px' }}>Giới tính</th>
                        <th style={{ padding: '10px 12px' }}>Thế hệ</th>
                        <th style={{ padding: '10px 12px' }}>Năm sinh</th>
                        <th style={{ padding: '10px 12px' }}>Năm mất</th>
                        <th style={{ padding: '10px 12px' }}>Nghề nghiệp</th>
                        <th style={{ padding: '10px 12px' }}>Nơi ở</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', background: row.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>Dòng {row.rowIndex}</td>
                          <td style={{ padding: '8px 12px' }}>
                            {row.isValid ? (
                              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <IconCheck /> Hợp lệ
                              </span>
                            ) : (
                              <span title={row.errors.join(', ')} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <IconAlert /> {row.errors[0]}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.fullName || '—'}</td>
                          <td style={{ padding: '8px 12px' }}>{row.gender === 0 ? 'Nam' : row.gender === 1 ? 'Nữ' : 'Khác'}</td>
                          <td style={{ padding: '8px 12px' }}>Đời {row.generationLevel}</td>
                          <td style={{ padding: '8px 12px' }}>{row.birthYear || '—'}</td>
                          <td style={{ padding: '8px 12px' }}>{row.isAlive ? 'Còn sống' : (row.deathYear || 'Đã mất')}</td>
                          <td style={{ padding: '8px 12px' }}>{row.occupation || '—'}</td>
                          <td style={{ padding: '8px 12px' }}>{row.currentResidence || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
