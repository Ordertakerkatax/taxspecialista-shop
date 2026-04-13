import Link from "next/link";
import { AuthLink } from "./auth-link";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-gray-900 font-[Inter] hover:text-teal-600 transition-colors">
          TaxSpecialista Consult
        </Link>
        <AuthLink />
      </div>
    </header>
  );
}
