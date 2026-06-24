import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, MessageSquare, ChevronDown, Send, Mail, MessageCircle, Bug, Lightbulb } from 'lucide-react';
import { getHelpFeedbackConfig, submitFeedback } from '../api';
import type { FeedbackType, HelpFaq } from '../api';

const DEFAULT_FAQS: HelpFaq[] = [
  {
    id: 'add-plant',
    question: '如何添加新的植物？',
    answer: '在首页点击右上角的绿色"+"按钮进入"添加新植物"页面。您可以上传植物图片，填写植物名称、植物种类，选择"单次/多天一次"或"一天多次"的浇水频率，最后保存即可。',
  },
  {
    id: 'watering-reminder',
    question: '浇水提醒是如何工作的？',
    answer: '系统会根据每株植物设置的浇水频率计算状态。首页会在"今日提醒"中显示今天需要浇水的植物，植物卡片和详情页也会显示"今天需要浇水"、"明天需要浇水"或"还有几天浇水"。',
  },
  {
    id: 'plant-limit',
    question: '可以同时管理多少棵植物？',
    answer: '目前界面没有设置植物数量上限。添加后的植物会出现在首页"我的植物"列表中，也可以通过顶部搜索框按植物名称或种类快速查找。',
  },
  {
    id: 'delete-plant',
    question: '如何删除一棵植物？',
    answer: '在首页点击植物卡片进入详情页，点击底部左侧的垃圾桶按钮，然后在弹窗中点击"确认删除"。删除后会同步清除该植物的所有浇水记录，且无法恢复。',
  },
  {
    id: 'cloud-sync',
    question: '数据会自动同步吗？',
    answer: '会。登录后，新增植物、编辑信息、记录浇水和删除植物都会保存到云端；重新进入应用或换设备登录同一账号后，会自动拉取您的植物和浇水记录。',
  },
];

const FEEDBACK_TYPES: { icon: React.ReactNode; label: string; value: FeedbackType; color: string }[] = [
  { icon: <Bug size={20} />, label: '报告问题', value: 'bug', color: '#ef4444' },
  { icon: <Lightbulb size={20} />, label: '功能建议', value: 'suggestion', color: '#f59e0b' },
  { icon: <MessageCircle size={20} />, label: '其他反馈', value: 'other', color: '#22c55e' },
];

export function HelpFeedbackScreen({ onBack }: { onBack: () => void }) {
  const [faqs, setFaqs] = useState<HelpFaq[]>(DEFAULT_FAQS);
  const [supportEmail, setSupportEmail] = useState('296831450@qq.com');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<FeedbackType>('suggestion');
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getHelpFeedbackConfig()
      .then((config) => {
        setFaqs(Array.isArray(config?.faqs) && config.faqs.length > 0 ? config.faqs : DEFAULT_FAQS);
        setSupportEmail(config.supportEmail || '296831450@qq.com');
      })
      .catch(() => {
        setFaqs(DEFAULT_FAQS);
      });
  }, []);

  const handleSubmit = async () => {
    const content = feedback.trim();
    if (!content || submitting) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await submitFeedback({
        type: selectedType,
        content,
        contact: contact.trim() || undefined,
      });
      setShowSuccessDialog(true);
    } catch (e: any) {
      setSubmitError(e.message || '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setFeedback('');
    setContact('');
    setShowSuccessDialog(false);
    onBack();
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
            <p className="text-muted-foreground text-xs mt-0.5">我随时为您提供帮助</p>
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
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-foreground text-sm flex-1 pr-2">{faq.question}</span>
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
                        {faq.answer}
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
                  type="button"
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!feedback.trim() || showSuccessDialog || submitting}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:active:scale-100"
            style={{
              background: feedback.trim() && !submitting && !showSuccessDialog ? 'linear-gradient(135deg, #2d6a2d 0%, #4a9a4a 100%)' : 'var(--muted)',
              color: 'white',
            }}
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageSquare size={16} />
              )}
            </span>
            <span>{submitting ? '提交中...' : '提交反馈'}</span>
          </button>
          {submitError && (
            <p className="text-destructive text-xs text-center">{submitError}</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'var(--secondary)' }}>
          <p className="text-muted-foreground text-xs">
            发送邮件至 <span className="text-primary">{supportEmail}</span>
          </p>
        </div>
      </div>

      {showSuccessDialog && (
        <div
          className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center px-6"
          role="presentation"
        >
          <div
            className="w-full max-w-sm bg-card border border-border rounded-2xl px-5 py-5 text-center shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-success-title"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Send size={22} className="text-primary" />
            </div>
            <h2 id="feedback-success-title" className="text-card-foreground text-base font-medium">
              感谢反馈！
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              您的反馈我已经收到，会认真查看并持续优化绿植渴了。
            </p>
            <button
              type="button"
              onClick={handleSuccessConfirm}
              className="w-full mt-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-[0.98] transition-transform"
            >
              确认
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
