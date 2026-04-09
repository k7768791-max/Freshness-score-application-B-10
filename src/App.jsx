import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import { LoginModal, SignupModal, PaymentModal } from "./components/Modals";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AIPage from "./pages/AIPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { useAuth } from "./context/AuthContext";

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null); // "login"|"signup"|"payment"
  const [paymentPlan, setPaymentPlan] = useState("monthly");

  // Redirect to dashboard on login (only if on home page)
  React.useEffect(() => {
    if (user && page === "home") {
      setPage("dashboard");
    }
  }, [user?.email]);

  function navigate(p) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  function openModal(id) {
    if (id === "payment" && !user) { setModal("signup"); return; }
    setModal(id);
  }

  function openPayment(plan) {
    setPaymentPlan(plan);
    if (!user) { setModal("signup"); return; }
    setModal("payment");
  }

  function closeModal() { setModal(null); }

  return (
    <div>
      {/* Admin dashboard has its own full-screen layout with sidebar */}
      {page === "dashboard" && user?.is_admin ? (
        <AdminDashboardPage onNavigate={navigate} />
      ) : (
        <>
          <Navbar page={page} onNavigate={navigate} onOpenModal={openModal} />
          <div style={{ paddingTop: 68 }}>
            {page === "home"      && <HomePage    onNavigate={navigate} onOpenModal={openModal} onOpenPayment={openPayment} />}
            {page === "about"     && <AboutPage   onNavigate={navigate} />}
            {page === "contact"   && <ContactPage onNavigate={navigate} />}
            {page === "ai"        && <AIPage      onOpenModal={openModal} onOpenPayment={openPayment} />}
            {page === "dashboard" && <DashboardPage />}
          </div>
        </>
      )}

      <LoginModal
        open={modal === "login"}
        onClose={closeModal}
        onSwitch={() => setModal("signup")}
      />
      <SignupModal
        open={modal === "signup"}
        onClose={closeModal}
        onSwitch={() => setModal("login")}
      />
      <PaymentModal
        open={modal === "payment"}
        onClose={closeModal}
        initialPlan={paymentPlan}
        onSuccess={closeModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}