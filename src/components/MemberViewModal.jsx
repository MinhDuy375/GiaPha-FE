import React from 'react';
import { createPortal } from 'react-dom';
import { API_ORIGIN } from '../services/api';

export function PersonAvatar({ person, size = 40 }) {
  if (!person) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--color-surface-2)' }} />;
  const url = person.avatar_url || person.avatarUrl;
  const avatarSrc = url ? (url.startsWith('http') ? url : `${API_ORIGIN}${url}`) : null;
  const gender = person.gender === 1 || person.gender === 'female' ? 'female' : 'male';
  const color = gender === 'female' ? '#ec4899' : '#3b82f6';
  const defaultSrc = gender === 'female' ? '/women.jpg' : '/man.jpg';

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${color}40`, overflow: 'hidden'
    }}>
      <img
        src={avatarSrc || defaultSrc}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.currentTarget.src = defaultSrc; }}
      />
    </div>
  );
}

export default function MemberViewModal({
  open,
  onClose,
  member,
  // Props only available from FamilyTree
  descendantStats,
  parents,
  spouses,
  nodeById,
  onNodeClick,
  onEdit,
  onDelete,
  onRelationDelete,
  hasManagePermission,
  showFamily = true
}) {
  if (!open || !member) return null;

  // Normalize member properties (FamilyTree uses snake_case sometimes, Members uses camelCase)
  const m = {
    id: member.id,
    fullName: member.full_name || member.fullName,
    gender: member.gender,
    isAlive: member.isAlive !== false,
    generation: member.generation || member.generationLevel || 1,
    birthYear: member.birth_year || member.birthYear,
    birthMonth: member.birth_month || member.birthMonth,
    birthDay: member.birth_day || member.birthDay,
    deathYear: member.death_year || member.deathYear,
    deathMonth: member.death_month || member.deathMonth,
    deathDay: member.death_day || member.deathDay,
    tabooName: member.taboo_name || member.tabooName,
    courtesyName: member.courtesy_name || member.courtesyName,
    birthOrder: member.birth_order || member.birthOrder,
    birthDateLunar: member.birth_date_lunar || member.birthDateLunar,
    deathDateLunar: member.death_date_lunar || member.deathDateLunar,
    note: member.note,
    biography: member.biography,
    phoneNumber: member.phone_number || member.phoneNumber,
    occupation: member.occupation,
    currentResidence: member.current_residence || member.currentResidence,
  };

  const isFemale = m.gender === 1 || m.gender === 'female';
  const genderText = isFemale ? 'Nữ' : (m.gender === 0 || m.gender === 'male' ? 'Nam' : 'Khác');

  return createPortal(
    <div role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(43, 33, 27, 0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 'min(680px, 100%)', maxHeight: 'min(820px, 92vh)', background: '#FFFFFF', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(43,33,27,0.2)', border: '1px solid #E7DED4' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7DED4', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <PersonAvatar person={member} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2B211B' }}>{m.fullName}</span>
              {!m.isAlive && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#E7DED4', color: '#756A61' }}>Đã mất</span>
              )}
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(184, 77, 32, 0.12)', color: '#B84D20' }}>Đời thứ {m.generation}</span>
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 6, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.82rem', color: '#756A61' }}>
                <span style={{ color: '#756A61' }}>Sinh: </span>
                {[m.birthDay, m.birthMonth, m.birthYear].filter(Boolean).join('/') || m.birthYear || 'Chưa rõ'}
              </div>
              {!m.isAlive && (
                <div style={{ fontSize: '0.82rem', color: '#756A61' }}>
                  <span style={{ color: '#756A61' }}>Mất: </span>
                  {[m.deathDay, m.deathMonth, m.deathYear].filter(Boolean).join('/') || m.deathYear || 'Chưa rõ'}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756A61', fontSize: '1.2rem', padding: 4 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {showFamily && descendantStats && descendantStats.totalChildren > 0 && (
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
                ['Giới tính', genderText],
                ['Tên húy', m.tabooName || null],
                ['Tên tự / khác', m.courtesyName || null],
                ['Thứ tự sinh', m.birthOrder ? `Con thứ ${m.birthOrder}` : null],
                ['Ngày sinh ÂL', m.birthDateLunar || null],
                ['Ngày mất ÂL', !m.isAlive ? (m.deathDateLunar || null) : null],
              ].filter(([, v]) => v != null).map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #E7DED4' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: '#2B211B', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase', marginBottom: 6 }}>Ghi chú</div>
              <div style={{ background: '#FAF7F1', border: '1px solid #E7DED4', borderRadius: 10, padding: '10px 12px', fontSize: '0.85rem', color: m.note || m.biography ? '#2B211B' : '#756A61', fontStyle: m.note || m.biography ? 'normal' : 'italic', lineHeight: 1.5 }}>
                {m.note || m.biography || 'Chưa có ghi chú.'}
              </div>
            </div>

            {showFamily && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#756A61', textTransform: 'uppercase' }}>Gia đình</div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#756A61', marginBottom: 6 }}>Bố / Mẹ</div>
                  {(!parents || parents.length === 0) && <div style={{ fontSize: '.82rem', color: '#756A61', fontStyle: 'italic' }}>Chưa có thông tin.</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {parents && parents.map(relation => {
                      const parent = nodeById?.get(String(relation.person_a)) || nodeById?.get(relation.person_a);
                      return (
                        <div key={relation.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                          <button onClick={() => onNodeClick && onNodeClick(parent || null)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'none', padding: 0, cursor: 'pointer', flex: 1, textAlign: 'left' }}>
                            <PersonAvatar person={parent} size={32} />
                            <span style={{ color: '#2B211B', fontSize: '0.85rem', fontWeight: 600 }}>{parent?.full_name || parent?.fullName || 'Không rõ'}</span>
                          </button>
                          {hasManagePermission && onRelationDelete && <button className="ft-btn-secondary" style={{ height: 28, padding: '0 8px', fontSize: '0.75rem' }} onClick={() => onRelationDelete(relation)}>Xóa</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#756A61', marginBottom: 6 }}>Vợ / Chồng</div>
                  {(!spouses || spouses.length === 0) && <div style={{ fontSize: '.82rem', color: '#756A61', fontStyle: 'italic' }}>Chưa có thông tin.</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {spouses && spouses.map(relation => {
                      const spouseId = relation.person_a === m.id ? relation.person_b : relation.person_a;
                      const spouse = nodeById?.get(String(spouseId)) || nodeById?.get(spouseId);
                      return (
                        <div key={relation.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                          <button onClick={() => onNodeClick && onNodeClick(spouse || null)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'none', padding: 0, cursor: 'pointer', flex: 1, textAlign: 'left' }}>
                            <PersonAvatar person={spouse} size={32} />
                            <span style={{ color: '#2B211B', fontSize: '0.85rem', fontWeight: 600 }}>{spouse?.full_name || spouse?.fullName || 'Không rõ'}</span>
                          </button>
                          {hasManagePermission && onRelationDelete && <button className="ft-btn-secondary" style={{ height: 28, padding: '0 8px', fontSize: '0.75rem' }} onClick={() => onRelationDelete(relation)}>Xóa</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#FAF7F1', border: '1px solid #E7DED4', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2B211B' }}>Liên hệ</div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Số điện thoại</div>
              <div style={{ fontSize: '0.85rem', color: m.phoneNumber ? '#2B211B' : '#756A61', fontStyle: m.phoneNumber ? 'normal' : 'italic' }}>{m.phoneNumber || 'Chưa cập nhật'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Nghề nghiệp</div>
              <div style={{ fontSize: '0.85rem', color: m.occupation ? '#2B211B' : '#756A61', fontStyle: m.occupation ? 'normal' : 'italic' }}>{m.occupation || 'Chưa cập nhật'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#756A61', marginBottom: 2 }}>Nơi ở hiện tại</div>
              <div style={{ fontSize: '0.85rem', color: m.currentResidence ? '#2B211B' : '#756A61', fontStyle: m.currentResidence ? 'normal' : 'italic' }}>{m.currentResidence || 'Chưa cập nhật'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #E7DED4', display: 'flex', gap: 10 }}>
          {onEdit && (
            <button className="ft-btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(member)}>
              Sửa thông tin
            </button>
          )}
          {onDelete && (
            <button className="ft-btn-secondary" style={{ flex: 1, borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }} onClick={() => onDelete(member)}>
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
