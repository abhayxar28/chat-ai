import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../../hooks/useSession";

export default function PublicRoute() {
  const { session, loading } = useSession();

  if(loading){
    return(
      <div className="flex items-center justify-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}