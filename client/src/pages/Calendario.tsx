import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Tag,
  FileText,
  RefreshCw,
  AlertCircle,
  Quote,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useGoogleSheets, normalizeClientes } from '@/hooks/useGoogleSheets';
import { getDailyQuote } from '@/lib/quotes';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const SHEET_ID = '1Gkhy7jcxTb96NgrM7m2b1giu6zE7LE7GhEYxngyuALY';
const SHEET_GID = '2009268709';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h–19h

type ViewMode = 'month' | 'week' | 'day';
type TaskCategory = 'eventos' | 'clientes' | 'operacional' | 'pessoal';

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; bg: string; dot: string }> = {
  eventos:     { label: 'Evento',      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500'    },
  clientes:    { label: 'Cliente',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  operacional: { label: 'Operacional', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500'   },
  pessoal:     { label: 'Pessoal',     color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500'  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD
  time?: string;     // HH:MM
  category: TaskCategory;
  notes?: string;
  completed: boolean;
  fromSheet?: boolean;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'velloso_tasks_v2';

function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(d.getDate() - d.getDay());
  return copy;
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

interface TaskModalProps {
  task: Partial<Task> | null;
  defaultDate?: string;
  onSave: (t: Omit<Task, 'id'> & { id?: string }) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function TaskModal({ task, defaultDate, onSave, onClose, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [date, setDate] = useState(task?.date ?? defaultDate ?? toDateKey(new Date()));
  const [time, setTime] = useState(task?.time ?? '');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'operacional');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const isEdit = !!task?.id;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ id: task?.id, title: title.trim(), date, time: time || undefined, category, notes: notes || undefined, completed: task?.completed ?? false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#2D1B29] text-white">
          <h3 className="font-semibold">{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião com cliente"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Calendar className="inline w-3 h-3 mr-1" />Data
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Clock className="inline w-3 h-3 mr-1" />Horário
              </label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Tag className="inline w-3 h-3 mr-1" />Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, (typeof CATEGORY_CONFIG)[TaskCategory]][]).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setCategory(key)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                    category === key ? `${cfg.bg} ${cfg.color} border-current font-semibold` : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />{cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <FileText className="inline w-3 h-3 mr-1" />Observações
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anotações opcionais..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343] resize-none" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            {isEdit && onDelete && (
              <button type="button" onClick={() => { onDelete(task!.id!); onClose(); }}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-[#592343] text-white hover:bg-[#7a2f52] transition-colors font-semibold">
                {isEdit ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Task Chip ────────────────────────────────────────────────────────────────

function TaskChip({ task, onClick, onToggle }: { task: Task; onClick: () => void; onToggle: () => void }) {
  const cfg = CATEGORY_CONFIG[task.category];
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] cursor-pointer select-none transition-all hover:opacity-80',
        cfg.bg, cfg.color, task.completed && 'opacity-40 line-through')}>
      <button className="shrink-0 w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        {task.completed && <span className="block w-1 h-1 rounded-full bg-current" />}
      </button>
      <span className="truncate max-w-[110px]">{task.time ? `${task.time} ` : ''}{task.title}</span>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({ year, month, tasks, today, onDayClick, onTaskClick, onTaskToggle, onTaskDrop }:
  { year: number; month: number; tasks: Task[]; today: string; onDayClick: (k: string) => void;
    onTaskClick: (t: Task) => void; onTaskToggle: (id: string) => void; onTaskDrop: (id: string, date: string) => void }) {

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const cells: { dateKey: string; day: number; cur: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, cur: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, cur: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`, day: nextDay++, cur: false });
  }

  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => { if (!tasksByDate[t.date]) tasksByDate[t.date] = []; tasksByDate[t.date].push(t); });

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7" style={{ minHeight: 100 }}>
            {week.map(({ dateKey, day, cur }) => {
              const dayTasks = tasksByDate[dateKey] || [];
              const isToday = dateKey === today;
              const isDragOver = dragOver === dateKey;
              return (
                <div key={dateKey}
                  className={cn('border-r border-b border-gray-100 p-1.5 cursor-pointer transition-colors',
                    cur ? 'bg-white hover:bg-gray-50/80' : 'bg-gray-50/40',
                    isToday && 'bg-[#592343]/5',
                    isDragOver && 'ring-inset ring-2 ring-[#C9A84C]')}
                  onClick={() => onDayClick(dateKey)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(dateKey); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(null); if (draggingId) onTaskDrop(draggingId, dateKey); setDraggingId(null); }}>
                  <div className="mb-1">
                    <span className={cn('inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold',
                      isToday ? 'bg-[#592343] text-white' : cur ? 'text-gray-700' : 'text-gray-300')}>
                      {day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t.id} draggable
                        onDragStart={(e) => { e.stopPropagation(); setDraggingId(t.id); }}
                        onDragEnd={() => setDraggingId(null)}>
                        <TaskChip task={t} onClick={() => onTaskClick(t)} onToggle={() => onTaskToggle(t.id)} />
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] text-gray-400 pl-1 font-medium">+{dayTasks.length - 3} mais</p>
                    )}
                    {dayTasks.length === 0 && cur && (
                      <p className="text-[9px] text-gray-200 leading-tight truncate">
                        {getDailyQuote(Number(dateKey.split('-')[1]), Number(dateKey.split('-')[2])).slice(0, 45)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ weekStart, tasks, today, onSlotClick, onTaskClick, onTaskToggle }:
  { weekStart: Date; tasks: Task[]; today: string; onSlotClick: (k: string, h: number) => void;
    onTaskClick: (t: Task) => void; onTaskToggle: (id: string) => void }) {

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid sticky top-0 bg-white z-10 border-b border-gray-200 shadow-sm"
        style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        <div />
        {days.map((d) => {
          const key = toDateKey(d);
          const isToday = key === today;
          return (
            <div key={key} className={cn('py-2 text-center border-l border-gray-100', isToday && 'bg-[#592343]/5')}>
              <p className="text-[11px] text-gray-500 uppercase">{WEEKDAYS_SHORT[d.getDay()]}</p>
              <p className={cn('text-xl font-bold', isToday ? 'text-[#592343]' : 'text-gray-800')}>{d.getDate()}</p>
            </div>
          );
        })}
      </div>
      {HOURS.map((hour) => (
        <div key={hour} className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          <div className="text-right pr-2 text-[11px] text-gray-400 pt-1.5">{hour}:00</div>
          {days.map((d) => {
            const key = toDateKey(d);
            const isToday = key === today;
            const slotTasks = tasks.filter((t) => t.date === key && t.time?.startsWith(String(hour).padStart(2, '0')));
            return (
              <div key={key}
                className={cn('border-l border-t border-gray-100 min-h-[52px] p-0.5 cursor-pointer hover:bg-gray-50 transition-colors', isToday && 'bg-[#592343]/5')}
                onClick={() => onSlotClick(key, hour)}>
                {slotTasks.map((t) => {
                  const cfg = CATEGORY_CONFIG[t.category];
                  return (
                    <div key={t.id}
                      className={cn('text-xs rounded px-1.5 py-0.5 mb-0.5 border cursor-pointer truncate', cfg.bg, cfg.color, t.completed && 'opacity-50 line-through')}
                      onClick={(e) => { e.stopPropagation(); onTaskClick(t); }}>
                      {t.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({ date, tasks, onSlotClick, onTaskClick, onTaskToggle }:
  { date: Date; tasks: Task[]; onSlotClick: (h: number) => void;
    onTaskClick: (t: Task) => void; onTaskToggle: (id: string) => void }) {

  const quote = getDailyQuote(date.getMonth() + 1, date.getDate());
  const allDay = tasks.filter((t) => !t.time);

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-4 mt-4 mb-3 p-4 bg-gradient-to-r from-[#2D1B29] to-[#592343] rounded-xl text-white">
        <div className="flex items-start gap-2">
          <Quote className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A84C]" />
          <p className="text-sm italic leading-snug">{quote}</p>
        </div>
      </div>
      {allDay.length > 0 && (
        <div className="mx-4 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dia todo</p>
          <div className="flex flex-wrap gap-1.5">
            {allDay.map((t) => <TaskChip key={t.id} task={t} onClick={() => onTaskClick(t)} onToggle={() => onTaskToggle(t.id)} />)}
          </div>
        </div>
      )}
      <div className="mx-4">
        {HOURS.map((hour) => {
          const slotTasks = tasks.filter((t) => t.time?.startsWith(String(hour).padStart(2, '0')));
          return (
            <div key={hour} className="flex gap-3 border-t border-gray-100 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2"
              onClick={() => onSlotClick(hour)}>
              <span className="text-xs text-gray-400 w-10 shrink-0 pt-0.5 font-medium">{String(hour).padStart(2, '0')}:00</span>
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {slotTasks.map((t) => (
                  <TaskChip key={t.id} task={t} onClick={() => onTaskClick(t)} onToggle={() => onTaskToggle(t.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Calendario() {
  const today = toDateKey(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, new Date().getMonth(), new Date().getDate()));
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modal, setModal] = useState<{ open: boolean; task: Partial<Task> | null; defaultDate?: string }>({ open: false, task: null });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { rows, loading: sheetsLoading, error: sheetsError, refresh } = useGoogleSheets(SHEET_ID, SHEET_GID, 60000);

  // Merge Google Sheets clients into calendar as read-only tasks
  useEffect(() => {
    if (!rows.length) return;
    const clients = normalizeClientes(rows);
    const sheetTasks: Task[] = clients
      .filter((c) => c.nome && c.dataInicio)
      .map((c) => {
        const raw = c.dataInicio || '';
        let dateKey = toDateKey(new Date());
        const match = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (match) {
          const [, d, m, y] = match;
          const year = y.length === 2 ? `20${y}` : y;
          dateKey = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return {
          id: `sheet_${c.nome}`,
          title: `${c.nome}${c.etapa ? ` — ${c.etapa}` : ''}`,
          date: /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : toDateKey(new Date()),
          category: 'clientes' as TaskCategory,
          completed: ['concluído','fechado','finalizado'].some((s) => c.status?.toLowerCase().includes(s)),
          fromSheet: true,
          notes: c.etapa || c.observacoes || '',
        };
      });
    setTasks((prev) => [...prev.filter((t) => !t.fromSheet), ...sheetTasks]);
  }, [rows]);

  useEffect(() => { saveTasks(tasks.filter((t) => !t.fromSheet)); }, [tasks]);

  function navigate(dir: 1 | -1) {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else if (view === 'week') d.setDate(d.getDate() + 7 * dir);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  }

  function headerLabel() {
    if (view === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const ws = startOfWeek(currentDate);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      return `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()].slice(0, 3)} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()].slice(0, 3)} ${we.getFullYear()}`;
    }
    return `${WEEKDAYS_FULL[currentDate.getDay()]}, ${currentDate.getDate()} de ${MONTH_NAMES[currentDate.getMonth()]}`;
  }

  function openNew(dateKey?: string, hour?: number) {
    const time = hour !== undefined ? `${String(hour).padStart(2, '0')}:00` : undefined;
    setModal({ open: true, task: time ? { time } : null, defaultDate: dateKey ?? toDateKey(currentDate) });
  }
  function openEdit(t: Task) { if (!t.fromSheet) setModal({ open: true, task: t }); }
  function saveTask(t: Omit<Task, 'id'> & { id?: string }) {
    if (t.id) setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, ...t, id: t.id! } : x));
    else setTasks((prev) => [...prev, { ...t, id: nanoid() }]);
    setModal({ open: false, task: null });
  }
  function deleteTask(id: string) { setTasks((prev) => prev.filter((t) => t.id !== id)); }
  function toggleTask(id: string) { setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)); }
  function dropTask(id: string, newDate: string) { setTasks((prev) => prev.map((t) => t.id === id && !t.fromSheet ? { ...t, date: newDate } : t)); }

  const selectedTasks = selectedKey ? tasks.filter((t) => t.date === selectedKey) : [];
  const todayTasks = tasks.filter((t) => t.date === today);
  const todayDone = todayTasks.filter((t) => t.completed).length;

  return (
    <Layout title="Calendário">
      <div className="flex h-[calc(100vh-65px)] overflow-hidden">
        {/* Main calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => navigate(1)} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => setCurrentDate(new Date())}
                className="ml-1 px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 font-medium">
                Hoje
              </button>
            </div>
            <h2 className="text-sm font-bold text-[#2D1B29] min-w-[200px]">{headerLabel()}</h2>
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                    view === v ? 'bg-white text-[#592343] shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
                </button>
              ))}
            </div>
            <button onClick={() => openNew()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nova Tarefa
            </button>
            <button onClick={refresh}
              className={cn('p-1.5 rounded transition-colors', sheetsError ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100')}
              title={sheetsError ?? 'Atualizar planilha'}>
              {sheetsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : sheetsError ? <AlertCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          </div>

          {/* Quote + stats bar */}
          <div className="bg-gradient-to-r from-[#2D1B29] to-[#592343] px-4 py-2 flex items-center gap-3 text-white text-xs">
            <Quote className="w-3 h-3 text-[#C9A84C] shrink-0" />
            <span className="italic truncate flex-1">{getDailyQuote(new Date().getMonth() + 1, new Date().getDate())}</span>
            <div className="flex items-center gap-4 shrink-0 text-white/80">
              <span>Hoje: {todayDone}/{todayTasks.length} tarefas</span>
              {rows.length > 0 && !sheetsError && <span className="text-emerald-300">● {rows.length} na planilha</span>}
              {sheetsError && <span className="text-amber-300">● Planilha offline</span>}
            </div>
          </div>

          {/* Calendar body */}
          {view === 'month' && (
            <MonthView year={currentDate.getFullYear()} month={currentDate.getMonth()}
              tasks={tasks} today={today}
              onDayClick={(k) => { setSelectedKey(k === selectedKey ? null : k); }}
              onTaskClick={openEdit} onTaskToggle={toggleTask} onTaskDrop={dropTask} />
          )}
          {view === 'week' && (
            <WeekView weekStart={startOfWeek(currentDate)} tasks={tasks} today={today}
              onSlotClick={(k, h) => openNew(k, h)} onTaskClick={openEdit} onTaskToggle={toggleTask} />
          )}
          {view === 'day' && (
            <DayView date={currentDate} tasks={tasks.filter((t) => t.date === toDateKey(currentDate))}
              onSlotClick={(h) => openNew(toDateKey(currentDate), h)} onTaskClick={openEdit} onTaskToggle={toggleTask} />
          )}

          {/* Legend */}
          <div className="border-t border-gray-100 bg-white px-4 py-1.5 flex items-center gap-4 text-xs text-gray-500">
            {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, (typeof CATEGORY_CONFIG)[TaskCategory]][]).map(([k, cfg]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />{cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* Day detail sidebar */}
        <AnimatePresence>
          {selectedKey && view === 'month' && (
            <motion.aside
              key="detail"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
              <div className="px-4 py-3 bg-[#2D1B29] text-white flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">
                    {(() => { const d = parseDate(selectedKey); return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`; })()}
                  </p>
                  <p className="text-xs text-white/60">{selectedTasks.length} tarefa{selectedTasks.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setSelectedKey(null)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Frase do dia */}
              <div className="mx-3 mt-3 p-3 bg-[#592343]/5 rounded-lg border border-[#592343]/10">
                <p className="text-[10px] font-bold text-[#592343] uppercase tracking-wider mb-1">Frase do dia</p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  {(() => { const [, m, d] = selectedKey.split('-').map(Number); return getDailyQuote(m, d); })()}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Nenhuma tarefa</p>
                    <button onClick={() => openNew(selectedKey)} className="mt-2 text-xs text-[#592343] hover:underline">
                      + Adicionar
                    </button>
                  </div>
                ) : selectedTasks.map((t) => {
                  const cfg = CATEGORY_CONFIG[t.category];
                  return (
                    <div key={t.id} className={cn('p-2.5 rounded-lg border text-xs', cfg.bg)}>
                      <div className="flex items-start gap-2">
                        <button onClick={() => toggleTask(t.id)}
                          className={cn('w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0', cfg.color, 'border-current')}>
                          {t.completed && <span className="block w-1.5 h-1.5 rounded-full bg-current" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-semibold truncate', cfg.color, t.completed && 'line-through opacity-60')}>{t.title}</p>
                          {t.time && <p className="text-gray-500 text-[10px]">{t.time}</p>}
                          {t.notes && <p className="text-gray-500 text-[10px] truncate">{t.notes}</p>}
                          {t.fromSheet && <span className="text-[9px] bg-gray-200 text-gray-500 px-1 rounded">planilha</span>}
                        </div>
                        {!t.fromSheet && (
                          <button onClick={() => openEdit(t)} className="p-0.5 text-gray-400 hover:text-gray-600">
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-gray-100">
                <button onClick={() => openNew(selectedKey)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-[#592343] border border-[#592343]/30 rounded-lg hover:bg-[#592343]/5 transition-colors font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Adicionar tarefa
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {modal.open && (
          <TaskModal task={modal.task} defaultDate={modal.defaultDate}
            onSave={saveTask} onClose={() => setModal({ open: false, task: null })} onDelete={deleteTask} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
