import { motion } from "framer-motion";
import { Construction, Trash2, Droplet, Layers } from "lucide-react";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All Issues", icon: Layers },
  { id: "pothole", label: "Potholes", icon: Construction },
  { id: "waste", label: "Waste", icon: Trash2 },
  { id: "water", label: "Water", icon: Droplet },
];

const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 p-2 glass-strong rounded-xl">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeFilter === filter.id
              ? "text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeFilter === filter.id && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-accent rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <filter.icon className="relative z-10 w-4 h-4" />
          <span className="relative z-10 text-sm font-medium hidden sm:inline">{filter.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default FilterBar;