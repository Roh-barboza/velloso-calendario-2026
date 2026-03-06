export type EventType = 'birthday' | 'special' | 'holiday';

export interface CalendarEvent {
  name: string;
  type: EventType;
}

export const EVENTS_BY_MONTH: Record<number, Record<number, CalendarEvent[]>> = {
  1: { // Janeiro
    1: [{ name: 'Ano Novo', type: 'holiday' }],
    25: [{ name: 'Conversão de Santo Agostinho', type: 'holiday' }],
  },
  2: { // Fevereiro
    14: [{ name: 'Dia de São Valentim', type: 'holiday' }],
  },
  3: { // Março
    1: [{ name: 'MARIANE SANTOS CARVALHO', type: 'birthday' }],
    2: [{ name: 'FABÍOLA STEFANY LIMA VALADARES', type: 'birthday' }],
    4: [{ name: 'CRISTIANE LOPES DE ASSUNÇÃO', type: 'birthday' }],
    5: [{ name: 'Thaina Vicente', type: 'birthday' }],
    6: [{ name: 'Noah Yohan Massaneiro Soares', type: 'birthday' }],
    7: [
      { name: 'Isabella Claro Grizzo', type: 'birthday' },
      { name: 'Olivia Harue Goncalves', type: 'birthday' },
      { name: 'Julie Correia Lula', type: 'birthday' },
    ],
    8: [
      { name: 'Lala perin Soethe', type: 'birthday' },
      { name: 'Dia da Mulher', type: 'holiday' },
    ],
    11: [
      { name: 'Janaina Carla Abra Santos', type: 'birthday' },
      { name: 'BEATRIZ FINCO IRIZAGA DA COSTA', type: 'birthday' },
    ],
    12: [{ name: 'Ana Luiza de Oliveira Domingues', type: 'birthday' }],
    14: [{ name: 'Lucas Biondo', type: 'birthday' }],
    15: [{ name: 'Dia do Consumidor', type: 'special' }],
    16: [{ name: 'Adilço Norberto Melotto', type: 'birthday' }],
    18: [{ name: 'IZABELLA ZIMMERMANN MACIEL', type: 'birthday' }],
    19: [
      { name: 'Joiciany Pereira Cândido', type: 'birthday' },
      { name: 'Dia do Artesão', type: 'holiday' },
    ],
    20: [{ name: 'Juliana Passalacqua Ricci', type: 'birthday' }],
    21: [
      { name: 'LUCA MENEGOTTO CASTILLO', type: 'birthday' },
      { name: 'RODRIGO SOARES SANTANA JUNIOR', type: 'birthday' },
    ],
    22: [
      { name: 'Giselle Maria Coelho Schelbauer', type: 'birthday' },
      { name: 'Débora Cerretti', type: 'birthday' },
      { name: 'Dia Mundial da Água', type: 'special' },
    ],
    23: [{ name: 'Adolfo Amaral Franco', type: 'birthday' }],
    25: [
      { name: 'Richard Cinacchi Gracetti', type: 'birthday' },
      { name: 'Dantedì', type: 'holiday' },
    ],
    26: [{ name: 'Rodrigo Brolez Antonello', type: 'birthday' }],
    27: [{ name: 'Jonathan Diego nava', type: 'birthday' }],
    29: [
      { name: 'Jean Felipe Micheletto Costa', type: 'birthday' },
      { name: 'Douglas Barbarino', type: 'birthday' },
    ],
    31: [{ name: 'Willian Costa Souza', type: 'birthday' }],
  },
  4: { // Abril
    21: [{ name: 'Tiradentes', type: 'holiday' }],
  },
  5: { // Maio
    1: [{ name: 'Dia do Trabalho', type: 'holiday' }],
  },
  6: { // Junho
    10: [{ name: 'Corpus Christi', type: 'holiday' }],
    20: [{ name: 'Santo Antônio', type: 'holiday' }],
  },
  7: { // Julho
    7: [{ name: 'Festa della Madonna', type: 'holiday' }],
  },
  8: { // Agosto
    15: [{ name: 'Assunção de Maria', type: 'holiday' }],
  },
  9: { // Setembro
    7: [{ name: 'Independência do Brasil', type: 'holiday' }],
  },
  10: { // Outubro
    12: [{ name: 'Nossa Senhora Aparecida', type: 'holiday' }],
  },
  11: { // Novembro
    2: [{ name: 'Finados', type: 'holiday' }],
    15: [{ name: 'Proclamação da República', type: 'holiday' }],
    20: [{ name: 'Consciência Negra', type: 'special' }],
  },
  12: { // Dezembro
    4: [{ name: 'Santa Bárbara', type: 'holiday' }],
    8: [{ name: 'Imaculada Conceição', type: 'holiday' }],
    25: [{ name: 'Natal', type: 'holiday' }],
  },
};

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const getEventsForMonth = (month: number) => {
  return EVENTS_BY_MONTH[month] || {};
};

export const getAllEventsForYear = () => {
  const allEvents: Array<{ month: number; day: number; event: CalendarEvent }> = [];
  
  Object.entries(EVENTS_BY_MONTH).forEach(([monthStr, days]) => {
    const month = parseInt(monthStr);
    Object.entries(days).forEach(([dayStr, events]) => {
      const day = parseInt(dayStr);
      events.forEach((event) => {
        allEvents.push({ month, day, event });
      });
    });
  });
  
  return allEvents;
};

export const getTasksForArtCreation = () => {
  const tasks: Array<{ month: number; day: number; name: string; type: EventType }> = [];
  
  getAllEventsForYear().forEach(({ month, day, event }) => {
    if (event.type !== 'birthday') {
      tasks.push({
        month,
        day,
        name: event.name,
        type: event.type,
      });
    }
  });
  
  return tasks;
};
