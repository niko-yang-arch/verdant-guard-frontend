import { Component, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, CalendarDays, User } from 'lucide-react';
import { Plant, User as UserType, WaterLog, authLogin, authMe, getPlantList, getPlantInfo, addWaterLog, deletePlant, addPlant as apiAddPlant, updatePlant } from './api';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { DetailScreen } from './components/DetailScreen';
import { AddPlantScreen } from './components/AddPlantScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EditPlantScreen } from './components/EditPlantScreen';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { HelpFeedbackScreen } from './components/HelpFeedbackScreen';
import { AboutScreen } from './components/AboutScreen';

type Tab = 'home' | 'calendar' | 'profile';

const NAV: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: '首页' },
  { id: 'calendar', icon: CalendarDays, label: '日历' },
  { id: 'profile', icon: User, label: '我的' },
];

class OverlayErrorBoundary extends Component<
  { children: ReactNode; onBack: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Overlay render failed', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center px-6 text-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <p className="text-foreground text-base font-medium">页面出了点问题</p>
        <p className="text-muted-foreground text-sm mt-2">请返回后重新打开帮助与反馈。</p>
        <button
          onClick={this.props.onBack}
          className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm"
        >
          返回
        </button>
      </div>
    );
  }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [tab, setTab] = useState<Tab>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlantList();
      setPlants(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadPlants();
      authMe().then(setUser).catch(() => {});
    }
  }, [loggedIn, loadPlants]);

  const handleLogin = async (code: string) => {
    try {
      const { token, user: userData } = await authLogin(code);
      localStorage.setItem('token', token);
      setUser(userData);
      setLoggedIn(true);
    } catch (e: any) {
      alert('登录失败: ' + e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPlants([]);
    setLoggedIn(false);
  };

  const handleWater = async (plantId: number): Promise<WaterLog> => {
    const waterLog = await addWaterLog(plantId);
    const wateredAt = waterLog.date || new Date().toISOString();

    setPlants((ps) =>
      ps.map((p) =>
        p.id === plantId
          ? { ...p, lastWatered: wateredAt, historyCount: p.historyCount + 1, todayCount: (p.todayCount ?? 0) + 1 }
          : p
      )
    );

    if (selectedPlant?.id === plantId) {
      setSelectedPlant((p) => p ? { ...p, lastWatered: wateredAt, historyCount: p.historyCount + 1, todayCount: (p.todayCount ?? 0) + 1 } : null);
    }

    try {
      const [latestPlants, latestPlant] = await Promise.all([
        getPlantList(),
        getPlantInfo(plantId).catch(() => null),
      ]);
      setPlants(latestPlants);
      if (latestPlant) {
        setSelectedPlant((p) => (p?.id === plantId ? latestPlant : p));
      }
    } catch {
      // The local state has already been updated; keep the UI responsive if a refresh fails.
    }

    return waterLog;
  };

  const handleDetailBack = () => {
    setSelectedPlant(null);
    loadPlants();
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlant(id);
      setPlants((ps) => ps.filter((p) => p.id !== id));
      setSelectedPlant(null);
    } catch (e: any) {
      alert('删除失败: ' + e.message);
    }
  };

  const handleAddPlant = async (data: { name: string; species: string; frequency: number; frequencyType: 'DAYS' | 'TIMES_PER_DAY'; image?: string | null }) => {
    try {
      let newPlant = await apiAddPlant(data);
      if (newPlant.historyCount === undefined || newPlant.historyCount === null) {
        newPlant = { ...newPlant, historyCount: 0 };
      }
      setPlants((ps) => [newPlant, ...ps]);
      getPlantList().then(setPlants).catch(() => {});
      setShowAdd(false);
    } catch (e: any) {
      alert('添加失败: ' + e.message);
    }
  };

  const handleEditPlant = async (id: number, data: { name: string; species: string; frequency: number; frequencyType: 'DAYS' | 'TIMES_PER_DAY'; image?: string | null }) => {
    try {
      let updatedPlant = await updatePlant(id, data);
      if (updatedPlant.historyCount === undefined || updatedPlant.historyCount === null) {
        const original = plants.find(p => p.id === id);
        updatedPlant = { ...updatedPlant, historyCount: original?.historyCount || 0 };
      }
      setPlants((ps) => ps.map((p) => (p.id === id ? updatedPlant : p)));
      getPlantList().then(setPlants).catch(() => {});
      if (selectedPlant?.id === id) {
        setSelectedPlant(updatedPlant);
      }
      setEditingPlant(null);
    } catch (e: any) {
      alert('修改失败: ' + e.message);
    }
  };

  const totalWatered = plants.reduce((s, p) => s + (p.historyCount || 0), 0);

  return (
    <div
      className="h-screen bg-background overflow-hidden"
      style={{ 
        fontFamily: "'DM Sans', sans-serif",
        touchAction: 'pan-y',
        overscrollBehavior: 'contain'
      }}
    >
        <AnimatePresence mode="wait">
          {!loggedIn ? (
            <motion.div
              key="login"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginScreen onLogin={handleLogin} />
            </motion.div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Tab content - 直接在这里设置滚动 */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {tab === 'home' && (
                    <motion.div
                      key="home"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <HomeScreen
                        plants={plants}
                        loading={loading}
                        error={error}
                        user={user}
                        onPlantClick={setSelectedPlant}
                        onAddClick={() => setShowAdd(true)}
                        onRefresh={loadPlants}
                      />
                    </motion.div>
                  )}
                  {tab === 'calendar' && (
                    <motion.div
                      key="calendar"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CalendarScreen />
                    </motion.div>
                  )}
                  {tab === 'profile' && (
                    <motion.div
                      key="profile"
                      className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ProfileScreen
                        user={user}
                        plantCount={plants.length}
                        totalWatered={totalWatered}
                        onLogout={handleLogout}
                        onPrivacyPolicy={() => setShowPrivacy(true)}
                        onHelpFeedback={() => setShowHelp(true)}
                        onAbout={() => setShowAbout(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom nav */}
              <div className="shrink-0 z-50 bg-card/95 border-t border-border backdrop-blur-sm flex items-center pb-6 pt-2 px-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      data-testid={`nav-${item.id}`}
                      className="flex-1 flex flex-col items-center gap-0.5 py-1"
                    >
                      <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground'} />
                      <span
                        className="text-xs"
                        style={{
                          fontSize: '0.65rem',
                          color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Overlays */}
              <AnimatePresence>
                {selectedPlant && (
                  <DetailScreen
                    key="detail"
                    plant={selectedPlant}
                    onBack={handleDetailBack}
                    onDelete={handleDelete}
                    onWater={handleWater}
                    onEdit={setEditingPlant}
                  />
                )}
                {showAdd && (
                  <AddPlantScreen
                    key="add"
                    onBack={() => setShowAdd(false)}
                    onSave={handleAddPlant}
                  />
                )}
                {editingPlant && (
                  <EditPlantScreen
                    key="edit"
                    plant={editingPlant}
                    onBack={() => setEditingPlant(null)}
                    onSave={(data) => handleEditPlant(editingPlant.id, data)}
                  />
                )}
                {showPrivacy && (
                  <PrivacyPolicyScreen
                    key="privacy"
                    onBack={() => setShowPrivacy(false)}
                  />
                )}
                {showHelp && (
                  <OverlayErrorBoundary key="help" onBack={() => setShowHelp(false)}>
                    <HelpFeedbackScreen onBack={() => setShowHelp(false)} />
                  </OverlayErrorBoundary>
                )}
                {showAbout && (
                  <AboutScreen
                    key="about"
                    onBack={() => setShowAbout(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}
