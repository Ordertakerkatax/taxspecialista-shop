import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { linkSessionsByEmail, getUserSessions } from "@/lib/account";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AccountHistoryPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Link any anonymous sessions with matching email to this account (Gap 3)
  await linkSessionsByEmail(user.id, user.emailAddresses[0].emailAddress);

  const sessions = await getUserSessions(user.id);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base mb-4">
          No consultations found. Complete a consultation and create an account
          to see your history here.
        </p>
        <Link
          href="/"
          className="text-teal-600 hover:text-teal-700 hover:underline text-sm font-medium"
        >
          Start a Consultation
        </Link>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Consultation History
      </h2>

      {sessions.map((session) => {
        const isExpired = new Date(session.expiresAt) < now;
        const formattedDate = new Intl.DateTimeFormat("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(session.activatedAt));

        return (
          <div
            key={session.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">
                  {session.tier === "comprehensive" ? "Comprehensive" : "Basic"}
                </Badge>
                {isExpired ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs border">
                    Expired
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs border">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/account/history/${session.id}`}
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium"
              >
                View Chat
              </Link>
              <a
                href={`/api/account/summary?sessionId=${session.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-700 hover:underline font-medium"
              >
                Download Summary
              </a>
              <a
                href={`/api/account/transcript?sessionId=${session.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-700 hover:underline font-medium"
              >
                Download Transcript
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
