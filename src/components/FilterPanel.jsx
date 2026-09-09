import React from 'react';

const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FilterPanel({ open, onClose, onReset, onApply, children }) {
  if (!open) return null;

  return (
    <div className="filter-popover-wrap">
      <div className="filter-popover" role="dialog" aria-label="Bộ lọc danh sách">
        <div className="filter-popover-heading">
          <span className="filter-popover-title">
            <span className="filter-popover-icon"><IconFilter /></span>
            <span>Bộ lọc</span>
          </span>
          <button className="filter-popover-close" type="button" onClick={onClose} aria-label="Đóng bộ lọc">
            <IconClose />
          </button>
        </div>
        <div className="filter-popover-body">{children}</div>
        <div className="filter-popover-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onReset}>Đặt lại</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onApply}>Áp dụng</button>
        </div>
      </div>
    </div>
  );
}
