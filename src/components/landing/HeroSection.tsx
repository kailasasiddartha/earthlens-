import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, LogOut, Camera, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { isAdmin, adminSignOut } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Auth Button */}
      <div className="absolute top-6 right-6 z-20">
        {isAdmin ? (
          <Button
            variant="outline"
            onClick={() => adminSignOut()}
            className="gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          >
            <LogOut className="w-4 h-4" />
            Admin Logout
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Shield className="w-4 h-4" />
            Admin Login
          </Button>
        )}
      </div>

      {/* Scanning Grid Background */}
      <div className="absolute inset-0 animate-grid opacity-30" />

      {/* Scan Line Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent animate-scan opacity-60" />
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background))_70%)]" />

      {/* Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-accent/30"
          >
            <Scan className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">AI-Powered Environmental Monitoring</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-foreground">See the </span>
            <span className="text-gradient glow-text">Unseen.</span>
            <br />
            <span className="text-foreground">Heal the </span>
            <span className="text-gradient glow-text">Earth.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            See it. Capture it. Change it
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="group bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg rounded-xl glow-border transition-all duration-300"
            >
              Launch Live Map
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/report")}
              className="group px-8 py-6 text-lg rounded-xl border-border/50 hover:bg-card/50 hover:border-accent/50 transition-all duration-300"
            >
              <Camera className="mr-2 w-5 h-5" />
              Report Hazard
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 max-w-xl mx-auto pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[
              { value: "50K+", label: "Issues Detected" },
              { value: "98%", label: "AI Accuracy" },
              { value: "120+", label: "Cities Active" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
