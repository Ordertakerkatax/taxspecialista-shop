import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <p className="text-sm font-semibold text-gray-700">TaxSpecialista Consult</p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
          This service provides AI-generated guidance for informational purposes only. It is not formal legal or tax advice and does not create a professional-client relationship.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link href="/privacy" className="text-teal-600 hover:underline">
            Privacy Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-teal-600 hover:underline">
            Terms of Service
          </Link>
          <span className="text-gray-300">|</span>
          <a
            href="mailto:support@taxspecialista.com"
            className="text-teal-600 hover:underline"
          >
            support@taxspecialista.com
          </a>
        </div>
        <p className="text-xs text-gray-400">
          &copy; {year} TaxSpecialista. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
