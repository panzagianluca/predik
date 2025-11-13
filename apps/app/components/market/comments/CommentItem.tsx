"use client";

import { Comment } from "@/types/comment";
import { VoteButtons } from "./VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Trash2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/animate-ui/primitives/radix/dialog";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: Comment;
  userAddress?: string;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  isReply?: boolean;
}

// Helper to format comment text with markdown
const formatCommentText = (text: string) => {
  // Escape HTML to prevent XSS
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text** (must come FIRST before italic!)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Underline: __text__
  formatted = formatted.replace(/__(.+?)__/g, "<u>$1</u>");
  // Italic: *text* (single asterisk - after bold to avoid conflicts)
  formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Line breaks: \n
  formatted = formatted.replace(/\n/g, "<br>");

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export function CommentItem({
  comment,
  userAddress,
  onReply,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isReporting, setIsReporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Case-insensitive comparison for ownership check
  const isOwner =
    userAddress?.toLowerCase() === comment.userAddress.toLowerCase();
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Generate avatar from address if no custom avatar
  const avatarUrl =
    comment.avatarUrl ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.userAddress}`;

  logger.log("CommentItem rendering:", {
    username: comment.username,
    avatarUrl: comment.avatarUrl,
    generatedAvatarUrl: avatarUrl,
    userAddress: comment.userAddress,
  });

  const handleReport = async () => {
    if (!userAddress) {
      toast.error("Debes estar conectado para reportar");
      return;
    }

    if (!reportReason) {
      toast.error("Selecciona una razón");
      return;
    }

    setIsReporting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          reporterAddress: userAddress,
          reason: reportReason,
          details: reportDetails || null,
        }),
      });

      if (res.ok) {
        toast.success("Comentario reportado correctamente");
        setShowReportDialog(false);
        setReportReason("");
        setReportDetails("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al reportar");
      }
    } catch (error) {
      toast.error("Error al reportar comentario");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className={cn("border-t border-border", isReply && "ml-12 mt-2")}>
      <div className="py-4">
        {/* Header: Avatar, Username, Timestamp */}
        <div className="flex items-start gap-3 mb-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={avatarUrl}
              alt={comment.username || "User"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                ·{" "}
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>

            {/* Comment Content */}
            <div className="mt-1">
              <p className="text-sm">{formatCommentText(comment.content)}</p>

              {/* GIF if present */}
              {comment.gifUrl && (
                <div className="mt-2 max-w-xs">
                  <img
                    src={comment.gifUrl}
                    alt="GIF"
                    className="rounded-lg w-full"
                  />
                </div>
              )}
            </div>

            {/* Actions: Vote, Reply, Report, Delete */}
            <div className="flex items-center gap-4 mt-2">
              <VoteButtons
                commentId={comment.id}
                initialVotes={comment.votes}
                initialHasVoted={comment.hasVoted}
                userAddress={userAddress}
              />

              {!isReply && onReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-xs text-electric-purple hover:underline"
                >
                  <MessageSquare className="h-3 w-3" />
                  Responder
                </button>
              )}

              {!isOwner && userAddress && (
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 hover:underline"
                >
                  <Flag className="h-3 w-3" />
                  Reportar
                </button>
              )}

              {isOwner && onDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Report Dialog - With Animations */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogPortal>
            <DialogOverlay className="bg-black/50" />
            <DialogContent className="bg-background border border-border rounded-lg p-6 max-w-md w-full space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Reportar Comentario
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Selecciona una razón para reportar este comentario
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Razón</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="spam">Spam</option>
                    <option value="offensive">Ofensivo</option>
                    <option value="abuse">Abuso</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Detalles (opcional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Proporciona más información..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm min-h-[80px]"
                    maxLength={500}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowReportDialog(false);
                      setReportReason("");
                      setReportDetails("");
                    }}
                    disabled={isReporting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReport}
                    disabled={!reportReason || isReporting}
                    className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {isReporting ? "Reportando..." : "Reportar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogPortal>
            <DialogOverlay className="bg-black/50" />
            <DialogContent className="bg-background border border-border rounded-lg p-6 max-w-md w-full space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Eliminar Comentario
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  ¿Estás seguro de eliminar este comentario? Esta acción no se
                  puede deshacer.
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    if (!onDelete) return;
                    setIsDeleting(true);
                    try {
                      await onDelete(comment.id);
                      setShowDeleteDialog(false);
                    } catch (error) {
                      // Error already handled in parent
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Nested Replies */}
        {hasReplies && (
          <div className="mt-2">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                userAddress={userAddress}
                onDelete={onDelete}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
