import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Gift, ListTodo } from 'lucide-react';
import { useLocation } from 'wouter';
import { EVENTS_BY_MONTH, MONTH_NAMES, type EventType } from '@/lib/events';

interface SelectedDay {
  month: number;
  day: number;
}

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

// Função para obter o dia da semana do primeiro dia do mês
const getFirstDayOfMonth = (month: number, year: number = 2026) => {
  return new Date(year, month - 1, 1).getDay();
};

// Função para obter o número de dias no mês
const getDaysInMonth = (month: number, year: number = 2026) => {
  return new Date(year, month, 0).getDate();
};

const getEventTypeIcon = (type: EventType) => {
  switch (type) {
    case 'birthday':
      return '🎂';
    case 'holiday':
      return '🇮🇹';
    case 'special':
      return '⭐';
    default:
      return '📅';
  }
};

const getEventTypeLabel = (type: EventType) => {
  switch (type) {
    case 'birthday':
      return 'Aniversário';
    case 'holiday':
      return 'Feriado/Comemoração';
    case 'special':
      return 'Evento Especial';
    default:
      return 'Evento';
  }
};

export default function Home() {
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(3); // Março
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const year = 2026;

  const monthEvents = EVENTS_BY_MONTH[currentMonth] || {};
  const firstDayOfWeek = getFirstDayOfMonth(currentMonth, year);
  const daysInMonth = getDaysInMonth(currentMonth, year);

  // Ajustar para segunda-feira como primeiro dia
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const selectedDayEvents = selectedDay && selectedDay.month === currentMonth 
    ? monthEvents[selectedDay.day] || [] 
    : [];

  const hasSpecialEvents = Object.values(monthEvents).some(events =>
    events.some(e => e.type !== 'birthday')
  );

  const nextMonth = () => {
    setCurrentMonth(currentMonth === 12 ? 1 : currentMonth + 1);
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentMonth(currentMonth === 1 ? 12 : currentMonth - 1);
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header with Italian flag accent */}
      <div className="relative">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#00924a]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#ce2b37]"></div>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/Capturadetela2025-11-13155450_8257b24a.png" 
              alt="Velloso Cidadania Logo" 
              className="h-32 w-auto"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2">
            VELLOSO
          </h1>
          <p className="text-lg text-muted-foreground tracking-widest mb-8">
            CIDADANIA
          </p>
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Calendário de Eventos
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            2026
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/tarefas')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <ListTodo className="w-5 h-5" />
              Gerador de Tarefas
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                
                <h3 className="text-2xl font-bold text-primary">
                  {MONTH_NAMES[currentMonth - 1]}
                </h3>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="w-6 h-6 text-primary" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center font-bold text-primary text-sm md:text-base py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="space-y-2">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 gap-2">
                    {week.map((day, dayIdx) => {
                      const dayEvents = day ? monthEvents[day] : null;
                      const hasEvents = dayEvents && dayEvents.length > 0;
                      const hasSpecialEvent = hasEvents && dayEvents.some(e => e.type !== 'birthday');
                      const isSelected = selectedDay?.day === day && selectedDay?.month === currentMonth;

                      return (
                        <button
                          key={`${weekIdx}-${dayIdx}`}
                          onClick={() => day && setSelectedDay({ month: currentMonth, day })}
                          className={`
                            aspect-square rounded-lg p-2 text-sm font-semibold
                            transition-all duration-200 relative
                            ${!day ? 'bg-transparent' : ''}
                            ${day && !hasEvents
                              ? 'bg-secondary text-foreground hover:bg-muted cursor-pointer border border-border'
                              : ''
                            }
                            ${day && hasSpecialEvent
                              ? 'bg-gradient-to-br from-[#ce2b37]/15 to-[#ce2b37]/5 text-primary hover:from-[#ce2b37]/25 hover:to-[#ce2b37]/15 cursor-pointer border-2 border-[#ce2b37]'
                              : ''
                            }
                            ${day && hasEvents && !hasSpecialEvent
                              ? 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 cursor-pointer border-2 border-primary'
                              : ''
                            }
                            ${isSelected
                              ? 'ring-2 ring-primary ring-offset-2'
                              : ''
                            }
                          `}
                        >
                          {day && (
                            <>
                              <div>{day}</div>
                              {hasEvents && (
                                <div className="absolute top-1 right-1 flex gap-0.5">
                                  {hasSpecialEvent && (
                                    <div className="w-2 h-2 bg-[#ce2b37] rounded-full"></div>
                                  )}
                                  {dayEvents.some(e => e.type === 'birthday') && (
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-bold text-primary text-sm mb-3">Legenda</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary"></div>
                    <span>Aniversários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-[#ce2b37]/15 to-[#ce2b37]/5 border-2 border-[#ce2b37]"></div>
                    <span>Eventos Especiais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary border border-border"></div>
                    <span>Sem eventos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 sticky top-4">
              <h3 className="text-2xl font-bold text-primary mb-4">
                {selectedDay ? `${selectedDay.day} de ${MONTH_NAMES[currentMonth - 1]}` : 'Selecione um dia'}
              </h3>
              
              <div className="border-t-2 border-primary pt-4">
                {selectedDay && selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`
                          p-3 rounded-lg text-sm
                          ${event.type === 'special'
                            ? 'bg-[#ce2b37]/10 text-[#ce2b37] border border-[#ce2b37]/30'
                            : event.type === 'holiday'
                            ? 'bg-[#00924a]/10 text-[#00924a] border border-[#00924a]/30'
                            : 'bg-primary/10 text-primary border border-primary/30'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                          <div>
                            <div className="font-semibold">{event.name}</div>
                            <div className="text-xs opacity-75">{getEventTypeLabel(event.type)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDay ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum evento neste dia
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Clique em um dia do calendário para ver os eventos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Events List for Current Month */}
        {Object.keys(monthEvents).length > 0 && (
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-3xl font-bold text-primary mb-6">
                Destaques de {MONTH_NAMES[currentMonth - 1]}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(monthEvents)
                  .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                  .map(([day, events]) => (
                    <div key={day} className="border-l-4 border-primary pl-4 py-2">
                      <div className="font-bold text-primary mb-1">
                        {day} de {MONTH_NAMES[currentMonth - 1]}
                      </div>
                      <div className="space-y-1">
                        {events.map((event, idx) => (
                          <div
                            key={idx}
                            className={`text-sm flex items-center gap-2 ${
                              event.type === 'birthday'
                                ? 'text-foreground'
                                : event.type === 'special'
                                ? 'text-[#ce2b37] font-semibold'
                                : 'text-[#00924a] font-semibold'
                            }`}
                          >
                            <span>{getEventTypeIcon(event.type)}</span>
                            {event.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 bg-primary text-white py-8">
        <div className="container text-center">
          <p className="text-lg font-semibold">
            VELLOSO CIDADANIA
          </p>
          <p className="text-sm text-white/80 mt-1">
            Assessoria em Cidadania Italiana
          </p>
        </div>
      </div>
    </div>
  );
}
