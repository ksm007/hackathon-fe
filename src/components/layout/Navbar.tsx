import { useState } from "react";
import { Button } from "../ui/button";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

interface NavbarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  useAuth();
  const [notifications] = useState(3);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm z-50">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl" 
          onClick={toggleSidebar}
        >
          <Menu />
        </Button>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <span className="text-white font-bold text-sm">L</span>
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Learn Hub
          </h1>
        </motion.div>
      </div>
      
     
    </header>
  );
}