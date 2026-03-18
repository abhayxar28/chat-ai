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
        <div className="flex items-center justify-between p-3 rounded-2xl">
        
        <div className="flex items-center space-x-3">
            
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
            {initials}
            </div>

            <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{user?.fullName.firstName} {user?.fullName.lastName}</span>
            
            <span
                className={`text-xs ${"text-gray-400"}`}
            >
                Free Plan
            </span>
            </div>
        </div>


            <button className="flex items-center space-x-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-xl transition-all duration-200" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
            </button>
        </div>
    );
}