import React, { useState } from "react";

const BASE_URL = "http://127.0.0.1:8000/api";

const GENERIC_LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
const ROLE_LOGIN_ENDPOINTS = {
  student: GENERIC_LOGIN_ENDPOINT,
  advisor: GENERIC_LOGIN_ENDPOINT,
  admin: GENERIC_LOGIN_ENDPOINT,
};

const ROLE_EMAIL_PLACEHOLDER = {
  student: "student@sci.asu.edu.eg",
  advisor: "advisor@sci.asu.edu.eg",
  admin: "admin@sci.asu.edu.eg",
};

// ─── Icons ───────────────────────────────────────────────────
const ArrowIcon = () => <span style={{ marginLeft: 6 }}>→</span>;
const CapIcon = () => <div style={{ fontSize: 45, lineHeight: 1 }}>🎓</div>;
const LockIcon = () => <div style={{ fontSize: 32, lineHeight: 1 }}>🔑</div>;

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ─── Password Input with Eye Toggle ──────────────────────────
function PasswordInput({ value, onChange, onFocus, onBlur, onKeyDown, focused, name, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        style={{
          ...styles.input,
          paddingRight: 44,
          borderColor: focused === name ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
          boxShadow: focused === name ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
        }}
        type={show ? "text" : "password"}
        placeholder={placeholder || "Password"}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={styles.eyeBtn}
        tabIndex={-1}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ─── Forgot Password View ─────────────────────────────────────
function ForgotPasswordView({ onBack }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const emailStyle = {
    ...styles.input,
    borderColor: focused === "fp-email" ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
    boxShadow: focused === "fp-email" ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
  };

  async function handleReset() {
    setErr(""); setSuccess("");
    if (!email) { setErr("Please enter your email"); return; }
    if (!newPassword) { setErr("Please enter a new password"); return; }
    if (newPassword !== confirmPassword) { setErr("Passwords do not match"); return; }
    if (newPassword.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password: newPassword, password_confirmation: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Reset failed. Please check your email.");
      } else {
        setSuccess(data.message || "Password reset successfully! You can now sign in.");
      }
    } catch {
      setErr("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <div style={styles.icon}><LockIcon /></div>
      <h2 style={styles.heading}>Reset Password</h2>
      <p style={styles.subheading}>Enter your email and new password</p>

      <div style={styles.inputWrap}>
        <input style={emailStyle} placeholder="name@sci.asu.edu.eg" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused("fp-email")} onBlur={() => setFocused("")} />
      </div>
      <div style={styles.inputWrap}>
        <PasswordInput name="fp-new" placeholder="New Password" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onFocus={() => setFocused("fp-new")} onBlur={() => setFocused("")} focused={focused} />
      </div>
      <div style={styles.inputWrap}>
        <PasswordInput name="fp-confirm" placeholder="Confirm New Password" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onFocus={() => setFocused("fp-confirm")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && handleReset()} focused={focused} />
      </div>

      {err && <p style={styles.err}>{err}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} onClick={handleReset} disabled={loading}>
        {loading ? "Resetting…" : "Reset Password"}{!loading && <ArrowIcon />}
      </button>
      <button style={styles.backLink} onClick={onBack}>← Back to Sign In</button>
    </div>
  );
}

// ─── Login View ───────────────────────────────────────────────
function LoginView({ onForgot, onLoginSuccess }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const roleLabels = { student: "Student", advisor: "Advisor", admin: "Admin" };

  const emailStyle = {
    ...styles.input,
    borderColor: focused === "email" ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
    boxShadow: focused === "email" ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
  };

  async function handleSignIn() {
    setErr("");
    if (!email || !password) { setErr("Please enter email and password"); return; }
    setLoading(true);

    const endpoint = ROLE_LOGIN_ENDPOINTS[role] || GENERIC_LOGIN_ENDPOINT;

    try {
      let res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
      });

      
      if (res.status === 404 && endpoint !== GENERIC_LOGIN_ENDPOINT) {
        res = await fetch(GENERIC_LOGIN_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Invalid email or password");
        setLoading(false);
        return;

      const token = data.token ?? data.access_token ?? data.data?.token;
      if (token) {
       
        const userFromAPI = data.user ?? data.data?.user ?? data.advisor ?? data.student ?? data.admin ?? null;

       const userObj = {
          id: userFromAPI?.id ?? data.id ?? null,
          name: userFromAPI?.name ?? data.name ?? email.split('@')[0],
          email: userFromAPI?.email ?? data.email ?? email,
          role: userFromAPI?.role ?? role,
         
          dept: userFromAPI?.department ?? userFromAPI?.dept ?? null,
          advisorId: userFromAPI?.id ?? null,
         
          av: (userFromAPI?.name ?? email).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        };

        /
        const effectiveRole = (userFromAPI?.role ?? data.role ?? role).toLowerCase();

        localStorage.setItem("token", token);
        localStorage.setItem("role", effectiveRole);
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      const finalRole = (data.user?.role ?? data.role ?? role).toLowerCase();
      if (onLoginSuccess) onLoginSuccess(finalRole);

    } catch {
      setErr("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <div style={styles.icon}><CapIcon /></div>
      <h2 style={styles.heading}>Welcome Back</h2>
      <p style={styles.subheading}>Academic Advising System · ASU</p>

      {/* Role selector */}
      <div style={styles.roles}>
        {["student", "advisor", "admin"].map((r) => (
          <button key={r}
            onClick={() => { setRole(r); setErr(""); setEmail(""); }}
            style={role === r ? styles.roleBtnActive : styles.roleBtn}>
            {roleLabels[r]}
          </button>
        ))}
      </div>

      {/* Email */}
      <div style={styles.inputWrap}>
        <input style={emailStyle}
          placeholder={ROLE_EMAIL_PLACEHOLDER[role]}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
          autoComplete="email" />
      </div>

      {/* Password */}
      <div style={styles.inputWrap}>
        <PasswordInput name="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
          focused={focused} />
      </div>

      <div style={{ textAlign: "right", marginBottom: 4, marginTop: -4 }}>
        <button style={styles.forgotLink} onClick={onForgot}>Forgot Password?</button>
      </div>

      {err && <p style={styles.err}>{err}</p>}

      <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in…" : `Sign In as ${roleLabels[role]}`}{!loading && <ArrowIcon />}
      </button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────
export default function AcademicAdvisorLogin({ onLoginSuccess }) {
  const [view, setView] = useState("login");
  return (
    <div style={styles.page}>
      <div style={styles.pageBg} />
      {view === "login"
        ? <LoginView onForgot={() => setView("forgot")} onLoginSuccess={onLoginSuccess} />
        : <ForgotPasswordView onBack={() => setView("login")} />
      }
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    background: "#06090f", color: "#e8f0fe", fontFamily: "'Outfit', sans-serif",
    position: "relative", overflow: "hidden",
  },
  pageBg: {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
    background:
      "radial-gradient(ellipse 700px 500px at 30% 40%, rgba(59,130,246,0.07) 0%, transparent 70%), " +
      "radial-gradient(ellipse 500px 400px at 75% 60%, rgba(45,212,191,0.05) 0%, transparent 70%)",
  },
  card: {
    position: "relative", zIndex: 1,
    background: "linear-gradient(145deg, #0e1829, #0a1f3a)",
    border: "1px solid rgba(59,130,246,0.18)", borderRadius: 20,
    padding: "85px 55px 50px", width: 400, heigh: 380, textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.08)",
  },
  icon: {
    width: 70, height: 80, borderRadius: 14,
    background: "linear-gradient(135deg, #3b82f6, #2dd4bf)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
  },
  heading: {
    fontFamily: "'Libre Baskerville', serif", fontSize: "2.22rem",
    fontWeight: 510, color: "#e8f0fe", margin: "0 0 6px",
  },
  subheading: { fontSize: 20, color: "#5b7a9d", fontWeight: 400, margin: "0 0 28px", letterSpacing: 0.3 },
  roles: {
    display: "flex", gap: 6, marginBottom: 10,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: 4,
  },
  roleBtn: {
    flex: 1, padding: "9px 0", border: "none", borderRadius: 7,
    background: "transparent", color: "#5b7a9d", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 500,
    textTransform: "capitalize", letterSpacing: 0.3, transition: "all .2s",
  },
  roleBtnActive: {
    flex: 1, padding: "8px 0", border: "none", borderRadius: 7,
    background: "linear-gradient(135deg, #3b82f6, #1d65cc)",
    color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 700, textTransform: "capitalize", letterSpacing: 0.3,
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
  inputWrap: { marginBottom: 12 },
  input: {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
    color: "#e8f0fe", fontFamily: "'Outfit', sans-serif", fontSize: 15, outline: "none",
    transition: "border-color .2s, box-shadow .2s", boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", color: "#5b7a9d",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 4, borderRadius: 6, transition: "color .2s", lineHeight: 1,
  },
  btn: {
    width: "100%", padding: "15px 0", marginTop: 4,
    background: "linear-gradient(135deg, #3b82f6, #1d65cc)",
    border: "none", color: "#fff", borderRadius: 10, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
    boxShadow: "0 6px 20px rgba(59,130,246,0.35)", transition: "all .25s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },
  err: {
    color: "#fb7185", fontSize: 15, margin: "8px 0 12px",
    background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)",
    borderRadius: 8, padding: "8px 12px", textAlign: "right",
  },
  success: {
    color: "#34d399", fontSize: 15, margin: "8px 0 12px",
    background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: 8, padding: "8px 12px", textAlign: "center",
  },
  forgotLink: {
    background: "none", border: "none", cursor: "pointer", color: "#3b82f6",
    fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
    padding: "2px 0", textDecoration: "underline",
    textDecorationColor: "rgba(59,130,246,0.4)", transition: "color .2s",
  },
  backLink: {
    background: "none", border: "none", cursor: "pointer", color: "#5b7a9d",
    fontSize: 15, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
    marginTop: 18, display: "block", width: "100%", textAlign: "center",
    padding: "8px 0", transition: "color .2s",
  },
};
