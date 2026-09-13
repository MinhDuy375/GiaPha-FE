import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import roleGroupService from '../services/roleGroupService';
import Navbar from '../components/Navbar';

/* ── Icons ─────────────────────────────────────────────────── */
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── Modal tạo / sửa nhóm quyền ────────────────────────────── */
function RoleGroupModal({ open, onClose, onSave, matrix, editingGroup }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [checkedCodes, setCheckedCodes] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editingGroup) {
        setName(editingGroup.name);
        setDesc(editingGroup.description);
        setCheckedCodes(new Set(editingGroup.permissions));
      } else {
        setName('');
        setDesc('');
        setCheckedCodes(new Set());
      }
      setError('');
    }
  }, [open, editingGroup]);

  const toggle = (code) => {
    setCheckedCodes(prev => {
      const s = new Set(prev);
      s.has(code) ? s.delete(code) : s.add(code);
      return s;
    });
  };

  const toggleAll = (perms) => {
    const codes = perms.map(p => p.code);
    const allChecked = codes.every(c => checkedCodes.has(c));
    setCheckedCodes(prev => {
      const s = new Set(prev);
      if (allChecked) codes.forEach(c => s.delete(c));
      else codes.forEach(c => s.add(c));
      return s;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Tên nhóm quyền không được để trống.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(name.trim(), desc.trim(), [...checkedCodes]);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: '760px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        border: '1px solid var(--color-border)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconShield />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                {editingGroup ? 'Chỉnh sửa Nhóm quyền' : 'Tạo Nhóm quyền mới'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Cấu hình tên và chọn các quyền hạn</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}><IconClose /></button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên nhóm quyền *</label>
              <input
                id="rg-name"
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Ban quản trị, Biên soạn viên..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mô tả</label>
              <input
                id="rg-desc"
                className="input"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn vai trò..."
              />
            </div>
          </div>

          {/* Permission Matrix */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Ma trận phân quyền
            </div>
            {matrix.map(mod => (
              <div key={mod.id} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginBottom: 8, padding: '6px 10px',
                  background: 'rgba(var(--color-primary-rgb, 180,80,30),0.08)',
                  borderRadius: 6, borderLeft: '3px solid var(--color-primary)',
                }}>
                  {mod.name}
                </div>
                {mod.menus.map(menu => {
                  const allChecked = menu.permissions.every(p => checkedCodes.has(p.code));
                  const someChecked = menu.permissions.some(p => checkedCodes.has(p.code));
                  return (
                    <div key={menu.id} style={{
                      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
                      padding: '10px 12px', borderRadius: 8,
                      background: 'var(--color-surface-2)', marginBottom: 6,
                    }}>
                      {/* Menu name + toggle all */}
                      <button
                        onClick={() => toggleAll(menu.permissions)}
                        style={{
                          minWidth: 140, textAlign: 'left', fontSize: '0.85rem',
                          fontWeight: 600, color: 'var(--color-text-primary)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, border: '2px solid',
                          borderColor: allChecked ? 'var(--color-primary)' : someChecked ? 'var(--color-primary)' : 'var(--color-border)',
                          background: allChecked ? 'var(--color-primary)' : someChecked ? 'rgba(var(--color-primary-rgb,180,80,30),0.3)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {allChecked && <IconCheck />}
                        </div>
                        {menu.name}
                      </button>

                      {/* Individual permissions */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 8 }}>
                        {menu.permissions.map(p => {
                          const checked = checkedCodes.has(p.code);
                          const label = p.name;
                          return (
                            <button
                              key={p.id}
                              id={`perm-${p.code}`}
                              onClick={() => toggle(p.code)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px', borderRadius: 20,
                                border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                background: checked ? 'var(--color-primary)' : 'transparent',
                                color: checked ? '#fff' : 'var(--color-text-secondary)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                                transition: 'all 0.15s',
                              }}
                            >
                              {checked && <IconCheck />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Đã chọn: <strong style={{ color: 'var(--color-primary)' }}>{checkedCodes.size}</strong> quyền
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="rg-save-btn">
              {saving ? 'Đang lưu...' : editingGroup ? 'Cập nhật' : 'Tạo nhóm quyền'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function Permissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = useFamilyTree();

  const [roleGroups, setRoleGroups] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const canManage = hasPermission('role_group.manage');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [groups, mat] = await Promise.all([
        roleGroupService.getRoleGroups(),
        roleGroupService.getPermissionMatrix(),
      ]);
      setRoleGroups(groups);
      setMatrix(mat);
      if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0]);
    } catch (e) {
      setError('Không thể tải dữ liệu phân quyền. ' + (e.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenCreate = () => { setEditingGroup(null); setModalOpen(true); };
  const handleOpenEdit = (g) => { setEditingGroup(g); setModalOpen(true); };

  const handleSave = async (name, desc, codes) => {
    if (editingGroup) {
      await roleGroupService.updateRoleGroup(editingGroup.id, name, desc, codes);
      showToast('Cập nhật nhóm quyền thành công!');
    } else {
      await roleGroupService.createRoleGroup(name, desc, codes);
      showToast('Tạo nhóm quyền thành công!');
    }
    await loadData();
  };

  const handleDelete = async (id) => {
    try {
      await roleGroupService.deleteRoleGroup(id);
      showToast('Đã xóa nhóm quyền.', 'info');
      if (selectedGroup?.id === id) setSelectedGroup(null);
      setDeleteConfirm(null);
      await loadData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Không thể xóa nhóm quyền này.', 'error');
      setDeleteConfirm(null);
    }
  };

  /* Build permission lookup for selected group */
  const selectedPermsSet = new Set(selectedGroup?.permissions || []);

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#22c55e',
          color: '#fff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <Navbar />

      <main className="page-content">
        {/* Page Header */}
        <div className="permissions-page-header">
          <div>
            <h1 className="permissions-page-title">
              Phân quyền Dòng họ
            </h1>
            <p className="permissions-page-description">
              Quản lý các nhóm quyền và cấu hình ma trận phân quyền cho từng nhóm.
            </p>
          </div>
          {canManage && (
            <button className="btn btn-primary permissions-create-button" onClick={handleOpenCreate} id="btn-create-role-group">
              <IconPlus /> Tạo nhóm quyền
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⏳</div>
            Đang tải dữ liệu phân quyền...
          </div>
        ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, width: 250 }}>Tên nhóm quyền</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Mô tả</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, width: 120, textAlign: 'center' }}>Số quyền hạn</th>
                    {canManage && <th style={{ padding: '12px 16px', fontWeight: 700, width: 100, textAlign: 'center' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {roleGroups.map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-alt)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--color-primary-rgb, 180,80,30),0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconShield />
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{g.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                        {g.description || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Chưa có mô tả</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className="chip" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>
                          {g.permissions.length} quyền
                        </span>
                      </td>
                      {canManage && (
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Chỉnh sửa"
                              onClick={() => handleOpenEdit(g)}
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, minHeight: 32, padding: '4px 8px' }}
                            >
                              <IconEdit />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Xóa"
                              onClick={() => setDeleteConfirm(g)}
                              style={{ color: 'var(--color-error)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, minHeight: 32, padding: '4px 8px' }}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {roleGroups.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 4 : 3} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Chưa có nhóm quyền nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </main>

      {/* Modal */}
      <RoleGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        matrix={matrix}
        editingGroup={editingGroup}
      />

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="card" style={{ maxWidth: 420, width: '90%', padding: '28px 28px 24px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>Xác nhận xóa</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
              Bạn có chắc muốn xóa nhóm quyền <strong style={{ color: 'var(--color-text-primary)' }}>"{deleteConfirm.name}"</strong> không? Hành động này không thể khôi phục.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} id="btn-cancel-delete">Hủy</button>
              <button
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => handleDelete(deleteConfirm.id)}
                id="btn-confirm-delete"
              >
                Xóa nhóm quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
