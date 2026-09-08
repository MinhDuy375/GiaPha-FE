import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import memberService from '../services/memberService';
import Navbar from '../components/Navbar';
import { computeTreeLayout, filterTreeData, GENDER_COLORS, NODE_WIDTH, NODE_HEIGHT, AVATAR_RADIUS, RING_GAP } from '../utils/treeLayout';
import { API_ORIGIN } from '../services/api';
import { useFamilyTree } from '../contexts/FamilyTreeContext';

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconMinus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

/* ─── Member Form Modal ─────────────────────────────────────── */
export function MemberFormModal({ open, onClose, onSave, members, editingMember }) {
  const [form, setForm] = useState({
    fullName: '', tabooName: '', courtesyName: '', otherNames: '', gender: 0,
    birthYear: '', birthMonth: '', birthDay: '', deathYear: '', deathMonth: '', deathDay: '',
    birthDateLunar: '', birthLunarYear: '', birthLunarMonth: '', birthLunarDay: '',
    deathDateLunar: '', deathLunarYear: '', deathLunarMonth: '', deathLunarDay: '',
    isAlive: true, isInLaw: false, birthOrder: '', biography: '', note: '', generationLevel: 1,
    phoneNumber: '', occupation: '', currentResidence: '', avatarUrl: '',
    fatherId: '', motherId: '', spouseId: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (open) {
      if (editingMember) {
        setForm({
          fullName: editingMember.full_name || '',
          tabooName: editingMember.taboo_name || '',
          courtesyName: editingMember.courtesy_name || '',
          otherNames: editingMember.other_names || '',
          gender: editingMember.gender === 'female' ? 1 : 0,
          birthYear: editingMember.birth_year || '',
          birthMonth: editingMember.birth_month || '',
          birthDay: editingMember.birth_day || '',
          deathYear: editingMember.death_year || '',
          deathMonth: editingMember.death_month || '',
          deathDay: editingMember.death_day || '',
          birthDateLunar: editingMember.birth_date_lunar || '',
          birthLunarYear: editingMember.birth_lunar_year || '',
          birthLunarMonth: editingMember.birth_lunar_month || '',
          birthLunarDay: editingMember.birth_lunar_day || '',
          deathDateLunar: editingMember.death_date_lunar || '',
          deathLunarYear: editingMember.death_lunar_year || '',
          deathLunarMonth: editingMember.death_lunar_month || '',
          deathLunarDay: editingMember.death_lunar_day || '',
          isAlive: editingMember.isAlive !== false,
          isInLaw: editingMember.is_in_law === true,
          birthOrder: editingMember.birth_order || '',
          biography: editingMember.biography || '',
          note: editingMember.note || '',
          phoneNumber: editingMember.phone_number || '',
          occupation: editingMember.occupation || '',
          currentResidence: editingMember.current_residence || '',
          avatarUrl: editingMember.avatar_url || '',
          generationLevel: editingMember.generation || 1,
          fatherId: '', motherId: '', spouseId: ''
        });
      } else {
        setForm({ fullName: '', tabooName: '', courtesyName: '', otherNames: '', gender: 0, birthYear: '', birthMonth: '', birthDay: '', deathYear: '', deathMonth: '', deathDay: '', birthDateLunar: '', birthLunarYear: '', birthLunarMonth: '', birthLunarDay: '', deathDateLunar: '', deathLunarYear: '', deathLunarMonth: '', deathLunarDay: '', isAlive: true, isInLaw: false, birthOrder: '', biography: '', note: '', generationLevel: 1, phoneNumber: '', occupation: '', currentResidence: '', avatarUrl: '', fatherId: '', motherId: '', spouseId: '' });
      }
      setError('');
      setAvatarFile(null);
    }
  }, [open, editingMember]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const birthYear = form.birthYear === '' ? null : Number(form.birthYear);
    const deathYear = form.deathYear === '' ? null : Number(form.deathYear);
    const generationLevel = Number(form.generationLevel);

    if (!form.fullName.trim()) { setError('Tên thành viên không được để trống.'); return; }
    if (form.birthYear !== '' && (!Number.isInteger(birthYear) || birthYear < 1400 || birthYear > 2100)) {
      setError('Năm sinh phải nằm trong khoảng từ 1400 đến 2100.'); return;
    }
    if (form.deathYear !== '' && (!Number.isInteger(deathYear) || deathYear < 1400 || deathYear > 2100)) {
      setError('Năm mất phải nằm trong khoảng từ 1400 đến 2100.'); return;
    }
    if (form.isAlive && deathYear !== null) {
      setError('Thành viên còn sống không được có năm mất.'); return;
    }
    if (birthYear !== null && deathYear !== null && deathYear < birthYear) {
      setError('Năm mất không thể trước năm sinh.'); return;
    }
    if (!Number.isInteger(generationLevel) || generationLevel < 1 || generationLevel > 30) {
      setError('Đời thứ phải nằm trong khoảng từ 1 đến 30.'); return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        fullName: form.fullName.trim(),
        tabooName: form.tabooName || null,
        courtesyName: form.courtesyName || null,
        otherNames: form.otherNames || null,
        gender: Number(form.gender),
        birthYear,
        birthMonth: form.birthMonth === '' ? null : Number(form.birthMonth),
        birthDay: form.birthDay === '' ? null : Number(form.birthDay),
        deathYear,
        deathMonth: form.deathMonth === '' ? null : Number(form.deathMonth),
        deathDay: form.deathDay === '' ? null : Number(form.deathDay),
        birthDateLunar: form.birthDateLunar || null,
        birthLunarYear: form.birthLunarYear === '' ? null : Number(form.birthLunarYear),
        birthLunarMonth: form.birthLunarMonth === '' ? null : Number(form.birthLunarMonth),
        birthLunarDay: form.birthLunarDay === '' ? null : Number(form.birthLunarDay),
        deathDateLunar: form.deathDateLunar || null,
        deathLunarYear: form.deathLunarYear === '' ? null : Number(form.deathLunarYear),
        deathLunarMonth: form.deathLunarMonth === '' ? null : Number(form.deathLunarMonth),
        deathLunarDay: form.deathLunarDay === '' ? null : Number(form.deathLunarDay),
        isAlive: form.isAlive,
        isInLaw: form.isInLaw,
        birthOrder: form.birthOrder === '' ? null : Number(form.birthOrder),
        biography: form.biography || null,
        note: form.note || null,
        phoneNumber: form.phoneNumber || null,
        occupation: form.occupation || null,
        currentResidence: form.currentResidence || null,
        avatarUrl: form.avatarUrl || null,
        avatarFile,
        generationLevel,
        fatherId: form.fatherId || null,
        motherId: form.motherId || null,
        spouseId: form.spouseId || null,
      });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  const formatDateInput = (year, month, day) => year && month && day
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
  const updateSolarDate = (field, value) => {
    const [year, month, day] = value ? value.split('-').map(Number) : ['', '', ''];
    update(field === 'birth' ? 'birthYear' : 'deathYear', year);
    update(field === 'birth' ? 'birthMonth' : 'deathMonth', month);
    update(field === 'birth' ? 'birthDay' : 'deathDay', day);
    const lunar = value ? solarToLunar(`${value}T00:00:00`) : null;
    const prefix = field === 'birth' ? 'birth' : 'death';
    update(`${prefix}DateLunar`, lunar ? `${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap ? ' (nhuận)' : ''}` : '');
    update(`${prefix}LunarDay`, lunar?.day || '');
    update(`${prefix}LunarMonth`, lunar?.month || '');
    update(`${prefix}LunarYear`, lunar?.year || '');
  };

  const inputStyle = {
    width: '100%', height: 40, padding: '0 12px', fontSize: '0.875rem',
    background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
    borderRadius: 8, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', border: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.3rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Họ và tên *</label>
              <input style={inputStyle} value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Ví dụ: Nguyễn Văn A..." />
            </div>
            <div>
              <label style={labelStyle}>Tên húy (Tên thờ)</label>
              <input style={inputStyle} value={form.tabooName} onChange={e => update('tabooName', e.target.value)} placeholder="Không bắt buộc..." />
            </div>
            <div>
              <label style={labelStyle}>Tên tự / tên khác</label>
              <input style={inputStyle} value={form.courtesyName} onChange={e => update('courtesyName', e.target.value)} placeholder="Không bắt buộc..." />
            </div>
            <div>
              <label style={labelStyle}>Tên khác</label>
              <input style={inputStyle} value={form.otherNames} onChange={e => update('otherNames', e.target.value)} placeholder="Tên thường gọi, bí danh..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Giới tính</label>
              <select style={inputStyle} value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value={0}>Nam</option>
                <option value={1}>Nữ</option>
                <option value={2}>Khác</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Ngày sinh dương lịch</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 6 }}>
                <input style={{ ...inputStyle, gridColumn: '1 / -1' }} type="date" value={formatDateInput(form.birthYear, form.birthMonth, form.birthDay)} onChange={e => updateSolarDate('birth', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ngày sinh âm lịch</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 6 }}>
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.birthLunarDay} readOnly placeholder="Ngày" />
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.birthLunarMonth} readOnly placeholder="Tháng" />
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.birthLunarYear} readOnly placeholder="Năm" />
              </div>
            </div>
          </div>

          {!form.isAlive && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Ngày mất dương lịch</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 6 }}>
                <input style={{ ...inputStyle, gridColumn: '1 / -1' }} type="date" value={formatDateInput(form.deathYear, form.deathMonth, form.deathDay)} onChange={e => updateSolarDate('death', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ngày mất âm lịch</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 6 }}>
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.deathLunarDay} readOnly placeholder="Ngày" />
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.deathLunarMonth} readOnly placeholder="Tháng" />
                <input style={{ ...inputStyle, background: 'var(--color-surface-alt)' }} type="number" value={form.deathLunarYear} readOnly placeholder="Năm" />
              </div>
            </div>
          </div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Đời thứ (Thế hệ)</label>
              <input style={inputStyle} type="number" value={form.generationLevel} onChange={e => update('generationLevel', e.target.value)} min={1} max={30} />
            </div>
            <div>
              <label style={labelStyle}>Thứ tự sinh</label>
              <input style={inputStyle} type="number" value={form.birthOrder} onChange={e => update('birthOrder', e.target.value)} min={1} placeholder="Con thứ..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="is-alive" checked={form.isAlive} onChange={e => {
                update('isAlive', e.target.checked);
                if (e.target.checked) {
                  update('deathYear', ''); update('deathMonth', ''); update('deathDay', '');
                  update('deathDateLunar', ''); update('deathLunarYear', ''); update('deathLunarMonth', ''); update('deathLunarDay', '');
                }
              }} />
              <label htmlFor="is-alive" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Còn sống</label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="is-in-law" checked={form.isInLaw} onChange={e => update('isInLaw', e.target.checked)} />
            <label htmlFor="is-in-law" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Thành viên dâu/rể</label>
          </div>

          {!editingMember && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Cha</label>
                <select style={inputStyle} value={form.fatherId} onChange={e => update('fatherId', e.target.value)}>
                  <option value="">-- Chọn cha --</option>
                  {members.filter(m => m.gender !== 'female').map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mẹ</label>
                <select style={inputStyle} value={form.motherId} onChange={e => update('motherId', e.target.value)}>
                  <option value="">-- Chọn mẹ --</option>
                  {members.filter(m => m.gender === 'female').map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vợ/Chồng</label>
                <select style={inputStyle} value={form.spouseId} onChange={e => update('spouseId', e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Tiểu sử</label>
            <textarea style={{ ...inputStyle, height: 80, padding: '8px 12px', resize: 'vertical' }}
              value={form.biography} onChange={e => update('biography', e.target.value)} placeholder="Ghi chú về thành viên..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelStyle}>Avatar URL</label>
              <input style={inputStyle} type="url" value={form.avatarUrl} onChange={e => update('avatarUrl', e.target.value)} placeholder="https://..." />
              <input style={{ ...inputStyle, marginTop: 6, padding: 6 }} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <label style={labelStyle}>Ghi chú riêng</label>
              <input style={inputStyle} value={form.note} onChange={e => update('note', e.target.value)} placeholder="Thông tin bổ sung..." />
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Thông tin liên hệ và nghề nghiệp</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input style={inputStyle} type="tel" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} placeholder="Số điện thoại" />
              <input style={inputStyle} value={form.occupation} onChange={e => update('occupation', e.target.value)} placeholder="Nghề nghiệp" />
              <input style={{ ...inputStyle, gridColumn: '1 / -1' }} value={form.currentResidence} onChange={e => update('currentResidence', e.target.value)} placeholder="Nơi ở hiện tại" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editingMember ? 'Cập nhật' : 'Thêm thành viên'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tree Node Card ────────────────────────────────────────── */

/** Vẽ nội dung 1 người (avatar/tên/năm) bên trong 1 nửa thẻ có gốc tại (x, y) và bề rộng `width`. */
function PersonHalf({ person, x, y, width, height, colors, minimal }) {
  const cx = x + width / 2;
  const cardH = height || NODE_HEIGHT;
  const initials = person.full_name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
  const years = [person.birth_year, person.death_year].filter(Boolean);
  const yearStr = years.length === 2 ? `${years[0]} – ${years[1]}` : years[0] ? `SN ${years[0]}` : '';

  if (minimal) {
    return (
      <>
        <foreignObject x={x + 4} y={y} width={Math.max(width - 8, 0)} height={cardH}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 1.25,
            overflow: 'hidden', whiteSpace: 'normal', wordBreak: 'break-word'
          }}>
            {person.full_name}
          </div>
        </foreignObject>
        {!person.isAlive && <text x={x + width - 12} y={y + 15} fontSize={11} fill="var(--color-text-muted)">†</text>}
      </>
    );
  }

  return (
    <>
      <defs><clipPath id={`avatar-${person.id}`}><circle cx={cx} cy={y + 46} r={AVATAR_RADIUS} /></clipPath></defs>
      <circle cx={cx} cy={y + 46} r={AVATAR_RADIUS} fill={colors.bg} stroke={colors.border} strokeWidth={2.5} />
      {person.avatar_url ? (
        <image
          href={person.avatar_url.startsWith('http') ? person.avatar_url : `${API_ORIGIN}${person.avatar_url}`}
          x={cx - AVATAR_RADIUS} y={y + 46 - AVATAR_RADIUS} width={AVATAR_RADIUS * 2} height={AVATAR_RADIUS * 2}
          preserveAspectRatio="xMidYMid slice" clipPath={`url(#avatar-${person.id})`} />
      ) : (
        <text x={cx} y={y + 52} textAnchor="middle" fontSize={16} fontWeight={700} fill={colors.text}>{initials}</text>
      )}
      <foreignObject x={x + 6} y={y + 46 + AVATAR_RADIUS + 6} width={Math.max(width - 12, 0)} height={38}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center',
          lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {person.full_name}
        </div>
      </foreignObject>
      {yearStr && (
        <text x={cx} y={y + cardH - 10} textAnchor="middle" fontSize={11} fill="var(--color-text-muted)">
          {yearStr}
        </text>
      )}
      {!person.isAlive && <text x={x + width - 14} y={y + 18} fontSize={14} fill="var(--color-text-muted)">†</text>}
    </>
  );
}

/**
 * Thẻ thành viên trên cây. Nếu là "trưởng cặp" (isCoupleLead) của vợ/chồng chính,
 * gộp cả 2 người vào chung 1 thẻ, ngăn cách bằng biểu tượng nhẫn 💍.
 * Người bị gộp vào thẻ đối phương (mergedIntoPartner) không tự vẽ thẻ riêng.
 */
function NodeCard({ member, selectedId, onSelectId, minimal }) {
  if (member.mergedIntoPartner) return null;

  const colors = GENDER_COLORS[member.gender] || GENDER_COLORS.other;
  const isCouple = member.isCoupleLead && !!member.partnerData;
  const cardHeight = member.height || NODE_HEIGHT;
  const leftWidth = member.width || NODE_WIDTH;
  const coupleGap = 14; // khoảng hở nhỏ giữa 2 thẻ vợ chồng riêng biệt (chỗ đặt icon nhẫn)
  const rightWidth = isCouple ? (member.coupleWidth - leftWidth - RING_GAP + coupleGap) : 0;
  const width = isCouple ? member.coupleWidth : leftWidth;
  const partnerColors = isCouple ? (GENDER_COLORS[member.partnerData.gender] || GENDER_COLORS.other) : null;
  const isSelected = selectedId === member.id || (isCouple && selectedId === member.partnerData.id);
  const centerX = member.x + leftWidth;

  return (
    <g className="gp-card">
      {/* Thẻ đơn: cả thẻ nổi lên khi hover. Thẻ vợ chồng: mỗi nửa hover riêng, không dùng transform chung cho cả <g>. */}
      {!isCouple ? (
        <g className="gp-card-half">
          <rect
            className="gp-card-rect"
            x={member.x} y={member.y}
            width={width} height={cardHeight}
            rx={14}
            fill="var(--color-surface)"
            stroke={isSelected ? colors.border : (member.isAlive ? colors.border : 'var(--color-border)')}
            strokeWidth={isSelected ? 2.5 : 1.5}
            style={isSelected ? { filter: `drop-shadow(0 0 10px ${colors.border}90)` } : undefined}
            opacity={member.isAlive ? 1 : 0.75}
          />
          <g onClick={e => { e.stopPropagation(); onSelectId(member.id); }} style={{ cursor: 'pointer' }}>
            <PersonHalf person={member} x={member.x} y={member.y} width={width} height={cardHeight} colors={colors} minimal={minimal} />
          </g>
        </g>
      ) : (
        <>
          {/* Nền chung phía sau — bao trọn 2 thẻ vợ chồng, tạo cảm giác liên kết "cùng 1 gia đình". */}
          <rect
            x={member.x - 6} y={member.y - 6}
            width={width + 12} height={cardHeight + 12}
            rx={18}
            fill="var(--color-surface)"
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Thẻ vợ (trái) — bo đủ 4 góc, viền màu riêng theo giới tính, kích thước bằng thẻ chồng. */}
          <g className="gp-card-half">
            <rect
              className="gp-card-rect gp-card-rect--half"
              x={member.x} y={member.y}
              width={leftWidth} height={cardHeight}
              rx={14}
              fill="var(--color-surface)"
              stroke={colors.border}
              strokeWidth={selectedId === member.id ? 2.5 : 1.5}
              style={selectedId === member.id ? { filter: `drop-shadow(0 0 8px ${colors.border}90)` } : undefined}
              opacity={member.isAlive ? 1 : 0.75}
            />
            <g onClick={e => { e.stopPropagation(); onSelectId(member.id); }} style={{ cursor: 'pointer' }}>
              <PersonHalf person={member} x={member.x} y={member.y} width={leftWidth} height={cardHeight} colors={colors} minimal={minimal} />
            </g>
          </g>

          {/* Thẻ chồng (phải) — bo đủ 4 góc, viền màu riêng theo giới tính, kích thước bằng thẻ vợ. */}
          <g className="gp-card-half">
            <rect
              className="gp-card-rect gp-card-rect--half"
              x={centerX + coupleGap} y={member.y}
              width={rightWidth} height={cardHeight}
              rx={14}
              fill="var(--color-surface)"
              stroke={partnerColors.border}
              strokeWidth={selectedId === member.partnerData.id ? 2.5 : 1.5}
              style={selectedId === member.partnerData.id ? { filter: `drop-shadow(0 0 8px ${partnerColors.border}90)` } : undefined}
              opacity={member.partnerData.isAlive ? 1 : 0.75}
            />
            <g onClick={e => { e.stopPropagation(); onSelectId(member.partnerData.id); }} style={{ cursor: 'pointer' }}>
              <PersonHalf person={member.partnerData} x={centerX + coupleGap} y={member.y} width={rightWidth} height={cardHeight} colors={partnerColors} minimal={minimal} />
            </g>
          </g>

          {/* Icon nhẫn — render sau cùng để luôn nổi lên trên cả 2 thẻ, đè lên khoảng hở giữa 2 thẻ. */}
          <circle cx={centerX + coupleGap / 2} cy={member.y + cardHeight / 2} r={13} fill="var(--color-surface)" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={centerX + coupleGap / 2} y={member.y + cardHeight / 2 + 5} textAnchor="middle" fontSize={14} aria-label="Vợ chồng">💍</text>
        </>
      )}
    </g>
  );
}

/* ─── Main FamilyTree Page ──────────────────────────────────── */
export default function FamilyTree() {
  const navigate = useNavigate();
  const { hasPermission } = useFamilyTree();
  const [searchParams] = useSearchParams();
  const svgRef = useRef(null);

  const [treeData, setTreeData] = useState({ members: [], relationships: [] });
  const [layout, setLayout] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [kinship, setKinship] = useState(null);
  const [kinshipFrom, setKinshipFrom] = useState('');
  const [kinshipTo, setKinshipTo] = useState('');
  const [kinshipLoading, setKinshipLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -100, w: 1200, h: 700 });
  const [treeZoom, setTreeZoom] = useState(1);
  const [treePan, setTreePan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // ─── Bộ lọc hiển thị cây ───────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minimalView: false,     // chỉ hiện tên, ẩn avatar/năm sinh mất
    maxGeneration: null,    // null = hiện tất cả các đời; số = chỉ hiện đời 1..N
    hideInLaw: false,       // ẩn thành viên dâu/rể
    hideMale: false,        // ẩn nam
    hideFemale: false,      // ẩn nữ
  });
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const buildLayout = useCallback((data, activeFilters) => {
    const filtered = filterTreeData(data.members, data.relationships, activeFilters);
    return computeTreeLayout(filtered.members, filtered.relationships, { minimal: activeFilters.minimalView });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await memberService.getTreeData();
      const normalizedData = {
        members: Array.isArray(data?.members) ? data.members.filter(Boolean) : [],
        relationships: Array.isArray(data?.relationships) ? data.relationships.filter(Boolean) : []
      };
      setTreeData(normalizedData);
      const computed = buildLayout(normalizedData, filtersRef.current);
      setLayout(computed);

      // Auto-fit viewBox
      if (computed.nodes.length > 0) {
        const xs = computed.nodes.map(n => n.x);
        const ys = computed.nodes.map(n => n.y);
        const minX = Math.min(...xs) - 80;
        const minY = Math.min(...ys) - 80;
        const maxX = Math.max(...xs) + NODE_WIDTH + 80;
        const maxY = Math.max(...ys) + NODE_HEIGHT + 80;
        setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
        setTreeZoom(1);
        setTreePan({ x: 0, y: 0 });
      }
      return computed;
    } catch (e) {
      setError('Không thể tải dữ liệu cây gia phả. ' + (e.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  }, [buildLayout]);

  useEffect(() => { loadData(); }, [loadData]);

  // Khi đổi bộ lọc, bố cục lại cây từ dữ liệu đã có sẵn (không cần gọi lại API).
  useEffect(() => {
    setLayout(buildLayout(treeData, filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Tự căn khung nhìn (viewBox) mỗi khi bố cục cây thay đổi (tải mới hoặc đổi bộ lọc).
  useEffect(() => {
    if (layout.nodes.length === 0) return;
    const rights = layout.nodes.map(n => n.x + (n.isCoupleLead ? n.coupleWidth : (n.width || NODE_WIDTH)));
    const minX = Math.min(...layout.nodes.map(n => n.x)) - 80;
    const minY = Math.min(...layout.nodes.map(n => n.y)) - 80;
    const maxX = Math.max(...rights) + 80;
    const maxY = Math.max(...layout.nodes.map(n => n.y + (n.height || NODE_HEIGHT))) + 80;
    setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
    setTreeZoom(1);
    setTreePan({ x: 0, y: 0 });
  }, [layout.nodes]);

  useEffect(() => {
    if (searchParams.get('action') === 'create' && !loading) {
      setEditingMember(null);
      setModalOpen(true);
    }
  }, [loading, searchParams]);

  const handleSave = async (data) => {
    const { avatarFile, ...memberData } = data;
    let memberId;
    if (editingMember) {
      memberId = editingMember.id;
      await memberService.updateMember(memberId, memberData);
      showToast('Cập nhật thành viên thành công!');
    } else {
      const result = await memberService.createMember(memberData);
      memberId = result.id;
      showToast('Thêm thành viên thành công!');
    }
    if (avatarFile && memberId) {
      await memberService.uploadAvatar(memberId, avatarFile);
    }
    await loadData();
  };

  const handleDelete = async (memberId) => {
    if (!confirm('Xóa thành viên này? Hành động không thể khôi phục.')) return;
    try {
      await memberService.deleteMember(memberId);
      setSelectedNode(null);
      showToast('Đã xóa thành viên.', 'info');
      await loadData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Không thể xóa thành viên.', 'error');
    }
  };

  const handleCheckKinship = async () => {
    if (!kinshipFrom || !kinshipTo) return;
    setKinshipLoading(true);
    setKinship(null);
    try {
      const result = await memberService.getKinship(kinshipFrom, kinshipTo);
      setKinship(result);
    } catch (e) {
      showToast('Không thể tính danh xưng.', 'error');
    } finally {
      setKinshipLoading(false);
    }
  };

  const changeTreeZoom = (amount) => {
    setTreeZoom(value => Math.min(2.5, Math.max(0.55, Number((value + amount).toFixed(2)))));
  };

  const handleTreeWheel = (event) => {
    event.preventDefault();
    changeTreeZoom(event.deltaY < 0 ? 0.1 : -0.1);
  };

  const handleTreeMouseDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = { clientX: event.clientX, clientY: event.clientY };
  };

  const handleTreeMouseMove = (event) => {
    if (!dragRef.current) return;
    const scaleX = viewBox.w / event.currentTarget.clientWidth / treeZoom;
    const scaleY = viewBox.h / event.currentTarget.clientHeight / treeZoom;
    setTreePan(pan => ({
      x: pan.x - (event.clientX - dragRef.current.clientX) * scaleX,
      y: pan.y - (event.clientY - dragRef.current.clientY) * scaleY
    }));
    dragRef.current = { clientX: event.clientX, clientY: event.clientY };
  };

  const resetTreeView = () => {
    setTreeZoom(1);
    setTreePan({ x: 0, y: 0 });
  };

  const exportTreePng = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width * 2; canvas.height = image.height * 2;
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a'); link.download = 'cay-gia-pha.png'; link.href = canvas.toDataURL('image/png'); link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const exportTreePdf = () => {
    if (!svgRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Cây gia phả</title></head><body>${svgRef.current.outerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.print();
  };

  const filteredNodes = layout.nodes.filter(n =>
    !searchTerm || n.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredIds = new Set(filteredNodes.map(n => n.id));
  const nodeById = new Map(layout.nodes.map(node => [String(node.id), node]));
  const selectNodeById = (id) => setSelectedNode(nodeById.get(String(id)) || nodeById.get(id) || null);

  const selectedRelations = treeData.relationships.filter(relation => relation.person_a === selectedNode?.id || relation.person_b === selectedNode?.id);
  const selectedParents = selectedRelations.filter(relation => relation.type === 'biological_child' || relation.type === 'adopted_child').filter(relation => relation.person_b === selectedNode?.id);
  const selectedChildren = selectedRelations.filter(relation => relation.type === 'biological_child' || relation.type === 'adopted_child').filter(relation => relation.person_a === selectedNode?.id);
  const selectedSpouses = selectedRelations.filter(relation => relation.type === 'marriage');

  const edgeColor = (type) => type === 'marriage' ? '#f59e0b' : 'var(--color-border)';

  const maxGenAvailable = Math.max(1, ...treeData.members.map(m => Number(m.generation ?? 1)), 1);
  const activeFilterCount = (filters.minimalView ? 1 : 0) + (filters.hideInLaw ? 1 : 0) + (filters.hideMale ? 1 : 0)
    + (filters.hideFemale ? 1 : 0) + (filters.maxGeneration != null && filters.maxGeneration < maxGenAvailable ? 1 : 0);
  const resetFilters = () => setFilters({ minimalView: false, maxGeneration: null, hideInLaw: false, hideMale: false, hideFemale: false });

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <Navbar />
      <div className="content-header-row family-tree-titlebar" style={{ alignItems: 'center', marginLeft: 72, marginRight: 16 }}>
        <div className="content-header-actions">
          <strong style={{ fontSize: '1.05rem' }}>{currentTreeName}</strong>
          <button className="btn btn-secondary btn-sm" onClick={() => setLeftPanelOpen(true)} title="Danh sách thành viên"><IconList /> Danh sách</button>
        </div>
        <div className="content-header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} aria-label="Điều chỉnh kích thước cây">
            <button className="btn btn-secondary btn-sm" title="Thu nhỏ cây" onClick={() => changeTreeZoom(-0.1)}><IconMinus /></button>
            <button className="btn btn-ghost btn-sm" title="Đặt lại 100%" onClick={() => { setTreeZoom(1); setTreePan({ x: 0, y: 0 }); }} style={{ minWidth: 52 }}>{Math.round(treeZoom * 100)}%</button>
            <button className="btn btn-secondary btn-sm" title="Phóng to cây" onClick={() => changeTreeZoom(0.1)}><IconPlus /></button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingMember(null); setModalOpen(true); }}><IconPlus /> Thêm</button>

          {/* Bộ lọc hiển thị */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setFilterOpen(v => !v)}>
              <IconFilter /> Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            {filterOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 40, width: 288, padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 10px 28px rgba(0,0,0,.2)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.minimalView} onChange={e => setFilters(f => ({ ...f, minimalView: e.target.checked }))} />
                  Hiển thị dạng tối giản (chỉ hiện tên)
                </label>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Số thế hệ hiển thị: Đời 1 – {filters.maxGeneration ?? maxGenAvailable}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      disabled={(filters.maxGeneration ?? maxGenAvailable) <= 1}
                      onClick={() => setFilters(f => {
                        const current = f.maxGeneration ?? maxGenAvailable;
                        const next = Math.max(1, current - 1);
                        return { ...f, maxGeneration: next };
                      })}
                    >
                      <IconMinus />
                    </button>
                    <input
                      type="number" min={1} max={maxGenAvailable} step={1}
                      value={filters.maxGeneration ?? maxGenAvailable}
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '') return;
                        const value = Math.min(maxGenAvailable, Math.max(1, Number(raw)));
                        setFilters(f => ({ ...f, maxGeneration: value >= maxGenAvailable ? null : value }));
                      }}
                      className="input"
                      style={{ width: 56, textAlign: 'center', padding: '4px 6px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px' }}
                      disabled={(filters.maxGeneration ?? maxGenAvailable) >= maxGenAvailable}
                      onClick={() => setFilters(f => {
                        const current = f.maxGeneration ?? maxGenAvailable;
                        const next = Math.min(maxGenAvailable, current + 1);
                        return { ...f, maxGeneration: next >= maxGenAvailable ? null : next };
                      })}
                    >
                      <IconPlus />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ {maxGenAvailable}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Lọc dữ liệu</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.hideInLaw} onChange={e => setFilters(f => ({ ...f, hideInLaw: e.target.checked }))} />
                  Ẩn thành viên dâu/rể
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.hideMale} onChange={e => setFilters(f => ({ ...f, hideMale: e.target.checked }))} />
                  Ẩn nam
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.hideFemale} onChange={e => setFilters(f => ({ ...f, hideFemale: e.target.checked }))} />
                  Ẩn nữ
                </label>

                <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={resetFilters} disabled={activeFilterCount === 0}>
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button className="btn btn-secondary btn-sm" disabled={!hasPermission('tree_view.export')} onClick={() => setExportOpen(value => !value)}>Xuất ▾</button>
            {exportOpen && <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 40, minWidth: 130, padding: 4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 10px 28px rgba(0,0,0,.2)' }}>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { setExportOpen(false); exportTreePng(); }}>Xuất PNG</button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { setExportOpen(false); exportTreePdf(); }}>Xuất PDF</button>
            </div>}
          </div>
          <div style={{ display: 'inline-flex', padding: 3, gap: 2, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }} role="tablist" aria-label="Chuyển chế độ xem">
            <button className="btn btn-sm" style={{ background: 'var(--color-primary)', color: '#fff', border: 0 }} aria-selected="true">Cây</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/members')}>Danh sách</button>
          </div>
        </div>
      </div>

      <div className="family-tree-workspace" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Controls */}
        <div className="family-tree-sidebar" style={{ width: leftPanelOpen ? 280 : 0, opacity: leftPanelOpen ? 1 : 0, background: 'var(--color-surface)', borderRight: leftPanelOpen ? '1px solid var(--color-border)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 220ms ease, opacity 160ms ease' }}>
          {/* Search */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}><IconSearch /></div>
              <input
                style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Tìm tên thành viên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Member list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 6px 8px' }}>
              Danh sách ({filteredNodes.length})
            </div>
            {filteredNodes.map(n => {
              const colors = GENDER_COLORS[n.gender] || GENDER_COLORS.other;
              return (
                <div key={n.id}
                  onClick={() => setSelectedNode(n)}
                  style={{
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3,
                    background: selectedNode?.id === n.id ? colors.bg : 'transparent',
                    border: `1px solid ${selectedNode?.id === n.id ? colors.border : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.bg, border: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors.text, flexShrink: 0 }}>
                    {n.full_name?.split(' ').slice(-1)[0]?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Đời {n.generation || 1} · {n.gender === 'male' ? 'Nam' : n.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kinship checker */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Tra danh xưng</div>
            <select style={{ width: '100%', height: 34, padding: '0 8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: '0.83rem', marginBottom: 6, color: 'var(--color-text-primary)' }}
              value={kinshipFrom} onChange={e => setKinshipFrom(e.target.value)}>
              <option value="">-- Người A --</option>
              {treeData.members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <select style={{ width: '100%', height: 34, padding: '0 8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: '0.83rem', marginBottom: 8, color: 'var(--color-text-primary)' }}
              value={kinshipTo} onChange={e => setKinshipTo(e.target.value)}>
              <option value="">-- Người B --</option>
              {treeData.members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleCheckKinship} disabled={!kinshipFrom || !kinshipTo || kinshipLoading}>
              {kinshipLoading ? 'Đang tính...' : 'Xác định danh xưng'}
            </button>
            {kinship && (
              <div style={{ marginTop: 10, background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 12px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{kinship.description}</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>A gọi B: <strong>{kinship.aCallsB}</strong></div>
                <div style={{ color: 'var(--color-text-secondary)' }}>B gọi A: <strong>{kinship.bCallsA}</strong></div>
                {kinship.pathLabels?.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                    {kinship.pathLabels.map((label, index) => <div key={`${label}-${index}`}>{label}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="family-tree-toggle btn btn-secondary btn-sm" title={leftPanelOpen ? 'Thu gọn bảng điều khiển' : 'Mở bảng điều khiển'} onClick={() => setLeftPanelOpen(value => !value)} style={{ position: 'absolute', left: leftPanelOpen ? 262 : 8, top: 12, zIndex: 4, transition: 'left 220ms ease' }}>
          {leftPanelOpen ? '‹' : '›'}
        </button>

        {/* Center: SVG Tree */}
        <div className="family-tree-canvas" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, display: 'flex', gap: 4, padding: 4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <button className="btn btn-secondary btn-sm" disabled={!hasPermission('tree_view.export')} onClick={exportTreePng}>PNG</button>
            <button className="btn btn-secondary btn-sm" disabled={!hasPermission('tree_view.export')} onClick={exportTreePdf}>PDF</button>
            <button className="btn btn-secondary btn-sm" title="Thu nhỏ cây" onClick={() => changeTreeZoom(-0.1)}><IconMinus /></button>
            <button className="btn btn-secondary btn-sm" title="Đặt lại khung nhìn" onClick={resetTreeView}>{Math.round(treeZoom * 100)}%</button>
            <button className="btn btn-secondary btn-sm" title="Phóng to cây" onClick={() => changeTreeZoom(0.1)}><IconPlus /></button>
          </div>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '2rem' }}>🌳</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Đang tải cây gia phả...</div>
            </div>
          )}

          {!loading && layout.nodes.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '4rem' }}>🌿</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                  {treeData.members.length > 0 ? 'Không có thành viên nào khớp bộ lọc' : 'Chưa có thành viên nào'}
                </div>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                  {treeData.members.length > 0 ? 'Hãy thử nới bớt bộ lọc đang áp dụng.' : 'Hãy thêm thành viên đầu tiên để xây dựng cây gia phả.'}
                </div>
                {treeData.members.length > 0 ? (
                  <button className="btn btn-secondary" onClick={resetFilters}><IconFilter /> Đặt lại bộ lọc</button>
                ) : (
                  <button className="btn btn-primary" onClick={() => { setEditingMember(null); setModalOpen(true); }}>
                    <IconPlus /> Thêm thành viên đầu tiên
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && layout.nodes.length > 0 && (
            <svg
              ref={svgRef}
              width="100%" height="100%"
              viewBox={`${viewBox.x + treePan.x + viewBox.w * (1 - 1 / treeZoom) / 2} ${viewBox.y + treePan.y + viewBox.h * (1 - 1 / treeZoom) / 2} ${viewBox.w / treeZoom} ${viewBox.h / treeZoom}`}
              style={{ background: 'var(--color-bg)', cursor: dragRef.current ? 'grabbing' : 'grab' }}
              onWheel={handleTreeWheel}
              onMouseDown={handleTreeMouseDown}
              onMouseMove={handleTreeMouseMove}
              onMouseUp={() => { dragRef.current = null; }}
              onMouseLeave={() => { dragRef.current = null; }}
            >
              {/* Grid pattern + hover styles cho thẻ thành viên */}
              <defs>
                <style>{`
                  .gp-card-half { cursor: pointer; transition: transform 200ms ease; }
                  .gp-card-half:hover { transform: translateY(-6px); }
                  .gp-card-half:hover .gp-card-rect { filter: drop-shadow(0 8px 14px rgba(0,0,0,0.22)); }
                  .gp-card-rect { transition: filter 200ms ease, stroke 200ms ease; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)); }
                  .gp-card-rect.gp-card-rect--half { filter: none; }
                  .gp-card-half:hover .gp-card-rect--half { filter: drop-shadow(0 8px 14px rgba(0,0,0,0.22)); }
                `}</style>
                <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--color-border)" strokeWidth={0.5} opacity={0.4} />
                </pattern>
              </defs>
              <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#grid)" />

              {/* Edges */}
              <g>
                {layout.edges.map(edge => {
                  const opacity = (!searchTerm || (filteredIds.has(edge.fromId) && filteredIds.has(edge.toId))) ? 1 : 0.1;
                  return (
                    <path key={edge.id}
                      d={edge.type === 'marriage'
                        ? `M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`
                        : `M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`
                      }
                      fill="none"
                      stroke={edgeColor(edge.type)}
                      strokeWidth={edge.type === 'marriage' ? 2.5 : 1.5}
                      strokeDasharray={edge.type === 'marriage' ? '6 4' : 'none'}
                      opacity={opacity}
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g>
                {layout.nodes.filter(node => !node.mergedIntoPartner).map(node => {
                  const relevantIds = node.partnerId ? [node.id, node.partnerId] : [node.id];
                  const opacity = (!searchTerm || relevantIds.some(id => filteredIds.has(id))) ? 1 : 0.15;
                  return (
                    <g key={node.id} opacity={opacity}>
                      <NodeCard
                        member={node}
                        selectedId={selectedNode?.id}
                        onSelectId={selectNodeById}
                        minimal={filters.minimalView}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          )}
        </div>

        {/* Right: Detail Panel — render qua portal để không bị các container overflow/transform của layout che khuất */}
        {selectedNode && createPortal(
          <div role="dialog" aria-modal="true" aria-label={`Thông tin ${selectedNode.full_name}`} onClick={event => event.target === event.currentTarget && setSelectedNode(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'familyPanelIn 220ms ease-out' }}>
            <div style={{ width: 'min(560px, 100%)', maxHeight: 'min(760px, 92vh)', background: 'var(--color-surface)', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Chi tiết</span>
                  <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {/* Avatar */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, margin: '0 auto 8px',
                  background: (GENDER_COLORS[selectedNode.gender] || GENDER_COLORS.other).bg,
                  border: `2px solid ${(GENDER_COLORS[selectedNode.gender] || GENDER_COLORS.other).border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                  color: (GENDER_COLORS[selectedNode.gender] || GENDER_COLORS.other).text
                }}>
                  {selectedNode.avatar_url ? (
                    <img src={selectedNode.avatar_url.startsWith('http') ? selectedNode.avatar_url : `${API_ORIGIN}${selectedNode.avatar_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                  ) : selectedNode.full_name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{selectedNode.full_name}</div>
                {!selectedNode.isAlive && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>† Đã mất</div>}
              </div>

              {[
                ['Giới tính', selectedNode.gender === 'male' ? 'Nam' : selectedNode.gender === 'female' ? 'Nữ' : 'Khác'],
                ['Đời thứ', `Đời ${selectedNode.generation}`],
                ['Năm sinh', selectedNode.birth_year || 'Không rõ'],
                ['Năm mất', !selectedNode.isAlive ? (selectedNode.death_year || 'Không rõ') : null],
                ['Tên húy', selectedNode.taboo_name || null],
                ['Tên tự / tên khác', selectedNode.courtesy_name || null],
                ['Tên khác', selectedNode.other_names || null],
                ['Thứ tự sinh', selectedNode.birth_order ? `Con thứ ${selectedNode.birth_order}` : null],
                ['Ngày sinh', [selectedNode.birth_day, selectedNode.birth_month, selectedNode.birth_year].filter(Boolean).join('/') || null],
                ['Ngày sinh âm lịch', selectedNode.birth_date_lunar || null],
                ['Ngày mất', !selectedNode.isAlive && [selectedNode.death_day, selectedNode.death_month, selectedNode.death_year].filter(Boolean).join('/') || null],
                ['Ngày mất âm lịch', !selectedNode.isAlive ? (selectedNode.death_date_lunar || null) : null],
                ['Nghề nghiệp', selectedNode.occupation || null],
                ['Nơi ở', selectedNode.current_residence || null],
              ].filter(([, v]) => v != null).map(([label, value]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}

              {selectedNode.biography && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Tiểu sử</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{selectedNode.biography}</div>
                </div>
              )}

              {selectedNode.spouses?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Vợ/Chồng</div>
                  {selectedNode.spouses.map(s => (
                    <div key={s.id} style={{ fontSize: '0.825rem', color: 'var(--color-text-primary)', padding: '3px 0' }}>{s.full_name}</div>
                  ))}
                </div>
              )}

              {selectedNode.children?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Con cái ({selectedNode.children.length})</div>
                  {selectedNode.children.map(c => (
                    <div key={c.id} style={{ fontSize: '0.825rem', color: 'var(--color-text-primary)', padding: '3px 0' }}>{c.full_name}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                onClick={() => { setEditingMember(selectedNode); setModalOpen(true); }}>
                Sửa
              </button>
              <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={() => handleDelete(selectedNode.id)}>
                Xóa
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      <MemberFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        members={treeData.members}
        editingMember={editingMember}
      />
    </div>
  );
}