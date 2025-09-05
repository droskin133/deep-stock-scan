import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DeepStockScan } from "@/components/DeepStockScan";

export default function DeepScan() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <DeepStockScan />;
}