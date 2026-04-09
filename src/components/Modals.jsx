import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Modal({ id, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export function LoginModal({ open, onClose, onSwitch }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const msg = await login({ email, password });
      showToast(msg, "success");
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2>Welcome back.</h2>
      <p className="modal-sub">Sign in to your FreshSense account.</p>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />
      </div>
      <button className="btn-primary btn-full" onClick={handleLogin} disabled={loading}>
        {loading ? "Signing in…" : "Sign In →"}
      </button>
      <div className="auth-switch">
        Don't have an account?{" "}
        <a onClick={onSwitch}>Sign up free</a>
      </div>
    </Modal>
  );
}

export function SignupModal({ open, onClose, onSwitch }) {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    try {
      const msg = await signup({ fname, lname, email, password });
      showToast(msg, "success");
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2>Start for free.</h2>
      <p className="modal-sub">Create your account and get 3 free predictions.</p>
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input className="form-control" placeholder="Arjun"
            value={fname} onChange={e => setFname(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input className="form-control" placeholder="Reddy"
            value={lname} onChange={e => setLname(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input className="form-control" type="password" placeholder="Min 6 characters"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSignup()} />
      </div>
      <button className="btn-primary btn-full" onClick={handleSignup} disabled={loading}>
        {loading ? "Creating…" : "Create Account →"}
      </button>
      <div className="auth-switch">
        Already have an account?{" "}
        <a onClick={onSwitch}>Sign in</a>
      </div>
    </Modal>
  );
}

export function PaymentModal({ open, onClose, initialPlan, onSuccess }) {
  const { user, updateUserLocally } = useAuth();
  const { showToast } = useToast();
  const [plan, setPlan] = useState(initialPlan || "monthly");
  const [name, setName] = useState(user ? `${user.fname} ${user.lname || ""}`.trim() : "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const amount = plan === "monthly" ? "₹499" : "₹3,999";
  const label  = plan === "monthly" ? "Pro Monthly" : "Pro Yearly";

  async function handlePay() {
    if (!name.trim() || !email.trim()) { showToast("Please fill your name and email.", "error"); return; }
    setLoading(true);
    try {
      // Initiate order
      const r = await fetch("/api/payment/initiate", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const orderData = await r.json();

      if (!r.ok) throw new Error(orderData.error);

      // Open Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FreshSense AI",
        description: `${label} Subscription`,
        order_id: orderData.order_id,
        handler: async (response) => {
          // Captured after successful transaction in popup
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          await confirmPayment(response);
        },
        prefill: { name, email },
        theme: { color: "#00d4aa" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showToast("Payment window closed.", "info");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (e) {
      showToast(e.message || "Payment error. Please try again.", "error");
      setLoading(false);
    }
  }

  async function confirmPayment(paymentDetails) {
    try {
      const r = await fetch("/api/payment/success", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentDetails,
          plan: plan
        })
      });
      const d = await r.json();
      if (r.ok) {
        updateUserLocally({ is_pro: true });
        showToast(d.message, "success");
        onClose();
        onSuccess && onSuccess();
      } else {
        showToast(d.error || "Verification failed.", "error");
      }
    } catch (e) {
      showToast("Verification error. Please contact support.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Upgrade to Pro</h2>
        <p className="modal-sub">Choose your plan and unlock unlimited AI predictions.</p>

        <div className="plan-select">
          <div className={`plan-option${plan === "monthly" ? " selected" : ""}`}
            onClick={() => setPlan("monthly")}>
            <div className="plan-name">Monthly</div>
            <div className="plan-price">₹499</div>
            <div className="plan-period">per month</div>
          </div>
          <div className={`plan-option${plan === "yearly" ? " selected" : ""}`}
            onClick={() => setPlan("yearly")}>
            <div className="plan-name">Yearly</div>
            <div className="plan-price">₹3999</div>
            <div className="plan-period">per year — save ₹1989</div>
          </div>
        </div>

        <div className="pay-summary">
          <div className="pay-row"><span>Plan</span><span>{label}</span></div>
          <div className="pay-row"><span>Amount</span><span className="pay-amount">{amount}</span></div>
        </div>

        <div className="form-group">
          <label>Name on Card</label>
          <input className="form-control" placeholder="Arjun Reddy"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email for Receipt</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button className="btn-primary btn-full btn-lg" onClick={handlePay} disabled={loading}>
          {loading ? "Processing…" : "Pay with Razorpay →"}
        </button>
        <p className="pay-secure">🔒 Secured by Razorpay. Cancel anytime.</p>
      </div>
    </div>
  );
}