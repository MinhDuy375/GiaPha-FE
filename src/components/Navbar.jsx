import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import roleGroupService from '../services/roleGroupService';

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const menuRoutes = {
  tree_view: '/family-tree',
  member_list: '/members',
  kinship: '/kinship',
  gallery: '/gallery',
  events: '/events',
  membership: '/membership',
  role_group: '/permissions',
  relationships: '/relationships',
  statistics: '/statistics',
};

function MenuIcon({ name }) {
  const paths = {
    tree: 'M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    calendar: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16',
    link: 'M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07L11 5M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1-1',
    images: 'M4 5h16v14H4zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M4 16l4-4 3 3 2-2 7 6',
    'user-plus': 'M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6',
    chart: 'M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V4',
    switch: 'M16 3l4 4-4 4M20 7H10M8 21l-4-4 4-4M4 17h10',
  };
  return <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.tree} /></svg>;
}

export default function Navbar({ children }) {
  const { user, logout } = useAuth();
  const { permissions = [], currentTreeName, clearSelectedTree } = useFamilyTree();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('sidebarPinned') === 'true');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [navigation, setNavigation] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    roleGroupService.getNavigation().then(setNavigation).catch(() => setNavigation([]));
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 640) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarPinned(value => {
      localStorage.setItem('sidebarPinned', String(!value));
      return !value;
    });
  };

  const openMobileDrawer = () => setMobileMenuOpen(true);
  const closeMobileDrawer = () => setMobileMenuOpen(false);

  const sidebarOpen = sidebarPinned || sidebarHovered || mobileMenuOpen;
  const visibleMenus = navigation.filter(menu => menu.permissions?.some(permission => permissions.includes(permission)) && menuRoutes[menu.alias]);

  return (
    <>
      <div className={`mobile-backdrop ${mobileMenuOpen ? 'mobile-backdrop-visible' : ''}`} onClick={closeMobileDrawer} />
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`} aria-label="Điều hướng gia phả" onMouseEnter={() => setSidebarHovered(true)} onMouseLeave={() => setSidebarHovered(false)}>
        <div className="sidebar-heading">
          <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarPinned ? 'Thu gọn menu' : 'Ghim menu mở rộng'}>{sidebarPinned ? '‹' : '›'}</button>
        </div>
        <nav className="sidebar-nav">
          {visibleMenus.map(menu => (
            <button key={menu.id} className="sidebar-item" title={sidebarOpen ? undefined : menu.name} onClick={() => navigate(menuRoutes[menu.alias])}>
              <MenuIcon name={menu.icon} /><span>{menu.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {currentTreeName && (
            <div className="sidebar-tree-card" title={currentTreeName}>
              <span className="sidebar-tree-label">Dòng họ hiện tại</span>
              <span className="sidebar-tree-name">{currentTreeName}</span>
            </div>
          )}
          <button
            className="sidebar-item sidebar-switch"
            title="Đổi dòng họ"
            onClick={() => { clearSelectedTree(); navigate('/select-tree'); }}
          >
            <MenuIcon name="switch" />
            <span>Đổi dòng họ</span>
          </button>
        </div>
      </aside>
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-left">
            <button className="mobile-menu-button" aria-label={mobileMenuOpen ? 'Thu gọn menu' : 'Mở menu'} onClick={mobileMenuOpen ? closeMobileDrawer : openMobileDrawer}>
              <span className="mobile-menu-icon">
                {mobileMenuOpen ? <><span className="mobile-menu-icon-close" /><span className="mobile-menu-icon-close mobile-menu-icon-close-second" /></> : <><span /><span /><span /></>}
              </span>
            </button>
            <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src="/chimlactrans.png" alt="Logo" className="navbar-logo" style={{ width: '30px' }} />
              Lạc Việt
            </div>
          </div>

          <div className="navbar-actions">
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div
                className="navbar-user"
                style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 8, transition: 'background 0.2s', background: menuOpen ? 'var(--color-surface-2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="navbar-avatar" aria-label={"User " + (user?.fullName || user?.username)}>
                  {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flexDirection: 'column', display: window.innerWidth <= 1024 ? 'none' : 'flex' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                    {user?.fullName || user?.username}
                  </span>
                </div>
              </div>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  width: 220, zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="navbar-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem', marginBottom: 12 }} aria-label={"User " + (user?.fullName || user?.username)}>
                      {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                      {user?.fullName || user?.username}
                    </div>
                    {user?.email && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{user.email}</div>}
                  </div>
                  <div style={{ padding: 4 }}>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', background: 'none', border: 'none',
                        color: 'var(--color-text-primary)', cursor: 'pointer',
                        borderRadius: 6, fontSize: '0.9rem', textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <IconUser /> Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={logout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', background: 'none', border: 'none',
                        color: '#ef4444', cursor: 'pointer',
                        borderRadius: 6, fontSize: '0.9rem', textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <IconLogout /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {children && <div className="page-actions"><div className="page-actions-inner">{children}</div></div>}
    </>
  );
}
