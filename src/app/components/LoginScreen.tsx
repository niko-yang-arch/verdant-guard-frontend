import { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

export function LoginScreen({ onLogin }: { onLogin: (code: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Mock code — the backend accepts any code for dev purposes
      await onLogin('dev_mock_code_' + Date.now());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-full flex flex-col items-center justify-between px-8 py-16"
      style={{
        background: 'linear-gradient(160deg, #1a3a1a 0%, #2d6a2d 50%, #4a9e4a 100%)',
      }}
    >
      {/* Top illustration */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 120 }}
          className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center backdrop-blur-sm"
        >
          <Leaf size={44} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1
            className="text-white mb-2"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem' }}
          >
            绿植渴了
          </h1>
          <p className="text-white/60 text-sm">你的专属植物养护助手</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col gap-3 w-full mt-4"
        >
          {[
            { emoji: '💧', text: '智能浇水提醒，不再忘记' },
            { emoji: '📅', text: '日历视图，一目了然' },
            { emoji: '🤖', text: 'AI 养护建议，专业贴心' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span style={{ fontSize: '1.1rem' }}>{f.emoji}</span>
              <span className="text-white/80 text-sm">{f.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Login button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full space-y-3"
      >
        <button
          onClick={handleLogin}
          disabled={loading}
          data-testid="wechat-login-button"
          className="w-full py-4 rounded-2xl bg-white text-primary font-medium flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-60"
          style={{ color: '#2d6a2d' }}
        >
          <span style={{ fontSize: '1.1rem' }}>💬</span>
          {loading ? '登录中…' : '微信一键登录'}
        </button>
        <p className="text-white/40 text-xs text-center">登录即代表同意用户协议和隐私政策</p>
      </motion.div>
    </div>
  );
}
