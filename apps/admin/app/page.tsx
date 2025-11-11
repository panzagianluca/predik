import { db } from "@predik/database";
import {
  users,
  comments,
  marketProposals,
  commentReports,
} from "@predik/database/src/schema";
import { count, eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

/**
 * Admin Dashboard Home - Phase 3
 *
 * Displays key metrics and quick actions
 */

async function getDashboardStats() {
  // Get counts in parallel for performance
  const [totalUsers, totalComments, totalProposals, pendingReports] =
    await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(comments),
      db.select({ count: count() }).from(marketProposals),
      db
        .select({ count: count() })
        .from(commentReports)
        .where(eq(commentReports.status, "pending")),
    ]);

  return {
    totalUsers: totalUsers[0].count,
    totalComments: totalComments[0].count,
    totalProposals: totalProposals[0].count,
    pendingReports: pendingReports[0].count,
  };
}

export default async function AdminHomePage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Predik Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage platform content and moderation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered wallets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProposals}</div>
              <p className="text-xs text-muted-foreground">Market requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">Needs review</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/moderation">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Comment Moderation
                  {stats.pendingReports > 0 && (
                    <Badge variant="destructive">{stats.pendingReports}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Review reported comments and manage user bans
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/featured-markets">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Featured Markets</CardTitle>
                <CardDescription>
                  Pin up to 4 markets on homepage
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/proposals">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Proposals Review</CardTitle>
                <CardDescription>
                  Approve or reject market requests
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/announcements">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>
                  Create broadcast notifications
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/audit-log">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  View all admin actions history
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
