import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Payment Verification",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {children}
      </div>
    </div>
  );
}
