import { motion } from 'motion/react';
import { ArrowLeft, Leaf, Heart, Mail } from 'lucide-react';

const FEATURES = [
  {
    icon: <Heart size={20} />,
    title: '用心呵护',
    description: '记录每一次浇水，见证植物成长的点点滴滴',
  }
];

const TEAM_MEMBERS = [
  {
    name: 'AI旋转矩阵',
    role: '产品设计与开发',
    avatar: 'https://plants-watering.oss-cn-hangzhou.aliyuncs.com/plants/my-icon/%E6%88%91.jpg',
  },
];

export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 bg-background z-50 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", touchAction: 'pan-y', overscrollBehavior: 'contain' }}
    >
      {/* Header */}
      <div
        className="px-5 pt-6 pb-5 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: 'linear-gradient(135deg, #2d5a2d 0%, #1a3a1a 100%)' }}
      >
        <button onClick={onBack} className="p-1.5">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1
          className="flex-1 text-white"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' }}
        >
          开发者信息
        </h1>
      </div>

      {/* Hero Section */}
      <div className="px-5 py-6">
        <div 
          className="rounded-3xl p-6 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #4a9a4a 50%, #6ab86a 100%)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Leaf size={32} className="text-white" />
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-medium mb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            绿植渴了
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-sm max-w-xs mx-auto"
          >
            让植物养护更简单，让绿色生活更美好
          </motion.p>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 py-4">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-foreground font-medium mb-4"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem' }}
        >
          为什么选择我
        </motion.h3>
        
        <div className="grid gap-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}
              >
                <span className="text-primary">{feature.icon}</span>
              </div>
              <div>
                <h4 className="text-foreground font-medium text-sm">{feature.title}</h4>
                <p className="text-muted-foreground text-xs mt-1">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="px-5 py-4">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-foreground font-medium mb-4"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem' }}
        >
          我是谁
        </motion.h3>
        
        <div className="flex gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex-1 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-border">
                <img
                  src={`${member.avatar}?w=100&h=100&fit=crop`}
                  className="w-full h-full object-cover"
                  alt={member.name}
                />
              </div>
              <p className="text-foreground text-sm font-medium mt-2">{member.name}</p>
              <p className="text-muted-foreground text-xs">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      

      {/* Contact */}
      <div className="px-5 pt-3 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-card border border-border rounded-2xl px-5 py-4 text-center"
        >
          <Mail size={22} className="mx-auto text-primary mb-2" />
          <h4 className="text-foreground font-medium mb-1.5">联系我</h4>
          <p className="text-muted-foreground text-sm">296831450@qq.com</p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <p className="text-center text-muted-foreground text-xs">
          © 2026 绿植渴了. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}
