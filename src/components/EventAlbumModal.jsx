import { useState } from 'react';
import galleryService from '../services/galleryService';
import { API_ORIGIN } from '../services/api';

const asset = path => path?.startsWith('http') ? path : `${API_ORIGIN}${path}`;

export default function EventAlbumModal({ album, canManage, onClose, onChanged }) {
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    if (!album) return null;

    const upload = async () => {
        if (!files.length || !canManage) return;
        setSaving(true); setError('');
        try {
            for (const file of files) {
                const data = new FormData();
                data.append('file', file);
                data.append('eventId', album.id);
                await galleryService.upload(data);
            }
            setFiles([]);
            await onChanged();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể thêm ảnh vào album.');
        } finally { setSaving(false); }
    };

    const remove = async image => {
        if (!canManage || !window.confirm('Xóa ảnh này khỏi album?')) return;
        setSaving(true); setError('');
        try { await galleryService.delete(image.id); await onChanged(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể xóa ảnh.'); }
        finally { setSaving(false); }
    };

    return <div className="modal-overlay" role="dialog" aria-modal="true" onClick={event => event.target === event.currentTarget && onClose()}>
        <div className="modal event-album-modal">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 className="modal-title">{album.title}</h2><div style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginTop: 4 }}>Album sự kiện · {album.images.length} ảnh</div></div>
                <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Đóng album">×</button>
            </div>
            <div className="modal-body">
                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
                {canManage && <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}><input className="input" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => setFiles([...event.target.files])} /><button className="btn btn-primary" disabled={!files.length || saving} onClick={upload}>{saving ? 'Đang lưu...' : 'Thêm ảnh'}</button></div>}
                <div className="event-album-grid">{album.images.map(image => <div key={image.id} className="event-album-image"><img src={asset(image.fileUrl)} alt={image.caption || image.fileName} /><div className="event-album-caption"><strong>{image.caption || image.fileName}</strong>{image.notes && <span>{image.notes}</span>}{canManage && <button className="btn btn-sm" style={{ color: '#ef4444', alignSelf: 'flex-start', marginTop: 5 }} disabled={saving} onClick={() => remove(image)}>Xóa ảnh</button>}</div></div>)}</div>
            </div>
        </div>
    </div>;
}
