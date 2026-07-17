import { useState, useEffect } from 'react';
import { Layout, BarChart3, FileText, CheckCircle2, Search, Settings, Plus, Calendar, Clock, ChevronRight, Menu, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Meeting, ActionItem, ActionItemStatus } from './types';
import { cn, generateId } from './lib/utils';
import Dashboard from './components/Dashboard';
import MeetingManager from './components/MeetingManager';
import ActionItemBoard from './components/ActionItemBoard';
import History from './components/History';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meetings' | 'actions' | 'history'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([
    { id: 'chunmoo', name: '천무 (Chunmoo)', description: '다련장 로켓 시스템' },
    { id: 'lsam', name: 'L-SAM', description: '장거리 지대공 미사일' },
    { id: 'ramc', name: 'RAM-C', description: '신뢰도, 정비도, 가용성 분석' },
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const savedMeetings = localStorage.getItem('ips_smt_meetings');
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ips_smt_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const allActionItems = meetings.flatMap(m => m.actionItems);

  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'meetings', label: '회의 기록/추출', icon: FileText },
    { id: 'actions', label: '액션 아이템 추적', icon: CheckCircle2 },
    { id: 'history', label: '통합 이력 관리', icon: Search },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
            <Layout className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight"
            >
              IPS-SMT
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "group-hover:text-slate-900")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-4">
            {isSidebarOpen && (
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">프로젝트</span>
                <button className="text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
              </div>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedProjectId('all')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedProjectId === 'all' ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {isSidebarOpen ? "전체 프로젝트" : "전체"}
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    selectedProjectId === p.id ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{p.name}</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {isSidebarOpen ? (
              <>
                <X className="w-5 h-5" />
                <span className="font-medium text-sm">사이드바 닫기</span>
              </>
            ) : (
              <Menu className="w-5 h-5 mx-auto" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              <Search className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100">
              IPS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FDFDFF]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  meetings={meetings}
                  actionItems={allActionItems}
                  projectId={selectedProjectId}
                />
              )}
              {activeTab === 'meetings' && (
                <MeetingManager
                  meetings={meetings}
                  setMeetings={setMeetings}
                  projectId={selectedProjectId}
                  projects={projects}
                />
              )}
              {activeTab === 'actions' && (
                <ActionItemBoard
                  meetings={meetings}
                  setMeetings={setMeetings}
                  projectId={selectedProjectId}
                />
              )}
              {activeTab === 'history' && (
                <History
                  meetings={meetings}
                  projectId={selectedProjectId}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
