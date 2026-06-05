import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, MessageSquare, ChevronDown, Send, Mail, MessageCircle, Bug, Lightbulb } from 'lucide-react';

const FAQS = [
  {
    q: '如何添加新的植物？',
    a: '点击首页右下角的"+"按钮，进入添加植物页面。填写植物名称、种类和浇水频率，选择一张图片即可完成添加。',
  },
  {
    q: '浇水提醒是如何工作的？',
    a: '根据您设置的浇水频率，系统会在应该浇水的前一天发送通知提醒。确保在设置中开启了浇水提醒通知权限。',
  },
  {
    q: '可以同时管理多少棵植物？',
    a: 'Verdant Guard 对植物数量没有限制，您可以添加任意数量的植物进行管理。',
  },
  {
    q: '如何删除一棵植物？',
    a: '进入植物详情页，点击右上角的"..."菜单，选择删除选项。删除后该植物的所有浇水记录也会一并清除。',
  },
  {
    q: '数据会自动同步吗？',
    a: '是的，所有数据都会自动云端同步。换设备登录同一账号后，您的植物和浇水记录都会保留。',
  },
];

const FEEDBACK_TYPES = [
  { icon: <Bug size={20} />, label: '报告问题', value: 'bug', color: '#ef4444' },
  { icon: <Lightbulb size={20} />, label: '功能建议', value: 'suggestion', color: '#f59e0b' },
  { icon: <MessageCircle size={20} />, label: '其他反馈', value: 'other', color: '#22c55e' },
];

export function HelpFeedbackScreen({ onBack }: { onBack: () => void }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('suggestion');
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feedback.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedback('');
        setContact('');
      }, 3000);
    }
  };

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
          帮助与反馈
        </h1>
      </div>

      {/* Hero */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(45,106,45,0.1) 0%, rgba(74,154,74,0.1) 100%)', border: '1px solid rgba(45,106,45,0.2)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #4a9a4a 100%)' }}
          >
            <HelpCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">遇到问题或有好建议？</p>
            <p className="text-muted-foreground text-xs mt-0.5">我们随时为您提供帮助</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-5 pb-6">
        <h2
          className="text-foreground mb-3"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1rem' }}
        >
          常见问题
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-foreground text-sm flex-1 pr-2">{faq.q}</span>
                <motion.div
                  animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="px-5 pb-10">
        <h2
          className="text-foreground mb-3"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1rem' }}
        >
          意见反馈
        </h2>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">反馈类型</label>
            <div className="grid grid-cols-3 gap-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: selectedType === type.value ? type.color : 'var(--border)',
                    background: selectedType === type.value ? `${type.color}10` : 'transparent',
                  }}
                >
                  <span style={{ color: type.color }}>{type.icon}</span>
                  <span className="text-foreground text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Content */}
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">反馈内容</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请详细描述您的问题或建议..."
              rows={4}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">联系方式（可选）</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="邮箱或微信"
                className="w-full bg-input-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!feedback.trim() || submitted}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
            style={{
              background: submitted ? '#22c55e' : feedback.trim() ? 'linear-gradient(135deg, #2d6a2d 0%, #4a9a4a 100%)' : 'var(--muted)',
              color: 'white',
            }}
          >
            {submitted ? (
              <>
                <Send size={16} />
                感谢您的反馈！
              </>
            ) : (
              <>
                <MessageSquare size={16} />
                提交反馈
              </>
            )}
          </motion.button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'var(--secondary)' }}>
          <p className="text-muted-foreground text-xs">
            发送邮件至 <span className="text-primary">support@verdantguard.com</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
