import { motion } from "framer-motion";

const tickerItems = [
  { emoji: "🟢", text: "New Pothole verified in Mumbai", category: "pothole" },
  { emoji: "🟤", text: "Waste Dump flagged in Lagos", category: "waste" },
  { emoji: "🔵", text: "Water contamination detected in Chennai", category: "water" },
  { emoji: "🟢", text: "Road damage reported in São Paulo", category: "pothole" },
  { emoji: "🟤", text: "Illegal dumping site found in Jakarta", category: "waste" },
  { emoji: "🔵", text: "Coastal pollution alert in Manila", category: "water" },
  { emoji: "🟢", text: "Infrastructure hazard in Cairo", category: "pothole" },
  { emoji: "🟤", text: "Waste accumulation in Dhaka", category: "waste" },
];

const LiveTicker = () => {
  return (
    <div className="relative w-full overflow-hidden py-4 glass border-y border-border/30">
      {/* Left Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      
      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Ticker Content */}
      <div className="flex animate-ticker">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 px-8 whitespace-nowrap"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-muted-foreground">{item.text}</span>
            <span className="mx-4 text-border">|</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;