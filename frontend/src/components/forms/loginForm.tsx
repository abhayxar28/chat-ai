import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../schema/auth.schema";
import { useLogin } from "../../hooks/useLogin";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
        const {login: loginUser } = useLogin();
        await loginUser(data);
        toast.success("Logged in successful");
        navigate('/')
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || "Login failed";

            toast.error(message);
        } else {
            toast.error("Something went wrong");
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Login 
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}