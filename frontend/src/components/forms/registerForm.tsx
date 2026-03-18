import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../../schema/auth.schema";
import { useRegister } from "../../hooks/useRegister";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    const { register: registerUser } = useRegister();
    await registerUser(data);
    toast("Signed in successfully");
    navigate('/')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Create Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              {...register("fullName.firstName")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
            {errors.fullName?.firstName && (
              <p className="text-red-500 text-sm">{errors.fullName.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              {...register("fullName.lastName")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
            {errors.fullName?.lastName && (
              <p className="text-red-500 text-sm">{errors.fullName.lastName.message}</p>
            )}
          </div>

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
            Sign Up
          </button>

        </form>

      </div>
    </div>
  );
}