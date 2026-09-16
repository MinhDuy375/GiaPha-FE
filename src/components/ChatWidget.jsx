import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import chatService from '../services/chatService';
import './ChatWidget.css';

const INITIAL_POSITION = { right: 24, bottom: 24 };

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.7-.85L4 20l1.3-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { currentTreeId } = useFamilyTree();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem('chatWidgetPosition');
    if (!savedPosition) return INITIAL_POSITION;

    try {
      const parsed = JSON.parse(savedPosition);
      return Number.isFinite(parsed.left) || Number.isFinite(parsed.right)
        ? parsed
        : INITIAL_POSITION;
    } catch {
      localStorage.removeItem('chatWidgetPosition');
      return INITIAL_POSITION;
    }
  });
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const dragRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(current => {
        const hasAbsolutePosition = current.left !== undefined && current.top !== undefined;
        if (!hasAbsolutePosition) return current;

        const buttonSize = window.innerWidth <= 640 ? 56 : 62;
        const margin = window.innerWidth <= 640 ? 12 : 24;
        const next = {
          left: Math.max(margin, Math.min(current.left, window.innerWidth - buttonSize - margin)),
          top: Math.max(margin, Math.min(current.top, window.innerHeight - buttonSize - margin)),
        };
        localStorage.setItem('chatWidgetPosition', JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user || !currentTreeId) return null;

  const clampPosition = (left, top) => {
    const buttonSize = window.innerWidth <= 640 ? 56 : 62;
    const margin = window.innerWidth <= 640 ? 12 : 24;
    return {
      left: Math.max(margin, Math.min(left, window.innerWidth - buttonSize - margin)),
      top: Math.max(margin, Math.min(top, window.innerHeight - buttonSize - margin)),
    };
  };

  const startDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
    };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextLeft = drag.startLeft + event.clientX - drag.startX;
    const nextTop = drag.startTop + event.clientY - drag.startY;
    if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4) {
      drag.moved = true;
    }
    if (!drag.moved) return;
    const next = clampPosition(nextLeft, nextTop);
    setPosition(next);
    localStorage.setItem('chatWidgetPosition', JSON.stringify(next));
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!drag.moved) setOpen(value => !value);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setDraft('');
    setError('');
    setMessages(items => [...items, { role: 'user', content: message }]);
    setSending(true);

    try {
      const response = await chatService.sendMessage({ conversationId, message });
      setConversationId(response.data.conversationId);
      setMessages(items => [...items, {
        role: 'assistant',
        content: response.data.message,
        intent: response.data.intent,
      }]);
    } catch (requestError) {
      const status = requestError.response?.status;
      setError(status === 403
        ? 'Tài khoản hiện không được phép truy cập gia phả này.'
        : 'Không thể kết nối với Trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setSending(false);
    }
  };

  const resetConversation = () => {
    setConversationId(null);
    setMessages([]);
    setError('');
  };

  const style = position.left !== undefined
    ? { left: `${position.left}px`, top: `${position.top}px` }
    : { right: `${position.right ?? INITIAL_POSITION.right}px`, bottom: `${position.bottom ?? INITIAL_POSITION.bottom}px` };

  return (
    <div className={`chat-widget ${open ? 'chat-widget-open' : ''}`}>
      {open && (
        <section className="chat-panel" aria-label="Trợ lý AI Gia Phả">
          <header className="chat-panel-header">
            <div>
              <strong>Trợ lý AI Gia Phả</strong>
              <span>Tra cứu gia phả và hướng dẫn sử dụng</span>
            </div>
            <div className="chat-panel-actions">
              <button type="button" onClick={resetConversation} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới">↻</button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng cửa sổ chat">×</button>
            </div>
          </header>

          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-empty-state">
                <ChatIcon />
                <p>Xin chào! Tôi có thể giúp tra cứu thành viên, quan hệ trong gia phả hoặc hướng dẫn sử dụng hệ thống.</p>
              </div>
            )}
            {messages.map((item, index) => (
              <div className={`chat-message chat-message-${item.role}`} key={`${item.role}-${index}`}>
                {item.content}
              </div>
            ))}
            {sending && <div className="chat-message chat-message-assistant chat-message-loading">Đang tìm thông tin...</div>}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="chat-error" role="alert">{error}</div>}
          <form className="chat-composer" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="Hỏi về gia phả..."
              aria-label="Nội dung câu hỏi"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !draft.trim()} aria-label="Gửi tin nhắn">➤</button>
          </form>
        </section>
      )}

      {!open && (
        <button
          type="button"
          className="chat-fab"
          style={style}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-label="Mở trợ lý AI"
          title="Kéo để di chuyển, nhấn để mở trợ lý AI"
        >
          <ChatIcon />
        </button>
      )}
    </div>
  );
}
