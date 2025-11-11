"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconEye,
  IconTrash,
  IconBan,
  IconX,
} from "@tabler/icons-react";

interface CommentReport {
  id: string;
  commentId: string;
  reporterAddress: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  comment: {
    content: string;
    userAddress: string;
    marketId: string;
  };
}

export default function ModerationPage() {
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchReports();
  }, [filter]);

  // Get API base URL (use env var or default to localhost for dev)
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_APP_API_URL || "http://localhost:3001";

  async function fetchReports() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/reports?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  async function hideComment(commentId: string, reason: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/hide-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, reason }),
      });

      if (res.ok) {
        toast.success("Comment hidden successfully");
        fetchReports();
      } else {
        toast.error("Failed to hide comment");
      }
    } catch (error) {
      toast.error("Error hiding comment");
    }
  }

  async function deleteComment(commentId: string, reason: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/delete-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, reason }),
      });

      if (res.ok) {
        toast.success("Comment deleted successfully");
        fetchReports();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.error("Error deleting comment");
    }
  }

  async function banUser(
    userAddress: string,
    reason: string,
    duration: string,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/ban-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress, reason, duration }),
      });

      if (res.ok) {
        toast.success(
          `User banned for ${
            duration === "permanent" ? "permanently" : duration + " days"
          }`,
        );
        fetchReports();
      } else {
        toast.error("Failed to ban user");
      }
    } catch (error) {
      toast.error("Error banning user");
    }
  }

  async function dismissReport(reportId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/moderation/dismiss-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, reason: "False alarm" }),
      });

      if (res.ok) {
        toast.success("Report dismissed");
        fetchReports();
      } else {
        toast.error("Failed to dismiss report");
      }
    } catch (error) {
      toast.error("Error dismissing report");
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewed":
        return "secondary";
      case "dismissed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getReasonBadgeVariant = (reason: string) => {
    switch (reason) {
      case "spam":
        return "destructive";
      case "offensive":
        return "destructive";
      case "abuse":
        return "destructive";
      default:
        return "outline";
    }
  };

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
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comment Moderation</CardTitle>
                  <CardDescription>
                    Review and moderate reported comments
                  </CardDescription>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No {filter} reports found
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Comment</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="max-w-[300px]">
                            <p className="truncate text-sm">
                              {report.comment.content}
                            </p>
                            {report.details && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {report.details}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {report.comment.userAddress.slice(0, 6)}...
                            {report.comment.userAddress.slice(-4)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {report.comment.marketId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getReasonBadgeVariant(report.reason)}
                            >
                              {report.reason}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {report.reporterAddress.slice(0, 6)}...
                            {report.reporterAddress.slice(-4)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(report.status)}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {report.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    hideComment(report.commentId, report.reason)
                                  }
                                >
                                  <IconEye className="mr-1 h-4 w-4" />
                                  Hide
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    deleteComment(
                                      report.commentId,
                                      report.reason,
                                    )
                                  }
                                >
                                  <IconTrash className="mr-1 h-4 w-4" />
                                  Delete
                                </Button>
                                <Select
                                  onValueChange={(duration) =>
                                    banUser(
                                      report.comment.userAddress,
                                      report.reason,
                                      duration,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Ban user..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">
                                      <div className="flex items-center">
                                        <IconBan className="mr-2 h-4 w-4" />
                                        Ban 1 day
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="7">
                                      <div className="flex items-center">
                                        <IconBan className="mr-2 h-4 w-4" />
                                        Ban 7 days
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="30">
                                      <div className="flex items-center">
                                        <IconBan className="mr-2 h-4 w-4" />
                                        Ban 30 days
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="permanent">
                                      <div className="flex items-center">
                                        <IconAlertTriangle className="mr-2 h-4 w-4" />
                                        Permanent
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => dismissReport(report.id)}
                                >
                                  <IconX className="mr-1 h-4 w-4" />
                                  Dismiss
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
