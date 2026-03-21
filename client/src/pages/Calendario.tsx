```typescript
import React from 'react';
import { useLocation } from 'wouter';
import { Calendar, Clock, User } from 'lucide-react';
import { Header, Sidebar, MetricsCard, Table } from './components';
import './Calendario.css';

const Calendario = () => {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex h-screen">
      <Sidebar className="bg-[#592343] w-64">
        <div className="flex flex-col h-screen p-4">
          <div className="flex items-center mb-4">
            <img src="logo.png" alt="Velloso Hub" className="w-8 h-8" />
            <h2 className="ml-2 text-lg font-bold">Velloso Hub</h2>
          </div>
          <ul className="flex flex-col">
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 text-sm text-gray-400 hover:text-gray-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendario
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 text-sm text-gray-400 hover:text-gray-200"
              >
                <Clock className="w-4 h-4 mr-2" />
                Cronologia
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center p-2 text-sm text-gray-400 hover:text-gray-200"
              >
                <User className="w-4 h-4 mr-2" />
                Utenti
              </a>
            </li>
          </ul>
        </div>
      </Sidebar>
      <div className="flex-1 p-4">
        <Header title="Calendario" />
        <div className="flex flex-wrap -mx-4">
          <MetricsCard
            title="Processi in corso"
            value="10"
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
          />
          <MetricsCard
            title="Processi completati"
            value="50"
            icon={<Clock className="w-4 h-4 text-gray-400" />}
          />
          <MetricsCard
            title="Utenti registrati"
            value="100"
            icon={<User className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <Table
          columns={[
            { title: 'ID', field: 'id' },
            { title: 'Data', field: 'date' },
            { title: 'Descrizione', field: 'description' },
            { title: 'Stato', field: 'status' },
          ]}
          data={[
            {
              id: 1,
              date: '2022-01-01',
              description: 'Richiesta di cittadinanza',
              status: 'In corso',
            },
            {
              id: 2,
              date: '2022-01-15',
              description: 'Richiesta di passaporto',
              status: 'Completato',
            },
            {
              id: 3,
              date: '2022-02-01',
              description: 'Richiesta di identitÃ ',
              status: 'In corso',
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Calendario;
``