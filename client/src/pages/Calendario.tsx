```tsx
import React from 'react';
import { Link } from 'wouter';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/solid';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import { Modal } from 'react-modal';
import { useLocation } from 'wouter';

const Calendario = () => {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [feriado, setFeriado] = useState(false);
  const [feriados, setFeriados] = useState([
    { date: '2026-03-08', name: 'Mulher' },
    { date: '2026-03-15', name: 'Consumidor' },
  ]);

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleAddEvent = () => {
    setFeriados([...feriados, { date: date.toISOString().split('T')[0], name: event }]);
    setIsOpen(false);
  };

  const locationUrl = useLocation();

  return (
    <div className="h-screen w-screen bg-gray-100">
      <div className="flex h-screen">
        <div className="w-64 bg-[#592343] p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg text-white">Velloso Hub</h1>
            <button className="bg-white text-[#592343] py-2 px-4 rounded">
              <Link to="/perfil">Perfil</Link>
            </button>
          </div>
          <ul className="space-y-4">
            <li className="flex items-center">
              <CalendarIcon className="w-6 h-6 text-white" />
              <Link to="/calendario">CalendÃ¡rio</Link>
            </li>
            <li className="flex items-center">
              <ClockIcon className="w-6 h-6 text-white" />
              <Link to="/eventos">Eventos</Link>
            </li>
            <li className="flex items-center">
              <MapPinIcon className="w-6 h-6 text-white" />
              <Link to="/localizacao">LocalizaÃ§Ã£o</Link>
            </li>
          </ul>
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl">CalendÃ¡rio</h1>
            <button className="bg-white text-[#592343] py-2 px-4 rounded" onClick={handleOpenModal}>
              Adicionar Evento
            </button>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {feriados.map((feriado, index) => (
              <div key={index} className="bg-white p-4 rounded">
                <h2 className="text-lg">{feriado.name}</h2>
                <p className="text-sm">{feriado.date}</p>
              </div>
            ))}
          </div>
          <Modal
            isOpen={isOpen}
            onRequestClose={handleCloseModal}
            className="fixed top-0 left-0 w-full h-screen bg-gray-900/50 p-4"
          >
            <div className="bg-white p-4 rounded">
              <h2 className="text-lg">Adicionar Evento</h2>
              <form className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                  <input
                    type="date"
                    value={date.toISOString().split('T')[0]}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className="w-full py-2 px-4 rounded"
                  />
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full py-2 px-4 rounded"
                    placeholder="Nome do Evento"
                  />
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full py-2 px-4 rounded"
                    placeholder="LocalizaÃ§Ã£o"
                  />
                </div>
                <div className="flex items-center">
                  <p className="text-sm">Feriado?</p>
                  <input
                    type="checkbox"
                    checked={feriado}
                    onChange={() => setFeriado(!feriado)}
                    className="w-4 h-4"
                  />
                </div>
                <button
                  type="button"
                  className="bg-white text-[#592343] py-2 px-4 rounded"
                  onClick={handleAddEvent}
                >
                  Adicionar
                </button>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
```

```tsx
// Calendario.tsx
import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Calendario = () => {
  const [date, setDate] = React.useState(new Date());

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <div>
      <Calendar onChange={handleDateChange} value={date} />
    </div>
  );
};

export default Calendario;
```

```tsx
// Eventos.tsx
import React from 'react';

const Eventos = () => {
  return (
    <div>
      <h1>Eventos</h1>
    </div>
  );
};

export default Eventos;
```

```tsx
// Localizacao.tsx
import React from 'react';

const Localizacao = () => {
  return (
    <div>
      <h1>LocalizaÃ§Ã£o</h1>
    </div>
  );
};

export default Localizacao;
```

```tsx
// Perfil.tsx
import React from 'react';

const Perfil = () => {
  return (
    <div>
      <h1>Perfil</h1>
    </div>
  );
};

export default Perfil;
```