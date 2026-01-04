import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, FileCheck, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RealMap from "@/components/dashboard/RealMap";
import FilterBar from "@/components/dashboard/FilterBar";
import IssuePanel from "@/components/dashboard/IssuePanel";
import { subscribeToVerifiedReports, subscribeToAllReports, Report } from "@/services/reportsService";
import { useAuth } from "@/contexts/AuthContext";

interface SelectedIssue {
  id: string;
  category: string;
  title: string;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
  status?: string;
}

const MapDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<SelectedIssue | null>(null);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    // Admin sees all reports, regular users see only verified
    const unsubscribe = isAdmin
      ? subscribeToAllReports((reports: Report[]) => {
        setReportCount(reports.length);
      })
      : subscribeToVerifiedReports((reports: Report[]) => {
        setReportCount(reports.length);
      });
    return () => unsubscribe();
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-30 p-4"
      >
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 glass rounded-xl hover:border-accent/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl">
              <Globe className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-sm">Earth Lens</p>
                <p className="text-xs text-muted-foreground">Live Dashboard</p>
              </div>
            </div>

            {/* Admin Badge */}
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Admin Mode</span>
              </div>
            )}
          </div>

          {/* Center - Filter Bar */}
          <FilterBar activeFilter={filter} onFilterChange={setFilter} />

          {/* Right - Report Progress */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl">
              <FileCheck className="w-5 h-5 text-success" />
              <div className="text-sm">
                <span className="font-bold text-success">{reportCount}</span>
                <span className="text-muted-foreground ml-1">
                  {isAdmin ? 'total' : 'verified'}
                </span>
              </div>
            </div>
            <button className="p-2.5 glass rounded-xl hover:border-accent/50 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Map */}
      <div className="absolute inset-0">
        <RealMap
          filter={filter}
          onMarkerClick={(marker) => setSelectedIssue(marker)}
          isAdmin={isAdmin}
        />
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 left-6 flex items-center gap-4"
      >
        <div className="px-4 py-3 glass-strong rounded-xl">
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'Total Reports' : 'Verified Reports'}
          </p>
          <p className="text-2xl font-bold text-accent">{reportCount}</p>
        </div>
        <div className="px-4 py-3 glass-strong rounded-xl hidden sm:block">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-2xl font-bold text-success">Live</p>
        </div>
        {isAdmin && (
          <div className="px-4 py-3 glass-strong rounded-xl hidden sm:block border border-amber-500/30">
            <p className="text-xs text-amber-500">Mode</p>
            <p className="text-2xl font-bold text-amber-500">Admin</p>
          </div>
        )}
      </motion.div>

      {/* Issue Detail Panel */}
      <IssuePanel
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default MapDashboard;