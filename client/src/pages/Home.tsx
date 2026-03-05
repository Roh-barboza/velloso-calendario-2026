import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  day: number;
  names: string[];
}

const EVENTS: Record<number, string[]> = {
  1: ["MARIANE SANTOS CARVALHO"],
  2: ["FABÍOLA STEFANY LIMA VALADARES"],
  4: ["CRISTIANE LOPES DE ASSUNÇÃO"],
  5: ["Thaina Vicente"],
  6: ["Noah Yohan Massaneiro Soares"],
  7: ["Isabella Claro Grizzo", "Olivia Harue Goncalves", "Julie Correia Lula"],
  8: ["Lala perin Soethe", "Dia da Mulher"],
  11: ["Janaina Carla Abra Santos", "BEATRIZ FINCO IRIZAGA DA COSTA"],
  12: ["Ana Luiza de Oliveira Domingues"],
  14: ["Lucas Biondo"],
  15: ["Dia do Consumidor"],
  16: ["Adilço Norberto Melotto"],
  18: ["IZABELLA ZIMMERMANN MACIEL"],
  19: ["Joiciany Pereira Cândido", "Dia do Artesão"],
  20: ["Juliana Passalacqua Ricci"],
  21: ["LUCA MENEGOTTO CASTILLO", "RODRIGO SOARES SANTANA JUNIOR"],
  22: ["Giselle Maria Coelho Schelbauer", "Débora Cerretti", "Dia Mundial da Água"],
  23: ["Adolfo Amaral Franco"],
  25: ["Richard Cinacchi Gracetti", "Dantedì"],
  26: ["Rodrigo Brolez Antonello"],
  27: ["Jonathan Diego nava"],
  29: ["Jean Felipe Micheletto Costa", "Douglas Barbarino"],
  31: ["Willian Costa Souza"],
};

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // March 2026 starts on Sunday (day 1 = Sunday)
  // First day of March 2026 is Sunday
  const daysInMonth = 31;
  const firstDayOfWeek = 0; // 0 = Sunday, but we need Monday as first
  
  // Adjust: March 1, 2026 is a Sunday, so we need to shift
  const startingDayIndex = 6; // Sunday = 6 in our 0-indexed weekday array (SEG=0, DOM=6)
  
  const calendarDays: (number | null)[] = [];
  
  // Add empty slots for days before the month starts
  for (let i = 0; i < startingDayIndex; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const selectedDayEvents = selectedDay && EVENTS[selectedDay] ? EVENTS[selectedDay] : [];

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
            <svg width="100" height="100" viewBox="0 0 200 200" className="text-primary">
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 60 80 Q 70 70 80 75 Q 90 70 100 75 Q 110 70 120 75 Q 130 70 140 80" 
                    fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 70 120 Q 85 110 100 115 Q 115 110 130 120" 
                    fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2">
            VELLOSO
          </h1>
          <p className="text-lg text-muted-foreground tracking-widest mb-8">
            CIDADANIA
          </p>
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Calendário de Eventos
          </h2>
          <p className="text-xl text-muted-foreground">
            Março 2026
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
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
                    {week.map((day, dayIdx) => (
                      <button
                        key={`${weekIdx}-${dayIdx}`}
                        onClick={() => day && setSelectedDay(day)}
                        className={`
                          aspect-square rounded-lg p-2 text-sm font-semibold
                          transition-all duration-200 relative
                          ${!day ? 'bg-transparent' : ''}
                          ${day && !EVENTS[day]
                            ? 'bg-secondary text-foreground hover:bg-muted cursor-pointer border border-border'
                            : ''
                          }
                          ${day && EVENTS[day]
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 cursor-pointer border-2 border-primary'
                            : ''
                          }
                          ${selectedDay === day
                            ? 'ring-2 ring-primary ring-offset-2'
                            : ''
                          }
                        `}
                      >
                        {day && (
                          <>
                            <div>{day}</div>
                            {EVENTS[day] && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 sticky top-4">
              <h3 className="text-2xl font-bold text-primary mb-4">
                {selectedDay ? `${selectedDay} de Março` : 'Selecione um dia'}
              </h3>
              
              <div className="border-t-2 border-primary pt-4">
                {selectedDay && selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`
                          p-3 rounded-lg text-sm
                          ${event.includes('Dia') || event.includes('Festa') || event.includes('Dantedì')
                            ? 'bg-[#ce2b37]/10 text-[#ce2b37] border border-[#ce2b37]/30'
                            : 'bg-primary/10 text-primary border border-primary/30'
                          }
                        `}
                      >
                        {event}
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

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-border space-y-3">
                <h4 className="font-bold text-primary text-sm">Legenda</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary"></div>
                    <span>Com evento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary border border-border"></div>
                    <span>Sem evento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Events List */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-3xl font-bold text-primary mb-6">
              Destaques do Mês
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(EVENTS)
                .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                .map(([day, events]) => (
                  <div key={day} className="border-l-4 border-primary pl-4 py-2">
                    <div className="font-bold text-primary mb-1">
                      {day} de Março
                    </div>
                    <div className="space-y-1">
                      {events.map((event, idx) => (
                        <div
                          key={idx}
                          className={`text-sm ${
                            event.includes('Dia') || event.includes('Festa') || event.includes('Dantedì')
                              ? 'text-[#ce2b37] font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          • {event}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
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
