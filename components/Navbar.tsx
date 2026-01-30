import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-blue-100">
          E-Commerce
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-blue-100">
            Home
          </Link>

          {session && (
            <Link href="/cart" className="hover:text-blue-100">
              Cart
            </Link>
          )}

          <div>
            {session ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm">{session.user?.name}</span>
                <button
                  data-testid="signout-button"
                  onClick={() => signOut()}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                data-testid="signin-button"
                onClick={() => signIn("credentials")}
                className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
