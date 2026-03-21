```typescript
import React from 'react';
import { useLocation } from 'wouter';
import { FiChevronLeft, FiChevronRight } from 'lucide-react';
import { Header, Metrics, Table } from './components';
import { useTheme } from 'tailwindcss/react';

const Processos = () => {
  const { location } = useLocation();
  const theme = useTheme();

  return (
    <div className="flex h-screen">
      <div className="bg-[#592343] w-64 h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Processos</h2>
          <button className="bg-white text-[#592343] rounded-full p-2">
            <FiChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-2">
          <li className="bg-white p-2 rounded-md">
            <a
              href="#"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <FiChevronRight className="w-4 h-4" />
              <span>Processo 1</span>
            </a>
          </li>
          <li className="bg-white p-2 rounded-md">
            <a
              href="#"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <FiChevronRight className="w-4 h-4" />
              <span>Processo 2</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-4">
        <Header />
        <Metrics />
        <Table />
      </div>
    </div>
  );
};

export default Processos;
``