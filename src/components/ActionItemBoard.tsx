import { useState, Dispatch, SetStateAction } from 'react';
import { motion, Reorder } from 'motion/react';
import { CheckCircle2, Clock, AlertCircle, Calendar, User, MoreVertical, Plus } from 'lucide-react';
import { Meeting, ActionItem, ActionItemStatus } from '../types';
import { cn } from '../lib/utils';

interface ActionItemBoardProps {
  meetings: Meeting[];
  setMeetings: Dispatch<SetStateAction<Meeting[]>>;
  projectId: string;
}

export default function ActionItemBoard({ meetings, setMeetings, projectId }: ActionItemBoardProps) {
  const allActionItems = meetings.flatMap(m => m.actionItems);
  const filteredActionItems = projectId === 'all' ? allActionItems : allActionItems.filter(ai => ai.projectId === projectId);

  const columns = [
    { id: ActionItemStatus.TODO, label: '할 일', icon: Plus, color: 'text-slate-400' },
    { id: ActionItemStatus.IN_PROGRESS, label: '진행 중', icon: Clock, color: 'text-amber-500' },
    { id: ActionItemStatus.COMPLETED, label: '완료', icon: CheckCircle2, color: 'text-green-500' },
    { id: ActionItemStatus.DELAYED, label: '지연됨', icon: AlertCircle, color: 'text-red-500' },
  ];

  const updateStatus = (itemId: string, newStatus: ActionItemStatus) => {
    setMeetings(meetings.map(m => ({
      ...m,
      actionItems: m.actionItems.map(ai => ai.id === itemId ? { ...ai, status: newStatus } : ai)
    })));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)] overflow-hidden">
      {columns.map((col) => {
        const items = filteredActionItems.filter(ai => ai.status === col.id);

        return (
          <div key={col.id} className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <col.icon className={cn("w-5 h-5", col.color)} />
                <h3 className="font-bold text-slate-900">{col.label}</h3>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-300" />
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 space-y-4 overflow-y-auto border border-slate-100/50">
              {items.map((item) => (
                <motion.div
                  layoutId={item.id}
                  key={item.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{item.task}</p>
                    <div className="relative">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as ActionItemStatus)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{item.assignee}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 text-[11px] font-bold",
                      col.id === ActionItemStatus.DELAYED ? "text-red-500" : "text-slate-400"
                    )}>
                      <Calendar className="w-3 h-3" />
                      <span>{item.dueDate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-xs font-medium">
                  항목 없음
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
