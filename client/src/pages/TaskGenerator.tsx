import { useState } from 'react';
import { Download, CheckCircle2, Circle, Trash2, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { EVENTS_BY_MONTH, MONTH_NAMES, getTasksForArtCreation } from '@/lib/events';

interface Task {
  id: string;
  month: number;
  day: number;
  name: string;
  type: 'special' | 'holiday';
  completed: boolean;
}

export default function TaskGenerator() {
  const [, navigate] = useLocation();
  const [tasks, setTasks] = useState<Task[]>(() => {
    return getTasksForArtCreation()
      .filter(task => task.type !== 'birthday')
      .map((task, idx) => ({
        id: `${task.month}-${task.day}-${idx}`,
        month: task.month,
        day: task.day,
        name: task.name,
        type: task.type as 'special' | 'holiday',
        completed: false,
      }));
  });

  const [showLogo, setShowLogo] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const completionPercentage = Math.round((completedCount / tasks.length) * 100);

  const downloadTasks = () => {
    const csv = [
      ['Mês', 'Dia', 'Data', 'Evento', 'Tipo', 'Status'],
      ...tasks.map(task => [
        MONTH_NAMES[task.month - 1],
        task.day,
        `${task.day} de ${MONTH_NAMES[task.month - 1]}`,
        task.name,
        task.type === 'special' ? 'Evento Especial' : 'Feriado/Comemoração',
        task.completed ? 'Concluído' : 'Pendente',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', 'tarefas-artes-velloso.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const monthKey = task.month;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <div className="relative">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#00924a]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#ce2b37]"></div>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-secondary rounded-lg transition-colors mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Calendário
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            Gerador de Tarefas
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Crie artes para os eventos especiais de 2026
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-primary">Progresso</span>
              <span className="text-sm font-semibold text-primary">{completedCount}/{tasks.length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-[#ce2b37] h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{completionPercentage}% concluído</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={downloadTasks}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Baixar Lista (CSV)
            </button>
            <button
              onClick={() => setShowLogo(!showLogo)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-primary rounded-lg hover:bg-secondary/80 transition-colors font-semibold border-2 border-primary"
            >
              {showLogo ? 'Ocultar' : 'Ver'} Logo
            </button>
          </div>

          {/* Logo Section */}
          {showLogo && (
            <div className="mb-12 p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-bold text-primary mb-4">Logo Velloso</h3>
              <div className="flex justify-center mb-4">
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/Capturadetela2025-11-13155450_8257b24a.png" 
                  alt="Velloso Cidadania Logo" 
                  className="h-40 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use este logo como referência para criar as artes dos eventos. Mantenha a cor vinho (#592343) e a estética italiana.
              </p>
              <div className="text-left space-y-2 text-xs">
                <div><strong>Cor Primária:</strong> #592343 (Vinho)</div>
                <div><strong>Cor Secundária:</strong> #00924a (Verde Italiano)</div>
                <div><strong>Cor Destaque:</strong> #ce2b37 (Vermelho Italiano)</div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks by Month */}
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(groupedTasks)
            .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
            .map(([monthStr, monthTasks]) => {
              const month = parseInt(monthStr);
              const monthCompleted = monthTasks.filter(t => t.completed).length;

              return (
                <div key={month} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Month Header */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold">{MONTH_NAMES[month - 1]}</h2>
                        <p className="text-sm text-white/80">{monthCompleted} de {monthTasks.length} tarefas concluídas</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{Math.round((monthCompleted / monthTasks.length) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="p-6 space-y-3">
                    {monthTasks
                      .sort((a, b) => a.day - b.day)
                      .map(task => (
                        <div
                          key={task.id}
                          className={`
                            flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                            ${task.completed
                              ? 'bg-secondary border-border'
                              : 'bg-white border-primary/20 hover:border-primary/50'
                            }
                          `}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="flex-shrink-0 transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-primary" />
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                            )}
                          </button>

                          <div className="flex-1 text-left">
                            <div className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {task.day} de {MONTH_NAMES[month - 1]} • {task.type === 'special' ? 'Evento Especial' : 'Feriado/Comemoração'}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="flex-shrink-0 p-2 text-muted-foreground hover:text-[#ce2b37] transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">Dicas para Criar as Artes</h3>
          <div className="space-y-4 text-foreground">
            <p>
              <strong>1. Mantenha a Identidade Visual:</strong> Use as cores vinho, verde e vermelho italiano em todas as artes para manter consistência com a marca Velloso Cidadania.
            </p>
            <p>
              <strong>2. Inclua o Logo:</strong> Adicione o logo da Velloso em um canto da arte para reforçar a marca.
            </p>
            <p>
              <strong>3. Destaque a Data:</strong> Deixe clara a data do evento (dia e mês) em destaque na arte.
            </p>
            <p>
              <strong>4. Elementos Italianos:</strong> Para feriados e comemorações italianas (como Dantedì), inclua elementos que remetam à Itália.
            </p>
            <p>
              <strong>5. Tamanho Recomendado:</strong> Crie artes em 1920x1080px para melhor compatibilidade com redes sociais e web.
            </p>
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
