import { LogOut } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { useLogout } from "../../hooks/useLogout";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user } = useProfile();
    const { logout } = useLogout();
    const navigate = useNavigate();
    const initials = user?.fullName.firstName
        .split(" ")
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleLogout = async() => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate('/login')
        } catch (error) {
            toast.error("Failed to log out");  
        }
    }

    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
        
        <div className="flex items-center space-x-3">
            
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-black shadow-lg shadow-black/20">
            {initials}
            </div>

            <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-stone-100">{user?.fullName.firstName} {user?.fullName.lastName}</span>
            
            <span
                className="text-xs text-stone-400"
            >
                Free Plan
            </span>
            </div>
        </div>


            <button className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-200 transition-all duration-200 hover:bg-white/10" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
            </button>
        </div>
    );
}