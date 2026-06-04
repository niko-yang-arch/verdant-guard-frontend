import { motion } from 'motion/react';
import { User, Bell, Moon, ChevronRight, LogOut, Shield, HelpCircle } from 'lucide-react';
import { User as UserType } from '../api';

function MenuItem({
  icon,
  label,
  value,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 text-left"
    >
      <span className={danger ? 'text-destructive' : 'text-muted-foreground'}>{icon}</span>
      <span className={`flex-1 text-sm ${danger ? 'text-destructive' : 'text-card-foreground'}`}>
        {label}
      </span>
      {value && <span className="text-muted-foreground text-xs mr-1">{value}</span>}
      <ChevronRight size={14} className="text-muted-foreground" />
    </button>
  );
}

export function ProfileScreen({
  user,
  plantCount = 0,
  totalWatered = 0,
  onLogout,
}: {
  user: UserType | null;
  plantCount?: number;
  totalWatered?: number;
  onLogout: () => void;
}) {
  const joinDays = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000)
    : 0;

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Profile hero - fixed */}
      <div
        className="px-5 pt-14 pb-8 shrink-0 relative"
        style={{ background: 'linear-gradient(160deg, #1a3a1a 0%, #2d6a2d 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30">
            <img
              src={`${user?.avatar ?? 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=128&h=128&fit=crop'}&w=128&h=128&fit=crop`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2
              className="text-white"
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' }}
            >
              {user?.nickname ?? '植物爱好者'}
            </h2>
            <p className="text-white/60 text-xs mt-0.5">ID: {user?.id?.slice(0, 12)}…</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: '我的植物', value: plantCount },
            { label: '累计浇水', value: totalWatered },
            { label: '加入天数', value: joinDays },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p
                className="text-white"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem' }}
              >
                {s.value}
              </p>
              <p className="text-white/60 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable menu */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-3 pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
      >
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <MenuItem icon={<User size={16} />} label="编辑个人资料" />
          <MenuItem icon={<Bell size={16} />} label="浇水提醒通知" value="已开启" />
          <MenuItem icon={<Moon size={16} />} label="深色模式" value="跟随系统" />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <MenuItem icon={<Shield size={16} />} label="隐私政策" />
          <MenuItem icon={<HelpCircle size={16} />} label="帮助与反馈" />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <MenuItem icon={<LogOut size={16} />} label="退出登录" danger onClick={onLogout} />
        </div>

        <p className="text-center text-muted-foreground text-xs pt-2">Verdant Guard v1.0</p>
      </div>
    </div>
  );
}