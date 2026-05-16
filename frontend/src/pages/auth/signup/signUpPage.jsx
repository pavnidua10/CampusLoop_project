import { Link } from "react-router-dom";
import { useState } from "react";
import collegeList from "../../../constants/collegeList";
import courseList from "../../../constants/courseList";
import Select from "react-select";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { API_URL } from "../../../config";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: state.isFocused ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
    color: "white",
    padding: "2px 6px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    cursor: "pointer",
    "&:hover": { borderColor: "#6366f1" },
    transition: "all 0.2s ease",
  }),
  singleValue: (base) => ({ ...base, color: "#f1f5f9" }),
  placeholder: (base) => ({ ...base, color: "#334155" }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  }),
  menuList: (base) => ({ ...base, padding: "4px" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(99,102,241,0.2)" : "transparent",
    color: state.isFocused ? "#a5b4fc" : "#94a3b8",
    borderRadius: "8px",
    fontSize: "0.875rem",
    cursor: "pointer",
    padding: "10px 14px",
  }),
  dropdownIndicator: (base) => ({ ...base, color: "#475569" }),
  indicatorSeparator: () => ({ display: "none" }),
  input: (base) => ({ ...base, color: "#f1f5f9" }),
};

const STEPS = [
  { id: 1, label: "Account", icon: "🔐" },
  { id: 2, label: "Identity", icon: "🏫" },
  { id: 3, label: "Role", icon: "🎯" },
];

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [focused, setFocused] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    collegeName: "",
    course: "",
    batchYear: "",
    userRole: "Student",
    isAvailableForMentorship: false,
  });

  const queryClient = useQueryClient();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Signup failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome to CampusLoop! 🎉");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const collegeOptions = collegeList.map((c) => ({ label: c, value: c }));
  const courseOptions = courseList.map((c) => ({ label: c, value: c }));
  const batchYearOptions = Array.from({ length: 16 }, (_, i) => ({
    label: `${2015 + i}`, value: 2015 + i,
  }));

  const roleOptions = [
    { value: "Student", label: "Student (1st Year)", icon: "📚", desc: "Just starting out on campus" },
    { value: "Senior", label: "Senior Student", icon: "⚡", desc: "Guide juniors, grow together" },
    { value: "Alumni", label: "Alumni", icon: "🏆", desc: "Give back to your community" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -40px) scale(1.2); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .signup-root {
          min-height: 100vh;
          display: flex;
          background: #050816;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
          pointer-events: none;
        }
        .orb-1 { width: 500px; height: 500px; top: -200px; left: -200px; background: radial-gradient(circle, #6366f1, transparent); animation: floatOrb 7s ease-in-out infinite alternate; }
        .orb-2 { width: 350px; height: 350px; bottom: -100px; right: -100px; background: radial-gradient(circle, #06b6d4, transparent); animation: floatOrb 9s ease-in-out infinite alternate-reverse; }
        .orb-3 { width: 250px; height: 250px; top: 50%; left: 50%; background: radial-gradient(circle, #8b5cf6, transparent); animation: floatOrb 6s ease-in-out infinite alternate; }

        .grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* SIDE PANEL */
        .side-panel {
          width: 380px;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
        }
        @media (min-width: 1024px) { .side-panel { display: flex; } }

        .side-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .side-logo-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .side-logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .side-steps { display: flex; flex-direction: column; gap: 0; }
        .side-step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          position: relative;
        }
        .side-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 17px; top: calc(50% + 18px);
          width: 2px; height: 32px;
          background: rgba(255,255,255,0.06);
        }
        .side-step.done::after { background: linear-gradient(to bottom, #6366f1, rgba(99,102,241,0.2)); }
        .step-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .step-dot.active {
          border-color: #6366f1;
          background: rgba(99,102,241,0.2);
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
        .step-dot.done {
          border-color: #6366f1;
          background: #6366f1;
        }
        .step-info-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #f1f5f9;
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .side-step.active .step-info-label { opacity: 1; }
        .step-info-sub { font-size: 0.75rem; color: #334155; margin-top: 2px; }

        .side-quote {
          padding: 24px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          border-left: 3px solid #6366f1;
        }
        .side-quote p { color: #64748b; font-size: 0.85rem; font-style: italic; line-height: 1.6; }
        .side-quote span { color: #475569; font-size: 0.75rem; margin-top: 8px; display: block; }

        /* MAIN PANEL */
        .main-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 2;
        }

        .form-card {
          width: 100%;
          max-width: 460px;
          animation: fadeSlideUp 0.6s ease both;
        }

        .mobile-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .mobile-logo-wrap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .mobile-logo-icon2 {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .mobile-logo-name2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 800;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        @media (min-width: 1024px) { .mobile-header { display: none; } }

        /* Mobile step dots */
        .mobile-steps {
          display: flex; justify-content: center; gap: 8px;
          margin-bottom: 32px;
        }
        .m-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .m-dot.active { background: #6366f1; width: 24px; border-radius: 4px; }
        .m-dot.done { background: #6366f1; opacity: 0.5; }
        @media (min-width: 1024px) { .mobile-steps { display: none; } }

        .step-header { margin-bottom: 28px; }
        .step-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          color: #818cf8;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .step-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem; font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px 0;
        }
        .step-sub { color: #475569; font-size: 0.85rem; margin: 0; }

        .form-step { animation: stepIn 0.35s ease both; }

        .field { margin-bottom: 16px; }
        .field-label {
          display: block;
          font-size: 0.72rem;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .input-wrapper {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0 14px;
          transition: all 0.2s ease;
        }
        .input-wrapper.active {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .input-icon { color: #475569; font-size: 15px; flex-shrink: 0; transition: color 0.2s; }
        .input-wrapper.active .input-icon { color: #818cf8; }
        .input-wrapper input {
          background: transparent; border: none; outline: none;
          color: #f1f5f9; font-size: 0.875rem;
          width: 100%; padding: 13px 0;
          font-family: 'DM Sans', sans-serif;
        }
        .input-wrapper input::placeholder { color: #334155; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .two-col { grid-template-columns: 1fr; } }

        .role-grid { display: flex; flex-direction: column; gap: 10px; }
        .role-card {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.02);
        }
        .role-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05); }
        .role-card.selected {
          border-color: #6366f1;
          background: rgba(99,102,241,0.1);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .role-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .role-card-label { font-weight: 600; color: #e2e8f0; font-size: 0.9rem; }
        .role-card-desc { color: #475569; font-size: 0.75rem; margin-top: 2px; }
        .role-card-radio {
          margin-left: auto;
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .role-card.selected .role-card-radio {
          border-color: #6366f1;
          background: #6366f1;
        }
        .role-card.selected .role-card-radio::after {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: white;
        }

        .mentorship-toggle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          margin-top: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mentorship-toggle:hover { border-color: rgba(99,102,241,0.3); }
        .mentorship-toggle-info h4 { font-size: 0.875rem; color: #e2e8f0; font-weight: 500; margin: 0 0 2px 0; }
        .mentorship-toggle-info p { font-size: 0.75rem; color: #475569; margin: 0; }
        .toggle-switch {
          width: 42px; height: 24px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          position: relative; cursor: pointer;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-switch.on { background: #6366f1; }
        .toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px;
          border-radius: 50%; background: white;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .toggle-switch.on .toggle-knob { transform: translateX(18px); }

        .btn-row { display: flex; gap: 12px; margin-top: 24px; }
        .btn-back {
          padding: 13px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #64748b;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .btn-back:hover { border-color: rgba(255,255,255,0.2); color: #94a3b8; }
        .btn-next {
          flex: 1;
          padding: 13px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .btn-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.35);
        }
        .btn-next:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-msg {
          color: #f87171; font-size: 0.8rem; margin-top: 12px;
          padding: 10px 14px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
        }

        .login-row {
          text-align: center; margin-top: 20px;
          font-size: 0.85rem; color: #475569;
        }
        .login-link { color: #818cf8; text-decoration: none; font-weight: 500; }
        .login-link:hover { color: #a5b4fc; }
      `}</style>

      <div className="signup-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="grid-overlay" />

        {/* Side Panel */}
        <div className="side-panel">
          <div className="side-logo">
            <div className="side-logo-icon">🎓</div>
            <span className="side-logo-name">CampusLoop</span>
          </div>

          <div className="side-steps">
            {STEPS.map((s) => (
              <div key={s.id} className={`side-step ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
                <div className={`step-dot ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
                  {step > s.id ? "✓" : s.icon}
                </div>
                <div>
                  <div className="step-info-label">{s.label}</div>
                  <div className="step-info-sub">Step {s.id} of 3</div>
                </div>
              </div>
            ))}
          </div>

          <div className="side-quote">
            <p>"The connections you make in college can define your career. CampusLoop makes sure those connections never end."</p>
            <span>— Built for students, by students</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          <div className="form-card">
            <div className="mobile-header">
              <div className="mobile-logo-wrap">
                <div className="mobile-logo-icon2">🎓</div>
                <span className="mobile-logo-name2">CampusLoop</span>
              </div>
            </div>

            <div className="mobile-steps">
              {STEPS.map((s) => (
                <div key={s.id} className={`m-dot ${step === s.id ? "active" : step > s.id ? "done" : ""}`} />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* STEP 1 */}
              {step === 1 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-tag">🔐 Step 1</div>
                    <h2 className="step-title">Create your account</h2>
                    <p className="step-sub">Start with the basics — email and password.</p>
                  </div>

                  <div className="field">
                    <label className="field-label">Email Address</label>
                    <div className={`input-wrapper ${focused === "email" ? "active" : ""}`}>
                      <MdOutlineMail className="input-icon" />
                      <input type="email" name="email" placeholder="you@college.edu" value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label className="field-label">Username</label>
                      <div className={`input-wrapper ${focused === "username" ? "active" : ""}`}>
                        <FaUser className="input-icon" style={{ fontSize: "13px" }} />
                        <input type="text" name="username" placeholder="coolstudent" value={formData.username}
                          onChange={handleInputChange}
                          onFocus={() => setFocused("username")} onBlur={() => setFocused(null)} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Full Name</label>
                      <div className={`input-wrapper ${focused === "fullName" ? "active" : ""}`}>
                        <MdDriveFileRenameOutline className="input-icon" />
                        <input type="text" name="fullName" placeholder="Alex Johnson" value={formData.fullName}
                          onChange={handleInputChange}
                          onFocus={() => setFocused("fullName")} onBlur={() => setFocused(null)} />
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Password</label>
                    <div className={`input-wrapper ${focused === "password" ? "active" : ""}`}>
                      <MdPassword className="input-icon" />
                      <input type="password" name="password" placeholder="••••••••••" value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>

                  <div className="btn-row">
                    <button type="submit" className="btn-next">Continue →</button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-tag">🏫 Step 2</div>
                    <h2 className="step-title">Your academic identity</h2>
                    <p className="step-sub">Help us personalise your feed and connections.</p>
                  </div>

                  <div className="field">
                    <label className="field-label">College</label>
                    <Select options={collegeOptions} placeholder="Search your college..." styles={selectStyles}
                      onChange={(opt) => setFormData({ ...formData, collegeName: opt.value })}
                      value={collegeOptions.find((c) => c.value === formData.collegeName) || null} />
                  </div>

                  <div className="field">
                    <label className="field-label">Course / Program</label>
                    <Select options={courseOptions} placeholder="Search your course..." styles={selectStyles}
                      onChange={(opt) => setFormData({ ...formData, course: opt.value })}
                      value={courseOptions.find((c) => c.value === formData.course) || null} />
                  </div>

                  <div className="field">
                    <label className="field-label">Batch Year</label>
                    <Select options={batchYearOptions} placeholder="Select year..." styles={selectStyles}
                      onChange={(opt) => setFormData({ ...formData, batchYear: opt.value })}
                      value={batchYearOptions.find((b) => b.value === formData.batchYear) || null} />
                  </div>

                  <div className="btn-row">
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className="btn-next">Continue →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="form-step">
                  <div className="step-header">
                    <div className="step-tag">🎯 Step 3</div>
                    <h2 className="step-title">Choose your role</h2>
                    <p className="step-sub">Who are you in the CampusLoop community?</p>
                  </div>

                  <div className="role-grid">
                    {roleOptions.map((r) => (
                      <div key={r.value}
                        className={`role-card ${formData.userRole === r.value ? "selected" : ""}`}
                        onClick={() => setFormData({ ...formData, userRole: r.value })}>
                        <div className="role-card-icon">{r.icon}</div>
                        <div>
                          <div className="role-card-label">{r.label}</div>
                          <div className="role-card-desc">{r.desc}</div>
                        </div>
                        <div className="role-card-radio" />
                      </div>
                    ))}
                  </div>

                  <div className="mentorship-toggle" onClick={() =>
                    setFormData({ ...formData, isAvailableForMentorship: !formData.isAvailableForMentorship })}>
                    <div className="mentorship-toggle-info">
                      <h4>Available for Mentorship?</h4>
                      <p>Let students find and connect with you</p>
                    </div>
                    <div className={`toggle-switch ${formData.isAvailableForMentorship ? "on" : ""}`}>
                      <div className="toggle-knob" />
                    </div>
                  </div>

                  <div className="btn-row">
                    <button type="button" className="btn-back" onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="btn-next" disabled={isPending}>
                      {isPending ? "Creating account..." : "Join CampusLoop 🎉"}
                    </button>
                  </div>

                  {isError && <p className="error-msg">{error.message}</p>}
                </div>
              )}
            </form>

            <p className="login-row">
              Already have an account? <Link to="/login" className="login-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;