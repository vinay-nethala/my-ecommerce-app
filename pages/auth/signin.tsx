import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
      } else {
        setError("Failed to sign in. Please check your credentials and try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">E-Commerce</h1>
        <h2 className="text-xl text-center text-gray-600 mb-8">Sign In</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            data-testid="signin-button"
            disabled={isLoading || !email || !password}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          disabled={isLoading}
          className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isLoading ? "Signing in..." : "GitHub"}
        </button>

        <p className="text-center text-gray-600 text-sm mt-6 text-xs">
          💡 Tip: Use any email and password to sign in (demo mode)
        </p>

        <p className="text-center text-gray-600 text-sm mt-4">
          New to E-Commerce?{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </p>
      </div>
    </div>
  );
}
