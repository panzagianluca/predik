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

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./dashboard/data.json";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
