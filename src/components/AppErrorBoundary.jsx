import React from 'react';

export default class AppErrorBoundary extends React.Component {
    state = { hasError: false, message: '' };

    static getDerivedStateFromError(error) {
        return { hasError: true, message: error?.message || 'Lỗi không xác định.' };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Application render error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
                <section style={{ width: 'min(100%, 520px)', padding: 28, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
                    <h1 style={{ marginBottom: 8 }}>Không thể hiển thị trang</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>Dữ liệu hoặc trạng thái hiện tại không hợp lệ. Hãy tải lại trang để thử lại.</p>
                    <p style={{ color: 'var(--color-error)', fontSize: 13, overflowWrap: 'anywhere', marginBottom: 18 }}>{this.state.message}</p>
                    <button className="btn btn-primary" onClick={this.handleReload}>Tải lại trang</button>
                </section>
            </main>
        );
    }
}
