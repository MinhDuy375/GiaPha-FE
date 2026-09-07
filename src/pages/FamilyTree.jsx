import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import memberService from '../services/memberService';
import Navbar from '../components/Navbar';
import { computeTreeLayout, GENDER_COLORS, NODE_WIDTH, NODE_HEIGHT } from '../utils/treeLayout';
import { solarToLunar } from '../utils/lunarCalendar';
import { API_ORIGIN } from '../services/api';
import { useFamilyTree } from '../contexts/FamilyTreeContext';

/* ─── Icons ────────────────────────────────────────────────── */
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
function NodeCard({ member, isSelected, onClick }) {
  const colors = GENDER_COLORS[member.gender] || GENDER_COLORS.other;
  const initials = member.full_name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || '?';
  const years = [member.birth_year, member.death_year].filter(Boolean);
  const yearStr = years.length === 2 ? `${years[0]} – ${years[1]}` : years[0] ? `SN ${years[0]}` : '';

  return (
    <g onClick={() => onClick(member)} style={{ cursor: 'pointer' }}>
      <rect
        x={member.x} y={member.y}
        width={NODE_WIDTH} height={NODE_HEIGHT}
        rx={12}
        fill="var(--color-surface)"
        stroke={isSelected ? colors.border : (member.isAlive ? colors.border : 'var(--color-border)')}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ transition: 'all 0.2s', filter: isSelected ? `drop-shadow(0 0 8px ${colors.border}80)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
        opacity={member.isAlive ? 1 : 0.7}
      />
      <defs><clipPath id={`avatar-${member.id}`}><circle cx={member.x + NODE_WIDTH / 2} cy={member.y + 38} r={25} /></clipPath></defs>
      {/* Avatar centered above the member name */}
      <circle cx={member.x + NODE_WIDTH / 2} cy={member.y + 38} r={25}
        fill={colors.bg} stroke={colors.border} strokeWidth={2} />
      {member.avatar_url ? <image href={member.avatar_url.startsWith('http') ? member.avatar_url : `${API_ORIGIN}${member.avatar_url}`} x={member.x + NODE_WIDTH / 2 - 25} y={member.y + 13} width={50} height={50} preserveAspectRatio="xMidYMid slice" clipPath={`url(#avatar-${member.id})`} /> : <text x={member.x + NODE_WIDTH / 2} y={member.y + 44}
        textAnchor="middle" fontSize={13} fontWeight={700} fill={colors.text}>
        {initials}
      </text>}

      {/* Name */}
      <foreignObject x={member.x + 8} y={member.y + 72} width={NODE_WIDTH - 16} height={38}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center',
          lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {member.full_name}
        </div>
      </foreignObject>

      {/* Year */}
      {yearStr && (
        <text x={member.x + NODE_WIDTH / 2} y={member.y + NODE_HEIGHT - 10}
          textAnchor="middle" fontSize={11} fill="var(--color-text-muted)">
          {yearStr}
        </text>
      )}

      {/* Deceased indicator */}
      {!member.isAlive && (
        <text x={member.x + NODE_WIDTH - 12} y={member.y + 16} fontSize={14} fill="var(--color-text-muted)">†</text>
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
      const computed = computeTreeLayout(normalizedData.members, normalizedData.relationships);
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
    } catch (e) {
      setError('Không thể tải dữ liệu cây gia phả. ' + (e.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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

  const edgeColor = (type) => type === 'marriage' ? '#f59e0b' : 'var(--color-border)';

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <Navbar />
      <div className="content-header-row family-tree-titlebar"><div className="section-header"><h1 className="section-title">Cây gia phả</h1><p className="section-sub">Khám phá các thế hệ và mối liên hệ trong dòng họ.</p></div><div className="content-header-actions"><button className="btn btn-secondary btn-sm" onClick={loadData}><IconRefresh /> Làm mới</button><button className="btn btn-primary btn-sm" onClick={() => { setEditingMember(null); setModalOpen(true); }}><IconPlus /> Thêm thành viên</button></div></div>

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
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Chưa có thành viên nào</div>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Hãy thêm thành viên đầu tiên để xây dựng cây gia phả.</div>
                <button className="btn btn-primary" onClick={() => { setEditingMember(null); setModalOpen(true); }}>
                  <IconPlus /> Thêm thành viên đầu tiên
                </button>
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
              {/* Grid pattern */}
              <defs>
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
                {layout.nodes.map(node => {
                  const opacity = (!searchTerm || filteredIds.has(node.id)) ? 1 : 0.15;
                  return (
                    <g key={node.id} opacity={opacity}>
                      <NodeCard
                        member={node}
                        isSelected={selectedNode?.id === node.id}
                        onClick={setSelectedNode}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          )}
        </div>

        {/* Right: Detail Panel */}
        {selectedNode && (
          <div className="family-tree-detail" style={{ width: 260, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'familyPanelIn 220ms ease-out' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Chi tiết</span>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
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
          </div>
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
