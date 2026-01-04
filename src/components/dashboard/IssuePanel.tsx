import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, CheckCircle, ExternalLink, Pencil, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteReport, completeHazard } from "@/services/reportsService";
import { toast } from "sonner";
import EditReportModal from "@/components/admin/EditReportModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IssuePanelProps {
  issue: {
    id: string;
    category: string;
    title: string;
    confidence: number;
    timestamp: string;
    imageUrl?: string;
    status?: string;
  } | null;
  onClose: () => void;
  isAdmin?: boolean;
}

const categoryLabels = {
  pothole: "Road Infrastructure",
  waste: "Waste Management",
  water: "Water Contamination",
  other: "Other Hazard",
};

const statusConfig = {
  verified: { label: "Verified", color: "text-success", bg: "bg-success/20", dot: "bg-success" },
  pending: { label: "Pending", color: "text-secondary", bg: "bg-secondary/20", dot: "bg-secondary" },
  rejected: { label: "Rejected", color: "text-destructive", bg: "bg-destructive/20", dot: "bg-destructive" },
};

const IssuePanel = ({ issue, onClose, isAdmin = false }: IssuePanelProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const status = issue?.status || 'verified';
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.verified;

  const handleDelete = async () => {
    if (!issue) return;
    setIsDeleting(true);
    try {
      await deleteReport(issue.id);
      toast.success("Report deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete report");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleComplete = async () => {
    if (!issue) return;
    setIsCompleting(true);
    try {
      await completeHazard(issue.id);
      toast.success("Hazard marked as completed and removed");
      onClose();
    } catch (error) {
      toast.error("Failed to complete hazard");
      console.error(error);
    } finally {
      setIsCompleting(false);
      setShowCompleteDialog(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {issue && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15 }}
            className="absolute top-4 right-4 bottom-4 w-80 glass-strong rounded-2xl border border-border/50 overflow-hidden z-40"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h3 className="font-semibold">Issue Details</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-card transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100%-60px)]">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-secondary/30 to-muted/30">
                {issue.imageUrl ? (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 ${statusInfo.bg} rounded-full flex items-center gap-1`}>
                  <div className={`w-1.5 h-1.5 ${statusInfo.dot} rounded-full`} />
                  <span className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <p className="text-sm text-accent font-medium mb-1">
                  {categoryLabels[issue.category as keyof typeof categoryLabels] || 'Other Hazard'}
                </p>
                <h4 className="text-lg font-semibold">{issue.title}</h4>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location on map</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{issue.timestamp}</span>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="text-accent font-medium">{issue.confidence}%</span>
                </div>
                <div className="h-2 bg-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${issue.confidence}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mb-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Admin Controls
                    </p>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Report
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10"
                      onClick={() => setShowCompleteDialog(true)}
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Completed Hazard
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Report
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <EditReportModal
        report={showEditModal ? issue : null}
        onClose={() => setShowEditModal(false)}
        onSave={() => { }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Hazard Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the hazard as resolved and remove it from the map and database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Complete & Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IssuePanel;

