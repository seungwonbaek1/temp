import { useState } from 'react';
import { Search, Filter, Calendar, User, FileText, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { Meeting } from '../types';
import { cn } from '../lib/utils';

interface HistoryProps {
  meetings: Meeting[];
  projectId: string;
}

export default function History({ meetings, projectId }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'decision' | 'action'>('all');

  const filteredMeetings = (projectId === 'all' ? meetings : meetings.filter(m => m.projectId === projectId))
    .filter(m =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="회의 제목, 참여자, 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> 필터
          </button>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
            내보내기
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">회의 제목</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">프로젝트</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">일자</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">참석자</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMeetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{meeting.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{meeting.summary}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    {meeting.projectId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-1">
                    {meeting.participants.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                        {p.substring(0, 1)}
                      </div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                        +{meeting.participants.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-900 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMeetings.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <div>
              <p className="font-bold text-slate-900">검색 결과가 없습니다</p>
              <p className="text-sm text-slate-500">다른 키워드로 검색해 보세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
