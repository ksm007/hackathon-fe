import { motion } from "framer-motion";
import { Upload, FileText, BrainCircuit, Shield } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router-dom";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const NavigationCard = ({
  title,
  description,
  icon: Icon,
  href,
  color,
}: NavigationCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Link to={href}>
      <Card className="relative overflow-hidden group cursor-pointer h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <motion.div
            className={`p-6 rounded-full ${color} shadow-lg`}
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon size={48} />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {description}
            </p>
          </div>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

export default function DashboardPage() {
  const navigationCards = [
    {
      title: "Upload",
      description:
        "Upload your study materials and documents for AI processing",
      icon: Upload,
      href: "/uploads",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      title: "Notes",
      description:
        "View and manage your AI-generated study notes and summaries",
      icon: FileText,
      href: "/notes",
      color:
        "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
    },
    {
      title: "Quizzes",
      description:
        "Test your knowledge with personalized quizzes and assessments",
      icon: BrainCircuit,
      href: "/quizzes",
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    },
    {
      title: "Campus Safety",
      description: "Access campus safety resources and emergency information",
      icon: Shield,
      href: "/campus-safety",
      color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
    },
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome Back
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose what you'd like to do today. Your learning journey continues
          here.
        </p>
      </motion.div>

      {/* Navigation Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {navigationCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1 * index,
              type: "spring",
              stiffness: 100,
            }}
          >
            <NavigationCard {...card} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
