import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Model3D from '../components/ui/Model3D';
import Model3DErrorBoundary from '../components/ui/Model3DErrorBoundary';
import { 
  Upload, 
  FileText, 
  BrainCircuit, 
  Shield, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Upload,
      title: "Smart Document Upload",
      description: "Upload PDFs and documents with AI-powered analysis and organization",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "AI-Generated Notes",
      description: "Automatically generate comprehensive study notes from your materials",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BrainCircuit,
      title: "Interactive Quizzes",
      description: "Test your knowledge with personalized quizzes and assessments",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Campus Safety",
      description: "Access campus safety resources and emergency information",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-slate-900">
      {/* Header */}
      <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/mascot-dashboard.png"
                alt="LearnNest Mascot"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnNest
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-pink-600/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -180, -360],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp}>
            <motion.div
              className="relative mx-auto mb-8 w-96 h-96 md:w-[32rem] md:h-[32rem]"
              style={{ height: '50vh', width: '50vh', maxWidth: '32rem', maxHeight: '32rem' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              <Model3DErrorBoundary>
                <Model3D className="w-full h-full" autoRotate={true} />
              </Model3DErrorBoundary>
              {/* 3D Base Shadow */}
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-blue-200/20 rounded-full blur-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
              Study Smarter with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Power
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your learning experience with AI-powered study notes, interactive quizzes, 
              and intelligent document analysis. Your wise companion for academic success.
            </p>
            
            <div className="flex justify-center">
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2">
                  Sign In <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to enhance your learning journey and academic performance
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 group cursor-pointer">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div className="relative mx-auto mb-8 w-24 h-24">
              <motion.img 
                src="/mascot-chat.png"
                alt="LearnNest CTA"
                className="w-20 h-20 object-contain absolute top-2 left-2 drop-shadow-2xl"
                animate={{ 
                  rotateY: [0, 10, -10, 0],
                  z: [0, 20, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformStyle: "preserve-3d" }}
              />
              {/* Glowing effect */}
              <motion.div
                className="absolute inset-0 w-20 h-20 bg-white/20 rounded-full blur-lg top-2 left-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with LearnNest's AI-powered platform
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <img 
                src="/mascot.png"
                alt="LearnNest"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold">LearnNest</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                © 2025 LearnNest. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Your AI-powered learning companion
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
