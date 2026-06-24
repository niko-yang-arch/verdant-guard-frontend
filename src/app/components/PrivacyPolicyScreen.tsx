import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Lock, Eye, UserCheck } from 'lucide-react';

const SECTIONS = [
  {
    icon: <Shield size={18} />,
    title: '信息收集',
    content: '绿植渴了会在您使用我的服务时收集您主动提供的信息，包括账户注册资料、植物信息、浇水记录等。我仅收集提供服务所必需的信息。',
  },
  {
    icon: <Lock size={18} />,
    title: '数据存储',
    content: '您的数据安全存储于加密服务器上。我采用行业标准的安全措施保护您的个人信息，防止未经授权的访问、使用或泄露。',
  },
  {
    icon: <Eye size={18} />,
    title: '信息使用',
    content: '我使用收集的信息来提供、维护和改进服务，包括植物养护提醒、数据统计分析和个性化用户体验。我不会将您的信息用于广告推送。',
  },
  {
    icon: <UserCheck size={18} />,
    title: '用户权利',
    content: '您有权访问、修改或删除您的个人数据。如有任何问题或请求，您可以通过帮助与反馈页面联系我，我将在30天内予以回复。',
  },
  {
    icon: <FileText size={18} />,
    title: '政策更新',
    content: '我会定期更新本隐私政策。任何重大变更将通过应用内通知或邮件提前告知。继续使用服务即表示您同意更新后的政策。',
  },
];

export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
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
        style={{ background: 'linear-gradient(160deg, #1a3a1a 0%, #2d6a2d 100%)' }}
      >
        <button onClick={onBack} className="p-1.5">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1
          className="flex-1 text-white"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' }}
        >
          隐私政策
        </h1>
      </div>

      {/* Hero */}
      <div className="px-5 py-8 text-center">
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #4a9a4a 100%)' }}
        >
          <Shield size={28} className="text-white" />
        </div>
        <h2
          className="text-foreground"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem' }}
        >
          您的隐私对我至关重要
        </h2>
        <p className="text-muted-foreground text-xs mt-2 max-w-xs mx-auto">
          本政策阐述了绿植渴了如何收集、使用和保护您的个人信息
        </p>
      </div>

      {/* Sections */}
      <div className="px-5 pb-10 space-y-4">
        {SECTIONS.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-primary">{section.icon}</span>
              <h3
                className="text-foreground font-medium"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1rem' }}
              >
                {section.title}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-6 pb-4"
        >
          <p className="text-muted-foreground text-xs">最后更新：2026年6月</p>
          <p className="text-muted-foreground text-xs mt-1">绿植渴了</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
