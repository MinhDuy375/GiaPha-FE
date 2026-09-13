import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import memberService from '../services/memberService';
import Navbar from '../components/Navbar';
import { computeTreeLayout, filterTreeData, GENDER_COLORS, NODE_WIDTH, NODE_HEIGHT, AVATAR_RADIUS, RING_GAP } from '../utils/treeLayout';
import { API_ORIGIN } from '../services/api';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import membershipService from '../services/membershipService';
import relationshipService from '../services/relationshipService';

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconMinus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconTree = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v8M12 10L8 6M12 10l4-4M12 22V10M12 14l-5 3M12 17l5 3" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
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

  useEffect(() => {
    if (!open || editingMember) return;
    const parentIds = [form.fatherId, form.motherId].filter(Boolean);
    const parents = members.filter(member => parentIds.includes(String(member.id)));
    const spouse = members.find(member => String(member.id) === String(form.spouseId));
    const parentGeneration = parents.length > 0
      ? Math.max(...parents.map(member => Number(member.generation ?? member.generationLevel ?? 1))) + 1
      : null;
    const relatedGeneration = spouse
      ? Number(spouse.generation ?? spouse.generationLevel ?? 1)
      : null;
    const inferredGeneration = parentGeneration ?? relatedGeneration;
    if (inferredGeneration && inferredGeneration !== Number(form.generationLevel)) {
      setForm(current => ({ ...current, generationLevel: inferredGeneration }));
    }
  }, [open, editingMember, form.fatherId, form.motherId, form.spouseId, members]);

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
  };

  const inputStyle = {
    width: '100%', height: 42, padding: '0 12px', fontSize: '0.875rem',
    background: '#FFFFFF', border: '1.5px solid #E7DED4',
    borderRadius: 10, color: '#2B211B', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(43, 33, 27, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(43,33,27,0.15)', border: '1px solid #E7DED4' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7DED4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2B211B' }}>{editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756A61', fontSize: '1.3rem' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

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
                <input style={inputStyle} type="number" min={1} max={30} value={form.birthLunarDay} onChange={e => update('birthLunarDay', e.target.value)} placeholder="Ngày" />
                <input style={inputStyle} type="number" min={1} max={12} value={form.birthLunarMonth} onChange={e => update('birthLunarMonth', e.target.value)} placeholder="Tháng" />
                <input style={inputStyle} type="number" min={1} max={2100} value={form.birthLunarYear} onChange={e => update('birthLunarYear', e.target.value)} placeholder="Năm" />
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
                <input style={inputStyle} type="number" min={1} max={30} value={form.deathLunarDay} onChange={e => update('deathLunarDay', e.target.value)} placeholder="Ngày" />
                <input style={inputStyle} type="number" min={1} max={12} value={form.deathLunarMonth} onChange={e => update('deathLunarMonth', e.target.value)} placeholder="Tháng" />
                <input style={inputStyle} type="number" min={1} max={2100} value={form.deathLunarYear} onChange={e => update('deathLunarYear', e.target.value)} placeholder="Năm" />
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
              <label htmlFor="is-alive" style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#2B211B' }}>Còn sống</label>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="is-in-law" checked={form.isInLaw} onChange={e => update('isInLaw', e.target.checked)} />
            <label htmlFor="is-in-law" style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#2B211B' }}>Thành viên dâu/rể</label>
          </div>

          {!editingMember && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Cha</label>
                <select style={inputStyle} value={form.fatherId} onChange={e => update('fatherId', e.target.value)}>
                  <option value="">-- Chọn cha --</option>
                  {members.filter(m => m.gender !== 'female' && m.gender !== 1 && m.gender !== '1').map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mẹ</label>
                <select style={inputStyle} value={form.motherId} onChange={e => update('motherId', e.target.value)}>
                  <option value="">-- Chọn mẹ --</option>
                  {members.filter(m => m.gender === 'female' || m.gender === 1 || m.gender === '1').map(m => (
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

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E7DED4' }}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Thông tin liên hệ và nghề nghiệp</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input style={inputStyle} type="tel" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} placeholder="Số điện thoại" />
              <input style={inputStyle} value={form.occupation} onChange={e => update('occupation', e.target.value)} placeholder="Nghề nghiệp" />
              <input style={{ ...inputStyle, gridColumn: '1 / -1' }} value={form.currentResidence} onChange={e => update('currentResidence', e.target.value)} placeholder="Nơi ở hiện tại" />
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #E7DED4', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="ft-btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="ft-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editingMember ? 'Cập nhật' : 'Thêm thành viên'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tree Node Card ────────────────────────────────────────── */

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
            fontSize: 13, fontWeight: 700, color: '#2B211B', textAlign: 'center', lineHeight: 1.25,
            overflow: 'hidden', whiteSpace: 'normal', wordBreak: 'break-word'
          }}>
            {person.full_name}
          </div>
        </foreignObject>
        {!person.isAlive && <text x={x + width - 12} y={y + 15} fontSize={11} fill="#756A61">†</text>}
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
          fontSize: 13, fontWeight: 700, color: '#2B211B', textAlign: 'center',
          lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {person.full_name}
        </div>
      </foreignObject>
      {yearStr && (
        <text x={cx} y={y + cardH - 10} textAnchor="middle" fontSize={11} fill="#756A61">
          {yearStr}
        </text>
      )}
      {!person.isAlive && <text x={x + width - 14} y={y + 18} fontSize={14} fill="#756A61">†</text>}
    </>
  );
}

function NodeCard({ member, selectedId, onSelectId, minimal }) {
  if (member.mergedIntoPartner) return null;

  const colors = GENDER_COLORS[member.gender] || GENDER_COLORS.other;
  const isCouple = member.isCoupleLead && !!member.partnerData;
  const cardHeight = member.height || NODE_HEIGHT;
  const leftWidth = member.width || NODE_WIDTH;
  const coupleGap = 14;
  const rightWidth = isCouple ? (member.coupleWidth - leftWidth - RING_GAP + coupleGap) : 0;
  const width = isCouple ? member.coupleWidth : leftWidth;
  const partnerColors = isCouple ? (GENDER_COLORS[member.partnerData.gender] || GENDER_COLORS.other) : null;
  const isSelected = selectedId === member.id || (isCouple && selectedId === member.partnerData.id);
  const centerX = member.x + leftWidth;

  return (
    <g className="gp-card">
      {!isCouple ? (
        <g className="gp-card-half">
          <rect
            className="gp-card-rect"
            x={member.x} y={member.y}
            width={width} height={cardHeight}
            rx={16}
            fill="#FFFFFF"
            stroke={isSelected ? colors.border : (member.isAlive ? colors.border : '#E7DED4')}
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
          <rect
            x={member.x - 6} y={member.y - 6}
            width={width + 12} height={cardHeight + 12}
            rx={20}
            fill="#FFFFFF"
            stroke="#E7DED4"
            strokeWidth={1}
            opacity={0.6}
          />
          <g className="gp-card-half">
            <rect
              className="gp-card-rect gp-card-rect--half"
              x={member.x} y={member.y}
              width={leftWidth} height={cardHeight}
              rx={16}
              fill="#FFFFFF"
              stroke={colors.border}
              strokeWidth={selectedId === member.id ? 2.5 : 1.5}
              style={selectedId === member.id ? { filter: `drop-shadow(0 0 8px ${colors.border}90)` } : undefined}
              opacity={member.isAlive ? 1 : 0.75}
            />
            <g onClick={e => { e.stopPropagation(); onSelectId(member.id); }} style={{ cursor: 'pointer' }}>
              <PersonHalf person={member} x={member.x} y={member.y} width={leftWidth} height={cardHeight} colors={colors} minimal={minimal} />
            </g>
          </g>

          <g className="gp-card-half">
            <rect
              className="gp-card-rect gp-card-rect--half"
              x={centerX + coupleGap} y={member.y}
              width={rightWidth} height={cardHeight}
              rx={16}
              fill="#FFFFFF"
              stroke={partnerColors.border}
              strokeWidth={selectedId === member.partnerData.id ? 2.5 : 1.5}
              style={selectedId === member.partnerData.id ? { filter: `drop-shadow(0 0 8px ${partnerColors.border}90)` } : undefined}
              opacity={member.partnerData.isAlive ? 1 : 0.75}
            />
            <g onClick={e => { e.stopPropagation(); onSelectId(member.partnerData.id); }} style={{ cursor: 'pointer' }}>
              <PersonHalf person={member.partnerData} x={centerX + coupleGap} y={member.y} width={rightWidth} height={cardHeight} colors={partnerColors} minimal={minimal} />
            </g>
          </g>

          <circle cx={centerX + coupleGap / 2} cy={member.y + cardHeight / 2} r={13} fill="#FFFFFF" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={centerX + coupleGap / 2} y={member.y + cardHeight / 2 + 5} textAnchor="middle" fontSize={14} aria-label="Vợ chồng">💍</text>
        </>
      )}
    </g>
  );
}

function PersonAvatar({ person, size = 40 }) {
  const colors = GENDER_COLORS[person?.gender] || GENDER_COLORS.other;
  const initials = person?.full_name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: colors.bg, border: `2px solid ${colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: colors.text, overflow: 'hidden'
    }}>
      {person?.avatar_url ? (
        <img src={person.avatar_url.startsWith('http') ? person.avatar_url : `${API_ORIGIN}${person.avatar_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initials}
    </div>
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
  const [relationForm, setRelationForm] = useState({ type: 'parent', targetId: '' });
  const [relationSaving, setRelationSaving] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const returnToDetailIdRef = useRef(null);
  const [kinship, setKinship] = useState(null);
  const [kinshipFrom, setKinshipFrom] = useState('');
  const [kinshipTo, setKinshipTo] = useState('');
  const [kinshipLoading, setKinshipLoading] = useState(false);
  const kinshipRequestRef = useRef(0);
  const [toast, setToast] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -100, w: 1200, h: 700 });
  const [treeZoom, setTreeZoom] = useState(1);
  const [treePan, setTreePan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minimalView: false,
    maxGeneration: null,
    hideInLaw: false,
    hideMale: false,
    hideFemale: false,
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
      return computed;
    } catch (e) {
      setError('Không thể tải dữ liệu cây gia phả. ' + (e.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  }, [buildLayout]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setLayout(buildLayout(treeData, filters));
  }, [filters]);

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
      returnToDetailIdRef.current = null;
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
    const computed = await loadData();
    if (returnToDetailIdRef.current != null) {
      const reopenId = returnToDetailIdRef.current;
      setSelectedNode(computed?.nodes.find(node => node.id === reopenId) || null);
      returnToDetailIdRef.current = null;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (returnToDetailIdRef.current != null) {
      const reopenId = returnToDetailIdRef.current;
      returnToDetailIdRef.current = null;
      setSelectedNode(nodeById.get(String(reopenId)) || nodeById.get(reopenId) || null);
    }
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

  const handleRelationSave = async () => {
    if (!selectedNode || !relationForm.targetId || !hasPermission('relationship.manage')) return;
    setRelationSaving(true);
    try {
      const type = relationForm.type === 'spouse' ? 'spouse' : relationForm.type === 'adopted_child' ? 'adopted_child' : 'parent_child';
      const personAId = relationForm.type === 'parent' || relationForm.type === 'adopted_child' ? relationForm.targetId : selectedNode.id;
      const personBId = relationForm.type === 'parent' || relationForm.type === 'adopted_child' ? selectedNode.id : relationForm.targetId;
      await relationshipService.createRelationship({ type, personAId, personBId, order: 1 });
      const computed = await loadData();
      setSelectedNode(computed?.nodes.find(node => node.id === selectedNode.id) || null);
      setRelationForm({ type: 'parent', targetId: '' });
    } catch (e) {
      showToast(e.response?.data?.message || 'Không thể thêm quan hệ.', 'error');
    } finally { setRelationSaving(false); }
  };

  const handleRelationDelete = async relation => {
    if (!hasPermission('relationship.manage') || !relation?.id || !window.confirm('Xóa quan hệ này?')) return;
    setRelationSaving(true);
    try {
      await relationshipService.deleteRelationship(relation.type === 'marriage' ? 'spouse' : 'parent', relation.id);
      const computed = await loadData();
      setSelectedNode(computed?.nodes.find(node => node.id === selectedNode.id) || null);
    } catch (e) { showToast(e.response?.data?.message || 'Không thể xóa quan hệ.', 'error'); }
    finally { setRelationSaving(false); }
  };

  const handleCheckKinship = async () => {
    if (!kinshipFrom || !kinshipTo) return;
    const requestId = ++kinshipRequestRef.current;
    const fromId = kinshipFrom;
    const toId = kinshipTo;
    setKinshipLoading(true);
    setKinship(null);
    try {
      const result = await memberService.getKinship(fromId, toId);
      if (requestId === kinshipRequestRef.current) setKinship(result);
    } catch (e) {
      showToast('Không thể tính danh xưng.', 'error');
    } finally {
      setKinshipLoading(false);
    }
  };

  useEffect(() => {
    if (kinshipFrom && kinshipTo && kinshipFrom !== kinshipTo) handleCheckKinship();
    else setKinship(null);
  }, [kinshipFrom, kinshipTo]);

  const changeTreeZoom = (amount) => {
    setTreeZoom(value => Math.min(2.5, Math.max(0.55, Number((value + amount).toFixed(2)))));
  };

  const handleTreeMouseDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = { clientX: event.clientX, clientY: event.clientY };
  };

  const handleTreeMouseMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const scaleX = viewBox.w / event.currentTarget.clientWidth / treeZoom;
    const scaleY = viewBox.h / event.currentTarget.clientHeight / treeZoom;
    setTreePan(pan => ({
      x: pan.x - (event.clientX - drag.clientX) * scaleX,
      y: pan.y - (event.clientY - drag.clientY) * scaleY
    }));
    dragRef.current = { clientX: event.clientX, clientY: event.clientY };
  };

  const COLOR_ATTRS = ['fill', 'stroke', 'stop-color'];
  const inlineResolvedColors = (liveRoot, cloneRoot) => {
    const liveEls = liveRoot.querySelectorAll('*');
    const cloneEls = cloneRoot.querySelectorAll('*');
    const resolveNode = (liveEl, cloneEl) => {
      const computed = window.getComputedStyle(liveEl);
      for (const attr of COLOR_ATTRS) {
        const raw = liveEl.getAttribute(attr);
        if (raw && raw.includes('var(')) {
          const cssProp = attr === 'stop-color' ? 'stop-color' : attr;
          const resolved = computed.getPropertyValue(cssProp) || computed[attr];
          if (resolved) cloneEl.setAttribute(attr, resolved.trim());
        }
      }
      if (liveEl.style && liveEl.style.cssText && liveEl.style.cssText.includes('var(')) {
        const style = liveEl.style;
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          if (style.getPropertyValue(prop).includes('var(')) {
            const resolvedValue = computed.getPropertyValue(prop);
            if (resolvedValue) cloneEl.style.setProperty(prop, resolvedValue.trim());
          }
        }
      }
    };
    resolveNode(liveRoot, cloneRoot);
    liveEls.forEach((liveEl, index) => {
      const cloneEl = cloneEls[index];
      if (cloneEl) resolveNode(liveEl, cloneEl);
    });
  };

  const buildExportSvg = () => {
    if (!svgRef.current) return null;
    const clone = svgRef.current.cloneNode(true);
    inlineResolvedColors(svgRef.current, clone);
    const bg = '#FAF7F1';
    clone.style.background = bg;
    clone.setAttribute('style', (clone.getAttribute('style') || '') + `;background:${bg};`);
    return clone;
  };

  const exportTreePng = () => {
    const clone = buildExportSvg();
    if (!clone) return;
    const bbox = svgRef.current.getBBox ? svgRef.current.getBBox() : null;
    const width = clone.viewBox.baseVal?.width || bbox?.width || 1600;
    const height = clone.viewBox.baseVal?.height || bbox?.height || 900;
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    const svgString = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale; canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FAF7F1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a'); link.download = 'cay-gia-pha.png'; link.href = canvas.toDataURL('image/png'); link.click();
    };
    image.onerror = () => showToast('Không thể xuất PNG.', 'error');
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  const exportTreePdf = () => {
    const clone = buildExportSvg();
    if (!clone) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Cây gia phả</title><style>html,body{margin:0;background:#FAF7F1;}</style></head><body>${clone.outerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus();
    printWindow.onload = () => printWindow.print();
    setTimeout(() => printWindow.print(), 300);
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

  const computeDescendantStats = (node) => {
    if (!node) return null;
    const childIds = selectedChildren.map(relation => relation.person_b);
    const childNodes = childIds.map(id => nodeById.get(String(id))).filter(Boolean);
    const sonCount = childNodes.filter(child => child.gender === 'male').length;
    const daughterCount = childNodes.filter(child => child.gender === 'female').length;

    const inLawIds = new Set();
    let sonsInLaw = 0, daughtersInLaw = 0;
    for (const child of childNodes) {
      const spouseRelations = treeData.relationships.filter(relation => relation.type === 'marriage' && (relation.person_a === child.id || relation.person_b === child.id));
      for (const relation of spouseRelations) {
        const spouseId = relation.person_a === child.id ? relation.person_b : relation.person_a;
        if (inLawIds.has(spouseId)) continue;
        inLawIds.add(spouseId);
        if (child.gender === 'male') daughtersInLaw += 1;
        else if (child.gender === 'female') sonsInLaw += 1;
      }
    }

    let paternalGrandchildren = 0, maternalGrandchildren = 0;
    for (const child of childNodes) {
      const grandchildRelations = treeData.relationships.filter(relation => (relation.type === 'biological_child' || relation.type === 'adopted_child') && relation.person_a === child.id);
      const count = grandchildRelations.length;
      if (child.gender === 'male') paternalGrandchildren += count;
      else if (child.gender === 'female') maternalGrandchildren += count;
    }

    return {
      sonCount, daughterCount,
      totalChildren: childNodes.length,
      sonsInLaw, daughtersInLaw,
      paternalGrandchildren, maternalGrandchildren,
    };
  };
  const descendantStats = computeDescendantStats(selectedNode);

  const edgeColor = (type) => type === 'marriage' ? '#f59e0b' : '#E7DED4';

  const maxGenAvailable = Math.max(1, ...treeData.members.map(m => Number(m.generation ?? 1)), 1);
  const activeFilterCount = (filters.minimalView ? 1 : 0) + (filters.hideInLaw ? 1 : 0) + (filters.hideMale ? 1 : 0)
    + (filters.hideFemale ? 1 : 0) + (filters.maxGeneration != null && filters.maxGeneration < maxGenAvailable ? 1 : 0);
  const resetFilters = () => setFilters({ minimalView: false, maxGeneration: null, hideInLaw: false, hideMale: false, hideFemale: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', height: '100vh', background: '#FAF7F1', color: '#2B211B', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 12, background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(43,33,27,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <Navbar />

      {/* Styles Lạc Việt UI */}
      <style>{`
        /* Button Styles */
        .ft-btn-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 12px;
          color: #2B211B;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        .ft-btn-icon:hover {
          background: #FAF7F1;
          border-color: #B84D20;
          color: #B84D20;
        }
        .ft-btn-secondary {
          height: 42px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 12px;
          color: #2B211B;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ft-btn-secondary:hover {
          background: #FAF7F1;
          border-color: #B84D20;
          color: #B84D20;
        }
        .ft-btn-primary {
          height: 42px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          background: #B84D20;
          border: 1px solid #B84D20;
          border-radius: 12px;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(184, 77, 32, 0.25);
        }
        .ft-btn-primary:hover {
          background: #A9441C;
          border-color: #A9441C;
        }

        /* Container Toolbar Card */
        .ft-toolbar-wrapper {
          padding: 16px 20px 8px 20px;
          display: flex;
          justify-content: center;
          z-index: 10;
        }
        .ft-toolbar-card {
          width: 100%;
          max-width: 480px;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 20px;
          padding: 14px 16px;
          box-shadow: 0 4px 20px rgba(43, 33, 27, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
        }
        .ft-zoom-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FAF7F1;
          padding: 2px 4px;
          border-radius: 12px;
          border: 1px solid #E7DED4;
        }
        .ft-zoom-text {
          font-weight: 700;
          font-size: 0.88rem;
          color: #2B211B;
          min-width: 42px;
          text-align: center;
        }
        .ft-segmented-control {
          display: flex;
          background: #FAF7F1;
          padding: 3px;
          border-radius: 12px;
          border: 1px solid #E7DED4;
          gap: 4px;
        }
        .ft-segment-btn {
          flex: 1;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          border-radius: 9px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ft-segment-btn.active {
          background: #B84D20;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(184, 77, 32, 0.25);
        }
        .ft-segment-btn.inactive {
          background: transparent;
          color: #756A61;
        }
        .ft-segment-btn.inactive:hover {
          color: #2B211B;
        }

        .ft-filter-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 40;
          width: 280px;
          padding: 16px;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(43, 33, 27, 0.12);
        }
        .ft-export-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 40;
          min-width: 140px;
          padding: 6px;
          background: #FFFFFF;
          border: 1px solid #E7DED4;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(43, 33, 27, 0.12);
        }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
          .ft-toolbar-wrapper {
            padding: 12px 12px 4px 12px;
          }
          .ft-toolbar-card {
            border-radius: 18px;
            padding: 12px;
          }
        }
      `}</style>

      {/* ─── TOOLBAR CARD ─── */}
      <div className="ft-toolbar-wrapper">
        <div className="ft-toolbar-card">
          {/* Hàng 1: Nút Mở danh sách | Cụm [- 100% +] | Nút Filter */}
          <div className="ft-toolbar-row">
            <button className="ft-btn-icon" onClick={() => setLeftPanelOpen(v => !v)} title="Danh sách & tra danh xưng">
              <IconList />
            </button>

            <div className="ft-zoom-container">
              <button className="ft-btn-icon" style={{ height: 34, width: 34, minWidth: 34, minHeight: 34, border: 'none', background: '#FFFFFF' }} title="Thu nhỏ" onClick={() => changeTreeZoom(-0.1)}>
                <IconMinus />
              </button>
              <span className="ft-zoom-text">{Math.round(treeZoom * 100)}%</span>
              <button className="ft-btn-icon" style={{ height: 34, width: 34, minWidth: 34, minHeight: 34, border: 'none', background: '#FFFFFF' }} title="Phóng to" onClick={() => changeTreeZoom(0.1)}>
                <IconPlus />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button className="ft-btn-primary" style={{ height: 42, width: 42, padding: 0 }} onClick={() => setFilterOpen(v => !v)} title="Bộ lọc">
                <IconFilter />
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>

              {filterOpen && (
                <div className="ft-filter-panel">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 14, cursor: 'pointer', color: '#2B211B' }}>
                    <input type="checkbox" checked={filters.minimalView} onChange={e => setFilters(f => ({ ...f, minimalView: e.target.checked }))} />
                    Chế độ tối giản (chỉ hiện tên)
                  </label>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#756A61', marginBottom: 6 }}>
                      Số thế hệ: Đời 1 – {filters.maxGeneration ?? maxGenAvailable}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        className="ft-btn-icon"
                        style={{ height: 36, width: 36, minWidth: 36, minHeight: 36 }}
                        disabled={(filters.maxGeneration ?? maxGenAvailable) <= 1}
                        onClick={() => setFilters(f => ({ ...f, maxGeneration: Math.max(1, (f.maxGeneration ?? maxGenAvailable) - 1) }))}
                      >
                        <IconMinus />
                      </button>
                      <input
                        type="number" min={1} max={maxGenAvailable}
                        value={filters.maxGeneration ?? maxGenAvailable}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFilters(f => ({ ...f, maxGeneration: val >= maxGenAvailable ? null : val }));
                        }}
                        style={{ width: 50, textAlign: 'center', height: 36, border: '1px solid #E7DED4', borderRadius: 8, outline: 'none' }}
                      />
                      <button
                        type="button"
                        className="ft-btn-icon"
                        style={{ height: 36, width: 36, minWidth: 36, minHeight: 36 }}
                        disabled={(filters.maxGeneration ?? maxGenAvailable) >= maxGenAvailable}
                        onClick={() => setFilters(f => ({ ...f, maxGeneration: Math.min(maxGenAvailable, (f.maxGeneration ?? maxGenAvailable) + 1) }))}
                      >
                        <IconPlus />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#756A61', marginBottom: 8 }}>Tùy chọn ẩn</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 6, cursor: 'pointer', color: '#2B211B' }}>
                    <input type="checkbox" checked={filters.hideInLaw} onChange={e => setFilters(f => ({ ...f, hideInLaw: e.target.checked }))} />
                    Ẩn dâu/rể
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 6, cursor: 'pointer', color: '#2B211B' }}>
                    <input type="checkbox" checked={filters.hideMale} onChange={e => setFilters(f => ({ ...f, hideMale: e.target.checked }))} />
                    Ẩn Nam
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginBottom: 12, cursor: 'pointer', color: '#2B211B' }}>
                    <input type="checkbox" checked={filters.hideFemale} onChange={e => setFilters(f => ({ ...f, hideFemale: e.target.checked }))} />
                    Ẩn Nữ
                  </label>

                  <button className="ft-btn-secondary" style={{ width: '100%', height: 36 }} onClick={resetFilters} disabled={activeFilterCount === 0}>
                    Đặt lại bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hàng 2: Nút Xuất file (Trái) | Segmented Control Cây / Danh sách (Giữa) | Nút Thêm mới (Phải) */}
          <div className="ft-toolbar-row">
            <div style={{ position: 'relative' }}>
              <button className="ft-btn-icon" disabled={!hasPermission('tree_view.export')} onClick={() => setExportOpen(v => !v)} title="Xuất cây gia phả">
                <IconChevronDown />
              </button>
              {exportOpen && (
                <div className="ft-export-panel">
                  <button className="ft-btn-secondary" style={{ width: '100%', height: 36, border: 'none', justifyContent: 'flex-start' }} onClick={() => { setExportOpen(false); exportTreePng(); }}>Tải ảnh PNG</button>
                  <button className="ft-btn-secondary" style={{ width: '100%', height: 36, border: 'none', justifyContent: 'flex-start' }} onClick={() => { setExportOpen(false); exportTreePdf(); }}>Xuất PDF</button>
                </div>
              )}
            </div>

            <div className="ft-segmented-control" style={{ flex: 1 }}>
              <button className="ft-segment-btn active">
                <IconTree /> Cây
              </button>
              <button className="ft-segment-btn inactive" onClick={() => navigate('/members')}>
                <IconList /> Danh sách
              </button>
            </div>

            <button className="ft-btn-icon" onClick={() => { returnToDetailIdRef.current = null; setEditingMember(null); setModalOpen(true); }} title="Thêm thành viên">
              <IconPlus />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="family-tree-main-content" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Side Panel (Search & Kinship) */}
        <div style={{ position: 'absolute', zIndex: 20, top: 12, left: 20, bottom: 20, width: 310, opacity: leftPanelOpen ? 1 : 0, pointerEvents: leftPanelOpen ? 'auto' : 'none', background: '#FFFFFF', border: '1px solid #E7DED4', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 36px rgba(43,33,27,0.12)', transition: 'opacity 200ms ease, transform 200ms ease', transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-12px)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E7DED4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#2B211B' }}>Thành viên & Tra danh xưng</strong>
            <button onClick={() => setLeftPanelOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756A61', fontSize: '1.1rem' }}>✕</button>
          </div>
          
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #E7DED4' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#756A61' }}><IconSearch /></div>
              <input
                style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 10, background: '#FAF7F1', border: '1px solid #E7DED4', borderRadius: 10, fontSize: '0.875rem', color: '#2B211B', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Tìm tên thành viên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredNodes.map(n => {
              const colors = GENDER_COLORS[n.gender] || GENDER_COLORS.other;
              return (
                <div key={n.id}
                  onClick={() => setSelectedNode(n)}
                  style={{
                    padding: '8px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
                    background: selectedNode?.id === n.id ? '#FAF7F1' : 'transparent',
                    border: `1px solid ${selectedNode?.id === n.id ? '#B84D20' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: colors.bg, border: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors.text, flexShrink: 0 }}>
                    {n.full_name?.split(' ').slice(-1)[0]?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2B211B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#756A61' }}>Đời {n.generation || 1} · {n.gender === 'male' ? 'Nam' : n.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid #E7DED4', background: '#FAF7F1' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Tra danh xưng</div>
            <select style={{ width: '100%', height: 36, padding: '0 8px', background: '#FFFFFF', border: '1px solid #E7DED4', borderRadius: 8, fontSize: '0.83rem', marginBottom: 6, color: '#2B211B' }}
              value={kinshipFrom} onChange={e => setKinshipFrom(e.target.value)}>
              <option value="">-- Người A --</option>
              {treeData.members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <select style={{ width: '100%', height: 36, padding: '0 8px', background: '#FFFFFF', border: '1px solid #E7DED4', borderRadius: 8, fontSize: '0.83rem', marginBottom: 8, color: '#2B211B' }}
              value={kinshipTo} onChange={e => setKinshipTo(e.target.value)}>
              <option value="">-- Người B --</option>
              {treeData.members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            {kinship && (
              <div style={{ marginTop: 8, background: '#FFFFFF', border: '1px solid #E7DED4', borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#2B211B', marginBottom: 4 }}>{kinship.description}</div>
                <div style={{ color: '#756A61' }}>A gọi B: <strong style={{ color: '#B84D20' }}>{kinship.aCallsB}</strong></div>
                <div style={{ color: '#756A61' }}>B gọi A: <strong style={{ color: '#B84D20' }}>{kinship.bCallsA}</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Cây Gia Phả */}
        <div className="family-tree-canvas-region" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F1', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '2.5rem' }}>🌿</div>
              <div style={{ color: '#756A61', fontWeight: 500 }}>Đang tải cây gia phả...</div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && layout.nodes.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', textAlign: 'center', padding: '24px 16px', background: '#FAF7F1'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌿</div>
              
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2B211B', margin: '0 0 8px 0' }}>
                {treeData.members.length > 0 ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có thành viên nào'}
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#756A61', margin: '0 0 24px 0', maxWidth: 320, lineHeight: 1.5 }}>
                {treeData.members.length > 0
                  ? 'Hãy thử nới bớt bộ lọc đang áp dụng.'
                  : 'Hãy thêm thành viên đầu tiên để xây dựng cây gia phả.'}
              </p>

              {treeData.members.length > 0 ? (
                <button className="ft-btn-secondary" onClick={resetFilters}>
                  <IconFilter /> Đặt lại bộ lọc
                </button>
              ) : (
                <button className="ft-btn-primary" style={{ height: 48, borderRadius: 16, padding: '0 24px', fontSize: '0.95rem' }} onClick={() => { returnToDetailIdRef.current = null; setEditingMember(null); setModalOpen(true); }}>
                  <IconPlus /> Thêm thành viên đầu tiên
                </button>
              )}
            </div>
          )}

          {!loading && error && (
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 3, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {!loading && layout.nodes.length > 0 && (
            <svg
              ref={svgRef}
              width="100%" height="100%"
              style={{ minHeight: Math.max(700, viewBox.h), minWidth: Math.max(900, viewBox.w), background: '#FAF7F1', cursor: dragRef.current ? 'grabbing' : 'grab' }}
              viewBox={`${viewBox.x + treePan.x + viewBox.w * (1 - 1 / treeZoom) / 2} ${viewBox.y + treePan.y + viewBox.h * (1 - 1 / treeZoom) / 2} ${viewBox.w / treeZoom} ${viewBox.h / treeZoom}`}
              onMouseDown={handleTreeMouseDown}
              onMouseMove={handleTreeMouseMove}
              onMouseUp={() => { dragRef.current = null; }}
              onMouseLeave={() => { dragRef.current = null; }}
            >
              <defs>
                <style>{`
                  .gp-card-half { cursor: pointer; transition: transform 200ms ease; }
                  .gp-card-half:hover { transform: translateY(-4px); }
                  .gp-card-rect { transition: filter 200ms ease, stroke 200ms ease; filter: drop-shadow(0 2px 6px rgba(43,33,27,0.06)); }
                  .gp-card-half:hover .gp-card-rect { filter: drop-shadow(0 6px 16px rgba(43,33,27,0.12)); }
                `}</style>
                <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E7DED4" strokeWidth={0.6} opacity={0.5} />
                </pattern>
              </defs>
              <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#grid)" />

              {/* Edges */}
              <g>
                {layout.edges.map(edge => {
                  const opacity = (!searchTerm || (filteredIds.has(edge.fromId) && filteredIds.has(edge.toId))) ? 1 : 0.1;
                  if (edge.type === 'marriage') {
                    return <g key={edge.id}>
                      <path d={`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`} fill="none" stroke={edgeColor(edge.type)} strokeWidth="2.5" opacity={opacity} />
                      <text x={(edge.x1 + edge.x2) / 2} y={(edge.y1 + edge.y2) / 2 + 5} textAnchor="middle" fontSize="16" aria-label="Vợ chồng">💍</text>
                    </g>;
                  }
                  const r = 10;
                  const dir = edge.x2 >= edge.trunkX ? 1 : -1;
                  const sameX = Math.abs(edge.x2 - edge.trunkX) < 0.5;

                  let d = `M ${edge.parentX} ${edge.parentY} L ${edge.trunkX} ${edge.parentY} V ${edge.trunkY}`;
                  if (!sameX) {
                    d += ` Q ${edge.trunkX} ${edge.trunkY} ${edge.trunkX + dir * r} ${edge.trunkY}`;
                    d += ` H ${edge.x2 - dir * r}`;
                    d += ` Q ${edge.x2} ${edge.trunkY} ${edge.x2} ${edge.trunkY + r}`;
                  }
                  d += ` V ${edge.y2}`;

                  return <path key={edge.id}
                    d={d}
                    fill="none"
                    stroke={edgeColor(edge.type)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity}
                  />;
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

        {/* Right Detail Modal Popup */}
        {selectedNode && createPortal(
          <div role="dialog" aria-modal="true" onClick={event => event.target === event.currentTarget && setSelectedNode(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(43, 33, 27, 0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ width: 'min(680px, 100%)', maxHeight: 'min(820px, 92vh)', background: '#FFFFFF', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(43,33,27,0.2)', border: '1px solid #E7DED4' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7DED4', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <PersonAvatar person={selectedNode} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2B211B' }}>{selectedNode.full_name}</span>
                    {!selectedNode.isAlive && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#E7DED4', color: '#756A61' }}>Đã mất</span>
                    )}
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(184, 77, 32, 0.12)', color: '#B84D20' }}>Đời thứ {selectedNode.generation}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 18, marginTop: 6, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.82rem', color: '#756A61' }}>
                      <span style={{ color: '#756A61' }}>Sinh: </span>
                      {[selectedNode.birth_day, selectedNode.birth_month, selectedNode.birth_year].filter(Boolean).join('/') || selectedNode.birth_year || 'Chưa rõ'}
                    </div>
                    {!selectedNode.isAlive && (
                      <div style={{ fontSize: '0.82rem', color: '#756A61' }}>
                        <span style={{ color: '#756A61' }}>Mất: </span>
                        {[selectedNode.death_day, selectedNode.death_month, selectedNode.death_year].filter(Boolean).join('/') || selectedNode.death_year || 'Chưa rõ'}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756A61', fontSize: '1.2rem', padding: 4 }}>✕</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                  {descendantStats && descendantStats.totalChildren > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Hậu duệ</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div style={{ background: '#FAF7F1', borderRadius: 12, padding: '10px 12px', border: '1px solid #E7DED4' }}>
                          <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Con ruột</div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2B211B' }}>{descendantStats.totalChildren}</div>
                          <div style={{ fontSize: '0.72rem', color: '#756A61', marginTop: 2 }}>
                            ♂ {descendantStats.sonCount}&nbsp;&nbsp;♀ {descendantStats.daughterCount}
                          </div>
                        </div>
                        <div style={{ background: '#FAF7F1', borderRadius: 12, padding: '10px 12px', border: '1px solid #E7DED4' }}>
                          <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Dâu / Rể</div>
                          <div style={{ fontSize: '0.78rem', color: '#2B211B', fontWeight: 600 }}>Dâu {descendantStats.daughtersInLaw}</div>
                          <div style={{ fontSize: '0.78rem', color: '#2B211B', fontWeight: 600 }}>Rể {descendantStats.sonsInLaw}</div>
                        </div>
                        <div style={{ background: '#FAF7F1', borderRadius: 12, padding: '10px 12px', border: '1px solid #E7DED4' }}>
                          <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Cháu</div>
                          <div style={{ fontSize: '0.78rem', color: '#2B211B', fontWeight: 600 }}>Nội {descendantStats.paternalGrandchildren}</div>
                          <div style={{ fontSize: '0.78rem', color: '#2B211B', fontWeight: 600 }}>Ngoại {descendantStats.maternalGrandchildren}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    {[
                      ['Giới tính', selectedNode.gender === 'male' ? 'Nam' : selectedNode.gender === 'female' ? 'Nữ' : 'Khác'],
                      ['Tên húy', selectedNode.taboo_name || null],
                      ['Tên tự / khác', selectedNode.courtesy_name || null],
                      ['Thứ tự sinh', selectedNode.birth_order ? `Con thứ ${selectedNode.birth_order}` : null],
                      ['Ngày sinh ÂL', selectedNode.birth_date_lunar || null],
                      ['Ngày mất ÂL', !selectedNode.isAlive ? (selectedNode.death_date_lunar || null) : null],
                    ].filter(([, v]) => v != null).map(([label, value]) => (
                      <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #E7DED4' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontSize: '0.875rem', color: '#2B211B', fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase', marginBottom: 6 }}>Ghi chú</div>
                    <div style={{ background: '#FAF7F1', border: '1px solid #E7DED4', borderRadius: 10, padding: '10px 12px', fontSize: '0.85rem', color: selectedNode.note || selectedNode.biography ? '#2B211B' : '#756A61', fontStyle: selectedNode.note || selectedNode.biography ? 'normal' : 'italic', lineHeight: 1.5 }}>
                      {selectedNode.note || selectedNode.biography || 'Chưa có ghi chú.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase' }}>Gia đình</div>

                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#756A61', marginBottom: 6 }}>Bố / Mẹ</div>
                      {selectedParents.length === 0 && <div style={{ fontSize: '.82rem', color: '#756A61', fontStyle: 'italic' }}>Chưa có thông tin.</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedParents.map(relation => {
                          const parent = nodeById.get(String(relation.person_a)) || nodeById.get(relation.person_a);
                          return (
                            <div key={relation.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                              <button onClick={() => setSelectedNode(parent || null)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'none', padding: 0, cursor: 'pointer', flex: 1, textAlign: 'left' }}>
                                <PersonAvatar person={parent} size={32} />
                                <span style={{ color: '#2B211B', fontSize: '0.85rem', fontWeight: 600 }}>{parent?.full_name || 'Không rõ'}</span>
                              </button>
                              {hasPermission('relationship.manage') && <button className="ft-btn-secondary" style={{ height: 28, padding: '0 8px', fontSize: '0.75rem' }} disabled={relationSaving} onClick={() => handleRelationDelete(relation)}>Xóa</button>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#756A61', marginBottom: 6 }}>Vợ / Chồng</div>
                      {selectedSpouses.length === 0 && <div style={{ fontSize: '.82rem', color: '#756A61', fontStyle: 'italic' }}>Chưa có thông tin.</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedSpouses.map(relation => {
                          const spouseId = relation.person_a === selectedNode.id ? relation.person_b : relation.person_a;
                          const spouse = nodeById.get(String(spouseId)) || nodeById.get(spouseId);
                          return (
                            <div key={relation.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                              <button onClick={() => setSelectedNode(spouse || null)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'none', padding: 0, cursor: 'pointer', flex: 1, textAlign: 'left' }}>
                                <PersonAvatar person={spouse} size={32} />
                                <span style={{ color: '#2B211B', fontSize: '0.85rem', fontWeight: 600 }}>{spouse?.full_name || 'Không rõ'}</span>
                              </button>
                              {hasPermission('relationship.manage') && <button className="ft-btn-secondary" style={{ height: 28, padding: '0 8px', fontSize: '0.75rem' }} disabled={relationSaving} onClick={() => handleRelationDelete(relation)}>Xóa</button>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FAF7F1', border: '1px solid #E7DED4', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B211B' }}>Liên hệ</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Số điện thoại</div>
                    <div style={{ fontSize: '0.85rem', color: selectedNode.phone_number ? '#2B211B' : '#756A61', fontStyle: selectedNode.phone_number ? 'normal' : 'italic' }}>{selectedNode.phone_number || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Nghề nghiệp</div>
                    <div style={{ fontSize: '0.85rem', color: selectedNode.occupation ? '#2B211B' : '#756A61', fontStyle: selectedNode.occupation ? 'normal' : 'italic' }}>{selectedNode.occupation || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Nơi ở hiện tại</div>
                    <div style={{ fontSize: '0.85rem', color: selectedNode.current_residence ? '#2B211B' : '#756A61', fontStyle: selectedNode.current_residence ? 'normal' : 'italic' }}>{selectedNode.current_residence || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid #E7DED4', display: 'flex', gap: 10 }}>
                <button className="ft-btn-secondary" style={{ flex: 1 }}
                  onClick={() => { returnToDetailIdRef.current = selectedNode.id; setEditingMember(selectedNode); setModalOpen(true); setSelectedNode(null); }}>
                  Sửa thông tin
                </button>
                <button className="ft-btn-secondary" style={{ flex: 1, borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                  onClick={() => handleDelete(selectedNode.id)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      <MemberFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        members={treeData.members}
        editingMember={editingMember}
      />
    </div>
  );
}