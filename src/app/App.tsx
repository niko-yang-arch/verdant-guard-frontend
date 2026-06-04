import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, CalendarDays, User } from 'lucide-react';
import { Plant, User as UserType, daysUntilNextWater, authLogin, authMe, getPlantList, addWaterLog, deletePlant, addPlant as apiAddPlant } from './api';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { DetailScreen } from './components/DetailScreen';
import { AddPlantScreen } from './components/AddPlantScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { ProfileScreen } from './components/ProfileScreen';

type Tab = 'home' | 'calendar' | 'profile';

const NAV: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: '首页' },
  { id: 'calendar', icon: CalendarDays, label: '日历' },
  { id: 'profile', icon: User, label: '我的' },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [tab, setTab] = useState<Tab>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
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

  const handleWater = async (plantId: number) => {
    try {
      await addWaterLog(plantId);
      setPlants((ps) =>
        ps.map((p) =>
          p.id === plantId
            ? { ...p, lastWatered: new Date().toISOString(), historyCount: p.historyCount + 1 }
            : p
        )
      );
      if (selectedPlant?.id === plantId) {
        setSelectedPlant((p) => p ? { ...p, lastWatered: new Date().toISOString(), historyCount: p.historyCount + 1 } : null);
      }
    } catch (e: any) {
      alert('浇水失败: ' + e.message);
    }
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

  const handleAddPlant = async (data: { name: string; species: string; frequency: number; frequencyType: 'DAYS' | 'TIMES_PER_DAY'; image?: string }) => {
    try {
      const newPlant = await apiAddPlant(data);
      setPlants((ps) => [newPlant, ...ps]);
      setShowAdd(false);
    } catch (e: any) {
      alert('添加失败: ' + e.message);
    }
  };

  const totalWatered = plants.reduce((s, p) => s + p.historyCount, 0);

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'DM Sans', sans-serif", overscrollBehavior: 'none' }}
    >
        <AnimatePresence mode="wait">
          {!loggedIn ? (
            <motion.div
              key="login"
              className="min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginScreen onLogin={handleLogin} />
            </motion.div>
          ) : (
            <div className="min-h-screen relative">
              {/* Tab content with bottom padding */}
              <div className="min-h-screen pb-[70px]">
                <AnimatePresence mode="wait">
                  {tab === 'home' && (
                    <motion.div
                      key="home"
                      className="min-h-screen"
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
                      className="min-h-screen"
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
                      className="min-h-screen"
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
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Overlays */}
              <AnimatePresence>
                {selectedPlant && (
                  <DetailScreen
                    key="detail"
                    plant={selectedPlant}
                    onBack={() => setSelectedPlant(null)}
                    onDelete={handleDelete}
                    onWater={handleWater}
                  />
                )}
                {showAdd && (
                  <AddPlantScreen
                    key="add"
                    onBack={() => setShowAdd(false)}
                    onSave={handleAddPlant}
                  />
                )}
              </AnimatePresence>

              {/* Bottom nav - fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 border-t border-border backdrop-blur-sm flex items-center pb-6 pt-2 px-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
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
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}