export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2">
        <p className="text-sm font-semibold text-gray-700">TaxSpecialista Consult</p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
          This service provides AI-generated guidance for informational purposes only. It is not formal legal or tax advice and does not create a professional-client relationship.
        </p>
        <p className="text-xs text-gray-500">
          <a
            href="mailto:support@taxspecialista.com"
            className="text-teal-600 hover:underline"
          >
            support@taxspecialista.com
          </a>
        </p>
        <p className="text-xs text-gray-400">
          &copy; {year} TaxSpecialista. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
