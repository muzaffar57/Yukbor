import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import { FullPageSpinner } from "./components/Spinner";
import { ErrorState } from "./components/EmptyState";
import { BottomNav } from "./components/BottomNav";
import { OnboardingPage } from "./pages/OnboardingPage";
import { CargoListPage } from "./pages/CargoListPage";
import { CargoDetailPage } from "./pages/CargoDetailPage";
import { CreateCargoPage } from "./pages/CreateCargoPage";
import { DriverOffersListPage } from "./pages/DriverOffersListPage";
import { DriverOfferDetailPage } from "./pages/DriverOfferDetailPage";
import { CreateDriverOfferPage } from "./pages/CreateDriverOfferPage";
import { ProfilePage } from "./pages/ProfilePage";

function RoleGate({ role, children }: { role: "shipper" | "driver"; children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && user.role !== role) {
    return (
      <ErrorState
        message={
          role === "shipper"
            ? "Bu bo'lim faqat yuk beruvchilar uchun."
            : "Bu bo'lim faqat haydovchilar uchun."
        }
      />
    );
  }
  return <>{children}</>;
}

function App() {
  const { loading, user, error, refresh } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!user) return <OnboardingPage />;

  return (
    <div style={{ paddingBottom: "calc(64px + var(--safe-bottom))" }}>
      <Routes>
        <Route path="/" element={<CargoListPage />} />
        <Route path="/cargos/new" element={<RoleGate role="shipper"><CreateCargoPage /></RoleGate>} />
        <Route path="/cargos/:id" element={<CargoDetailPage />} />
        <Route path="/offers" element={<DriverOffersListPage />} />
        <Route path="/offers/new" element={<RoleGate role="driver"><CreateDriverOfferPage /></RoleGate>} />
        <Route path="/offers/:id" element={<DriverOfferDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
