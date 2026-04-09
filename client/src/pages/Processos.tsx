import React from 'react';
import { ChevronRight } from 'lucide-react';

const Processos = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#592343] mb-6">Processos</h1>
        <div className="bg-white rounded-lg shadow">
          <ul className="divide-y">
            <li className="p-4 flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-[#592343]" />
              <span className="text-sm">Processo 1</span>
            </li>
            <li className="p-4 flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-[#592343]" />
              <span className="text-sm">Processo 2</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Processos;
