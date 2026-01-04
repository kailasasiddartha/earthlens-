import { motion } from "framer-motion";
import { Globe, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border/30">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10  bg-accent/20 flex items-center justify-center">
                  <img src="/favicon.ico" alt="Earth Lens Logo" className="rounded-xl w-15 h-12" />
            </div>
            <div>
              <span className="font-bold text-lg">Earth Lens</span>
              <p className="text-xs text-muted-foreground">Planetary Pulse</p>
            </div>
          </motion.div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-accent transition-colors">About</a>
            <a href="#" className="hover:text-accent transition-colors">Documentation</a>
            <a href="#" className="hover:text-accent transition-colors">API</a>
            <a href="#" className="hover:text-accent transition-colors">Contact</a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {[Github, Twitter, Linkedin].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:border-accent/50 transition-colors"
              >
                <Icon className="w-4 h-4 text-muted-foreground hover:text-accent" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
          <p>© 2026 Earth Lens. Built for a healthier planet.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
