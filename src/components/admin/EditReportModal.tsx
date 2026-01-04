import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateReport } from "@/services/reportsService";
import { toast } from "sonner";

interface EditReportModalProps {
    report: {
        id: string;
        title: string;
        category: string;
        status?: string;
    } | null;
    onClose: () => void;
    onSave: () => void;
}

const EditReportModal = ({ report, onClose, onSave }: EditReportModalProps) => {
    const [title, setTitle] = useState(report?.title || "");
    const [category, setCategory] = useState(report?.category || "other");
    const [status, setStatus] = useState(report?.status || "verified");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!report) return;

        setIsLoading(true);
        try {
            await updateReport(report.id, {
                title,
                category,
                status,
            });
            toast.success("Report updated successfully");
            onSave();
            onClose();
        } catch (error) {
            toast.error("Failed to update report");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {report && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-strong rounded-2xl border border-border/50 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border/30">
                                <h3 className="font-semibold text-lg">Edit Report</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-card transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Report title"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pothole">🕳️ Pothole</SelectItem>
                                            <SelectItem value="waste">🗑️ Waste/Garbage</SelectItem>
                                            <SelectItem value="water">💧 Water Pollution</SelectItem>
                                            <SelectItem value="other">⚠️ Other Hazard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="verified">✓ Verified</SelectItem>
                                            <SelectItem value="pending">⏳ Pending</SelectItem>
                                            <SelectItem value="rejected">✕ Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 p-4 border-t border-border/30">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditReportModal;
