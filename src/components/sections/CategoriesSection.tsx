import { motion } from "framer-motion";
import { 
  Plug, 
  Lightbulb, 
  Camera, 
  Thermometer, 
  Bell, 
  Shield, 
  Mic, 
  Home, 
  Lock, 
  MoreHorizontal 
} from "lucide-react";

const categories = [
  { name: "Умные розетки", icon: Plug, count: 45, color: "from-cyan-500 to-blue-500" },
  { name: "Освещение", icon: Lightbulb, count: 62, color: "from-yellow-500 to-orange-500" },
  { name: "Видеокамеры", icon: Camera, count: 38, color: "from-purple-500 to-pink-500" },
  { name: "Датчики", icon: Thermometer, count: 54, color: "from-green-500 to-emerald-500" },
  { name: "Звонки", icon: Bell, count: 23, color: "from-red-500 to-rose-500" },
  { name: "Безопасность", icon: Shield, count: 31, color: "from-blue-500 to-indigo-500" },
  { name: "Голосовые помощники", icon: Mic, count: 18, color: "from-teal-500 to-cyan-500" },
  { name: "Хабы", icon: Home, count: 27, color: "from-violet-500 to-purple-500" },
  { name: "Умные замки", icon: Lock, count: 21, color: "from-amber-500 to-yellow-500" },
  { name: "Другое", icon: MoreHorizontal, count: 89, color: "from-slate-500 to-gray-500" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export function CategoriesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Каталог</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
            Категории <span className="text-gradient">устройств</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Более 400 устройств в 10 категориях. Сравнивайте цены, читайте обзоры, 
            выбирайте лучшие решения для вашего умного дома
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {categories.map((category, index) => (
            <motion.a
              key={index}
              href={`/catalog/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} p-2.5 mb-4 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow`}>
                <category.icon className="w-full h-full text-white" />
              </div>
              
              {/* Content */}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.count} устройств
              </p>
              
              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
