```typescript
import React from 'react';
import { useLocation } from 'wouter';
import { FiChevronLeft, FiChevronRight } from 'lucide-react';
import { Header, Sidebar, MetricsCard, Table } from './components';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Clientes = () => {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [data, setData] = useState([
    {
      id: 1,
      nome: 'Processo 1',
      stato: 'In corso',
      data_inizio: '2022-01-01',
      data_fine: '2022-01-31',
    },
    {
      id: 2,
      nome: 'Processo 2',
      stato: 'Concluso',
      data_inizio: '2022-02-01',
      data_fine: '2022-02-28',
    },
    {
      id: 3,
      nome: 'Processo 3',
      stato: 'In corso',
      data_inizio: '2022-03-01',
      data_fine: '2022-03-31',
    },
  ]);

  useEffect(() => {
    if (session) {
      console.log(session);
    }
  }, [session]);

  return (
    <div className="flex h-screen">
      <Sidebar
        bg="#592343"
        className="w-64"
        header="Velloso Hub"
        icon={<FiChevronLeft />}
        items={[
          { label: 'Home', to: '/' },
          { label: 'Clienti', to: '/clienti' },
          { label: 'Processi', to: '/processi' },
        ]}
      />
      <div className="flex-1 p-4">
        <Header
          bg={theme === 'dark' ? '#333' : '#f7f7f7'}
          className="py-4"
          icon={<FiChevronRight />}
          title="Clienti"
        />
        <div className="flex flex-wrap -mx-4 mt-4">
          <MetricsCard
            bg={theme === 'dark' ? '#333' : '#f7f7f7'}
            className="w-full xl:w-1/3 p-4"
            icon={<FiChevronRight />}
            title="Processi in corso"
            value="10"
          />
          <MetricsCard
            bg={theme === 'dark' ? '#333' : '#f7f7f7'}
            className="w-full xl:w-1/3 p-4"
            icon={<FiChevronRight />}
            title="Processi conclusi"
            value="20"
          />
          <MetricsCard
            bg={theme === 'dark' ? '#333' : '#f7f7f7'}
            className="w-full xl:w-1/3 p-4"
            icon={<FiChevronRight />}
            title="Processi in attesa"
            value="30"
          />
        </div>
        <div className="mt-4">
          <Table
            data={data}
            columns={[
              { label: 'ID', key: 'id' },
              { label: 'Nome', key: 'nome' },
              { label: 'Stato', key: 'stato' },
              { label: 'Data inizio', key: 'data_inizio' },
              { label: 'Data fine', key: 'data_fine' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Clientes;
``