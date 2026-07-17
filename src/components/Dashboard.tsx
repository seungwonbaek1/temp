import { BarChart3, CheckCircle2, Clock, AlertTriangle, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Meeting, ActionItem, ActionItemStatus } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  meetings: Meeting[];
  actionItems: ActionItem[];
  projectId: string;
}

export default function Dashboard({ meetings, actionItems, projectId }: DashboardProps) {
  const filteredMeetings = projectId === 'all' ? meetings : meetings.filter(m => m.projectId === projectId);
  const filteredActionItems = projectId === 'all' ? actionItems : actionItems.filter(ai => ai.projectId === projectId);

  const stats = [
    { label: '전체 회의', value: filteredMeetings.length, icon: BarChart3, color: 'blue' },
    { label: '진행중 액션 아이템', value: filteredActionItems.filter(ai => ai.status === ActionItemStatus.IN_PROGRESS).length, icon: Clock, color: 'amber' },
    { label: '완료된 항목', value: filteredActionItems.filter(ai => ai.status === ActionItemStatus.COMPLETED).length, icon: CheckCircle2, color: 'green' },
    { label: '지연된 항목', value: filteredActionItems.filter(ai => ai.status === ActionItemStatus.DELAYED).length, icon: AlertTriangle, color: 'red' },
  ];

  const recentMeetings = [...filteredMeetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-xl",
                stat.color === 'blue' && "bg-blue-50 text-blue-600",
                stat.color === 'amber' && "bg-amber-50 text-amber-600",
                stat.color === 'green' && "bg-green-50 text-green-600",
                stat.color === 'red' && "bg-red-50 text-red-600",
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">최근 회의</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              전체 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {recentMeetings.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{meeting.title}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-3">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{meeting.participants.length}명 참석</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600 font-medium">{meeting.projectId.toUpperCase()}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                등록된 회의가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* AI Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">액션 아이템 현황</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600">전체 완료율</span>
                <span className="text-slate-900">
                  {filteredActionItems.length > 0
                    ? Math.round((filteredActionItems.filter(ai => ai.status === ActionItemStatus.COMPLETED).length / filteredActionItems.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${filteredActionItems.length > 0
                      ? (filteredActionItems.filter(ai => ai.status === ActionItemStatus.COMPLETED).length / filteredActionItems.length) * 100
                      : 0}%`
                  }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>할 일 (Todo)</span>
                </div>
                <span className="text-sm font-bold">{filteredActionItems.filter(ai => ai.status === ActionItemStatus.TODO).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>진행 중</span>
                </div>
                <span className="text-sm font-bold">{filteredActionItems.filter(ai => ai.status === ActionItemStatus.IN_PROGRESS).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>지연됨</span>
                </div>
                <span className="text-sm font-bold">{filteredActionItems.filter(ai => ai.status === ActionItemStatus.DELAYED).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
