import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../../config";
import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const FloatingOrb = ({ size, top, left, delay, color }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      top,
      left,
      borderRadius: "50%",
      background: color,
      filter: "blur(80px)",
      opacity: 0.35,
      animation: `floatOrb ${6 + delay}s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      pointerEvents: "none",
    }}
  />
);

const GridLines = () => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [focused, setFocused] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: loginMutation, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -30px) scale(1.15); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050816;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-brand-panel {
          flex: 1;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          position: relative;
          z-index: 2;
        }
        @media (min-width: 1024px) {
          .login-brand-panel { display: flex; }
        }

        .brand-logo-ring {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-ring 4s ease-in-out infinite;
        }
        .brand-logo-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1);
          animation: spinSlow 8s linear infinite;
          z-index: 0;
        }
        .brand-logo-ring::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #050816;
          z-index: 1;
        }
        .brand-logo-inner {
          position: relative;
          z-index: 2;
          text-align: center;
        }
        .brand-emoji {
          font-size: 64px;
          line-height: 1;
          display: block;
        }

        .brand-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          margin-top: 28px;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          line-height: 1.1;
          animation: fadeSlideUp 0.8s ease both;
        }
        .brand-tagline {
          font-size: 1rem;
          color: #64748b;
          margin-top: 12px;
          font-weight: 300;
          letter-spacing: 0.05em;
          animation: fadeSlideUp 0.8s 0.15s ease both;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .brand-stats {
          display: flex;
          gap: 32px;
          margin-top: 48px;
          animation: fadeSlideUp 0.8s 0.3s ease both;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .stat-item { text-align: center; }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #a5b4fc;
        }
        .stat-label { font-size: 0.7rem; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; }

        /* RIGHT PANEL */
        .login-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 2;
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 48px 40px;
          backdrop-filter: blur(20px);
          animation: fadeSlideUp 0.7s 0.1s ease both;
          opacity: 0;
          animation-fill-mode: forwards;
          box-shadow: 0 0 80px rgba(99, 102, 241, 0.08);
        }
        @media (max-width: 480px) {
          .form-card { padding: 36px 24px; border-radius: 20px; }
        }

        .mobile-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }
        .mobile-logo-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 8px;
        }
        .mobile-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (min-width: 1024px) {
          .mobile-logo { display: none; }
        }

        .form-heading {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 6px 0;
        }
        .form-sub {
          color: #475569;
          font-size: 0.875rem;
          margin: 0 0 32px 0;
          font-weight: 300;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }
        .input-label {
          font-size: 0.75rem;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.2s ease;
          position: relative;
        }
        .input-wrapper.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .input-icon {
          color: #475569;
          font-size: 16px;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .input-wrapper.active .input-icon { color: #818cf8; }
        .input-wrapper input {
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          font-size: 0.9rem;
          width: 100%;
          padding: 14px 0;
          font-family: 'DM Sans', sans-serif;
        }
        .input-wrapper input::placeholder { color: #334155; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: white;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
          background-size: 200% auto;
          transition: all 0.3s ease;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.35);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .submit-btn:hover::after { left: 150%; }

        .error-msg {
          color: #f87171;
          font-size: 0.8rem;
          margin-top: 8px;
          padding: 10px 14px;
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 8px;
        }

        .signup-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 28px;
          font-size: 0.85rem;
        }
        .signup-row span { color: #475569; }
        .signup-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .signup-link:hover { color: #a5b4fc; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text { color: #334155; font-size: 0.75rem; letter-spacing: 0.05em; }
      `}</style>

      <div className="login-root">
        <GridLines />
        <FloatingOrb size="500px" top="-100px" left="-150px" delay={0} color="radial-gradient(circle, #6366f1, transparent)" />
        <FloatingOrb size="400px" top="60%" left="60%" delay={2} color="radial-gradient(circle, #06b6d4, transparent)" />
        <FloatingOrb size="300px" top="40%" left="30%" delay={1} color="radial-gradient(circle, #8b5cf6, transparent)" />

        {/* Brand Panel */}
        <div className="login-brand-panel">
          <div className="brand-logo-ring">
            <div className="brand-logo-inner">
              <span className="brand-emoji">🎓</span>
            </div>
          </div>
          <h1 className="brand-title">Campus<br />Loop</h1>
          <p className="brand-tagline">Your college network, beyond college</p>
          <div className="brand-stats">
            <div className="stat-item">
              <div className="stat-num">10K+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">500+</div>
              <div className="stat-label">Mentors</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">200+</div>
              <div className="stat-label">Colleges</div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="login-form-panel">
          <div className="form-card">
            <div className="mobile-logo">
              <span className="mobile-logo-icon">🎓</span>
              <span className="mobile-logo-name">CampusLoop</span>
            </div>

            <h2 className="form-heading">Welcome back</h2>
            <p className="form-sub">Sign in to continue your journey</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className={`input-wrapper ${focused === "username" ? "active" : ""}`}>
                  <MdOutlineMail className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className={`input-wrapper ${focused === "password" ? "active" : ""}`}>
                  <MdPassword className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In →"}
              </button>

              {isError && <p className="error-msg">{error.message}</p>}
            </form>

            <div className="signup-row">
              <span>New to CampusLoop?</span>
              <Link to="/signup" className="signup-link">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;