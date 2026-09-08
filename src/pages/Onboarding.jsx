import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import familyTreeService from "../services/familyTreeService";

const IconTree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22V12M12 12 5 7M12 12l7-5M5 7V4M19 7V4M5 7l-2 0M19 7l2 0" />
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Onboarding() {
  const [mode, setMode] = useState("create"); // "create" | "join"
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [joinRequests, setJoinRequests] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadJoinRequests = async () => {
    try {
      setJoinRequests(await familyTreeService.getMyJoinRequests());
    } catch {
      setJoinRequests([]);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadJoinRequests);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "create") {
        // Tạo dòng họ mới
        await familyTreeService.createTree(value.trim(), '');
        navigate("/select-tree");
      } else {
        // Tham gia bằng mã
        const result = await familyTreeService.joinTree(value);
        if (result.status === 'Pending') {
          setSuccess(result.message);
          setValue("");
          await loadJoinRequests();
        } else {
          navigate("/select-tree");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf6ec 0%, #fef9f3 50%, #fff8f0 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      fontFamily: "var(--font-body, 'Inter', sans-serif)"
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        {/* Header chào mừng */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "24px", margin: "0 auto 24px",
            background: "linear-gradient(135deg, #c0392b, #96281b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 32px rgba(192,57,43,0.3)"
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 6 L20 34 M12 14 L20 6 M28 14 L20 6 M8 24 L20 16 M32 24 L20 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="6" r="2.5" fill="white" />
              <circle cx="8" cy="24" r="2.5" fill="white" />
              <circle cx="32" cy="24" r="2.5" fill="white" />
              <circle cx="20" cy="34" r="2.5" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1a1208", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Xin chào, <span style={{ color: "#c0392b" }}>{user?.fullName || user?.username}</span>!
          </h1>
          <p style={{ color: "#6b5a3e", fontSize: "1.0625rem", lineHeight: 1.6 }}>
            Chào mừng đến với Lạc Việt Gia Phả
          </p>
        </div>

        {/* Card chính */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid rgba(192,57,43,0.08)"
        }}>

          {/* Toggle create / join */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{
              display: "inline-flex", background: "#f5f0eb", borderRadius: "12px", padding: "4px",
              width: "100%"
            }}>
              <button
                type="button"
                onClick={() => { setMode("create"); setValue(""); setError(""); }}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.9375rem", transition: "all 0.2s ease",
                  background: mode === "create" ? "white" : "transparent",
                  color: mode === "create" ? "#c0392b" : "#6b5a3e",
                  boxShadow: mode === "create" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                🏠 Tạo dòng họ mới
              </button>
              <button
                type="button"
                onClick={() => { setMode("join"); setValue(""); setError(""); }}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.9375rem", transition: "all 0.2s ease",
                  background: mode === "join" ? "white" : "transparent",
                  color: mode === "join" ? "#c0392b" : "#6b5a3e",
                  boxShadow: mode === "join" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                🔑 Tham gia dòng họ
              </button>
            </div>
          </div>

          {/* Câu hỏi */}
          <div style={{ marginBottom: "24px" }}>
            {mode === "create" ? (
              <>
                <p style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#1a1208", marginBottom: "6px" }}>
                  Đây có phải lần đầu bạn đến với Lạc Việt Gia Phả?
                </p>
                <p style={{ fontSize: "0.9rem", color: "#6b5a3e", lineHeight: 1.5 }}>
                  Hãy nhập tên dòng họ của bạn để bắt đầu. Bạn sẽ trở thành người quản trị đầu tiên.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#1a1208", marginBottom: "6px" }}>
                  Nhập mã tham gia dòng họ
                </p>
                <p style={{ fontSize: "0.9rem", color: "#6b5a3e", lineHeight: 1.5 }}>
                  Liên hệ trưởng tộc hoặc quản trị viên dòng họ để lấy mã tham gia (6 ký tự).
                </p>
              </>
            )}
          </div>

          {joinRequests.map(request => (
            <div key={`${request.familyTreeId}-${request.statusText}`} className={`alert ${request.statusText === 'Rejected' ? 'alert-error' : 'alert-success'}`} role="status" style={{ marginBottom: 16 }}>
              {request.statusText === 'Rejected'
                ? `Yêu cầu tham gia gia phả "${request.familyTreeName}" đã bị từ chối. Bạn có thể gửi lại yêu cầu bằng mã gia phả.`
                : `Yêu cầu tham gia gia phả "${request.familyTreeName}" đang chờ quản trị viên duyệt.`}
            </div>
          ))}

          {error && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: "20px" }}>
              <IconAlert /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status" style={{ marginBottom: "20px" }}>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                width: "20px", height: "20px", color: "#c0392b", opacity: 0.7
              }}>
                {mode === "create" ? <IconTree /> : <IconKey />}
              </div>
              <input
                type="text"
                placeholder={mode === "create" ? "Nhập dòng họ của bạn..." : "Nhập mã tham gia (VD: A1B2C3)..."}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  width: "100%", padding: "14px 16px 14px 44px",
                  fontSize: "1rem", border: "2px solid #e8ddd0",
                  borderRadius: "12px", outline: "none",
                  background: "#fdfaf7",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  fontFamily: mode === "join" ? "monospace" : "inherit",
                  letterSpacing: mode === "join" ? "0.1em" : "normal",
                  textTransform: mode === "join" ? "uppercase" : "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#c0392b"}
                onBlur={(e) => e.target.style.borderColor = "#e8ddd0"}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !value.trim()}
              style={{ marginBottom: "0" }}
            >
              {loading ? (
                <span className="spinner" aria-label="Đang xử lý..." />
              ) : (
                mode === "create" ? "🌳 Bắt đầu gia phả" : "✅ Tham gia dòng họ"
              )}
            </button>
          </form>

          {/* Thống kê nhỏ */}
          <div style={{
            display: "flex", gap: "16px", marginTop: "32px", paddingTop: "24px",
            borderTop: "1px solid #f0e8df"
          }}>
            {[
              { icon: "🌳", num: "500+", label: "Dòng họ" },
              { icon: "👥", num: "10K+", label: "Thành viên" },
              { icon: "📜", num: "50+", label: "Tỉnh thành" },
            ].map(({ icon, num, label }) => (
              <div key={label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", marginBottom: "4px" }}>{icon}</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#c0392b" }}>{num}</div>
                <div style={{ fontSize: "0.75rem", color: "#9b8b74" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.875rem", color: "#9b8b74" }}>
          Bạn có thể tham gia nhiều dòng họ khác nhau sau khi hoàn tất.
        </p>
      </div>
    </div>
  );
}
