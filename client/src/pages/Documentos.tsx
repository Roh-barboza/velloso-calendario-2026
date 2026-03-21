```typescript
import React from 'react';
import { useLocation } from 'wouter';
import { FiChevronLeft, FiChevronRight } from 'lucide-react';
import { Header, Metrics, Table } from './components';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Documentos = () => {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [data, setData] = useState([
    {
      id: 1,
      nome: 'Processo 1',
      status: 'Em andamento',
      data: '2022-01-01',
    },
    {
      id: 2,
      nome: 'Processo 2',
      status: 'ConcluÃ­do',
      data: '2022-02-01',
    },
    {
      id: 3,
      nome: 'Processo 3',
      status: 'Em andamento',
      data: '2022-03-01',
    },
  ]);

  useEffect(() => {
    if (session) {
      console.log(session);
    }
  }, [session]);

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen">
      <div className="bg-[#592343] w-64 h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Velloso Hub</h2>
          <button
            className="bg-transparent hover:bg-gray-500 text-gray-700 hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
            onClick={handleThemeChange}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <ul>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center py-2 pl-4 hover:bg-gray-500 hover:text-white rounded"
            >
              <FiChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center py-2 pl-4 hover:bg-gray-500 hover:text-white rounded"
            >
              <FiChevronRight className="w-4 h-4 mr-2" />
              AvanÃ§ar
            </a>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-4">
        <Header />
        <Metrics />
        <Table data={data} />
      </div>
    </div>
  );
};

export default Documentos;
``