import { useState, Dispatch, SetStateAction } from 'react';
import { Upload, FileText, CheckCircle, List, User, Calendar, Plus, Loader2, Sparkles, AlertCircle, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Meeting, Project, ActionItem, ActionItemStatus, AnalysisResponse } from '../types';
import { cn, generateId } from '../lib/utils';

interface MeetingManagerProps {
  meetings: Meeting[];
  setMeetings: Dispatch<SetStateAction<Meeting[]>>;
  projectId: string;
  projects: Project[];
}

export default function MeetingManager({ meetings, setMeetings, projectId, projects }: MeetingManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId === 'all' ? projects[0]?.id || '' : projectId);

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!analysis || !meetingTitle) return;

    const newMeetingId = generateId();
    const newMeeting: Meeting = {
      id: newMeetingId,
      title: meetingTitle,
      date: new Date().toISOString(),
      projectId: selectedProjectId,
      participants: analysis.participants,
      decisions: analysis.decisions,
      summary: analysis.summary,
      transcript: transcript,
      actionItems: analysis.actionItems.map(ai => ({
        id: generateId(),
        task: ai.task,
        assignee: ai.assignee || '미지정',
        dueDate: ai.dueDate || '미정',
        status: ActionItemStatus.TODO,
        meetingId: newMeetingId,
        projectId: selectedProjectId,
      })),
    };

    setMeetings([newMeeting, ...meetings]);
    setAnalysis(null);
    setTranscript('');
    setMeetingTitle('');
  };

  const deleteMeeting = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  const filteredMeetings = projectId === 'all' ? meetings : meetings.filter(m => m.projectId === projectId);

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">새 회의 기록 분석</h2>
            <p className="text-slate-500">녹취록 텍스트를 붙여넣거나 회의 내용을 입력하여 AI 분석을 시작하세요.</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="회의 내용을 입력하거나 녹취록 텍스트를 붙여넣으세요..."
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none text-slate-700"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !transcript.trim()}
                className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                AI 분석 시작
              </button>
              <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl space-y-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="회의 제목을 입력하세요"
                  className="text-2xl font-bold text-slate-900 w-full outline-none placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium outline-none"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  onClick={handleSave}
                  disabled={!meetingTitle}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  회의 저장
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" /> 참석자
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.participants.map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{p}</span>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <List className="w-4 h-4 text-amber-500" /> 결정사항
                  </h3>
                  <ul className="space-y-2">
                    {analysis.decisions.map((d, i) => (
                      <li key={i} className="text-slate-700 text-sm flex gap-2">
                        <span className="text-slate-300 font-bold">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> 액션 아이템 (AI)
                  </h3>
                  <div className="space-y-2">
                    {analysis.actionItems.map((ai, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center gap-4">
                        <div className="text-sm font-medium text-slate-800">{ai.task}</div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">{ai.assignee}</span>
                          <span className="text-xs text-red-500 font-bold">{ai.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> 요약
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    "{analysis.summary}"
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">저장된 회의 목록</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <motion.div
              layout
              key={meeting.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{meeting.projectId}</div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMeeting(meeting.id)}
                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight">{meeting.title}</h4>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                <Calendar className="w-4 h-4" />
                <span>{new Date(meeting.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                  {meeting.participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {p.substring(0, 1)}
                    </div>
                  ))}
                  {meeting.participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +{meeting.participants.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  AI {meeting.actionItems.length}개
                </div>
              </div>
            </motion.div>
          ))}
          {filteredMeetings.length === 0 && (
            <div className="col-span-full py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8" />
              <p>기록된 회의가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
