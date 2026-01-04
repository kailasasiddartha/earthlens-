import { motion } from "framer-motion";
import { Construction, Trash2, Waves, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Construction,
    title: "Infrastructure",
    subtitle: "Potholes & Road Safety",
    description: "Detect and map severe road damage using AI computer vision. Prioritize repairs and prevent accidents before they happen.",
    color: "text-muted-foreground",
    bgColor: "bg-secondary/30",
    borderColor: "border-secondary/50",
  },
  {
    icon: Trash2,
    title: "Waste Management",
    subtitle: "Illegal Dumps",
    description: "Identify unauthorized waste accumulation sites. Enable rapid municipal response and environmental protection.",
    color: "text-earth",
    bgColor: "bg-earth/10",
    borderColor: "border-earth/30",
  },
  {
    icon: Waves,
    title: "Ecology",
    subtitle: "Coastal Contamination",
    description: "Monitor water bodies for visible pollution and contamination. Protect aquatic ecosystems and public health.",
    color: "text-water",
    bgColor: "bg-water/10",
    borderColor: "border-water/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  },
};

const FeatureCards = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Categories. <span className="text-gradient">Infinite Impact.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI focuses on the most critical environmental and infrastructure hazards affecting communities worldwide.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`group relative glass-strong rounded-2xl p-8 ${feature.borderColor} hover:border-accent/50 transition-all duration-300`}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-accent text-sm font-medium mb-4">{feature.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Arrow */}
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-accent" />
              </div>

              {/* Bottom Glow on Hover */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCards;