import React from 'react';
import { useLocation } from 'wouter';
import { Calendar, Clock, User } from 'lucide-react';

const Calendario = () => {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#592343] mb-6">Calendário</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#592343]" />
            <div>
              <p className="text-sm text-gray-500">Processos em curso</p>
              <p className="text-xl font-bold">10</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#592343]" />
            <div>
              <p className="text-sm text-gray-500">Processos concluídos</p>
              <p className="text-xl font-bold">50</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <User className="w-6 h-6 text-[#592343]" />
            <div>
              <p className="text-sm text-gray-500">Usuários registrados</p>
              <p className="text-xl font-bold">100</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#592343] text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Descrição</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">1</td>
                <td className="p-3">2022-01-01</td>
                <td className="p-3">Pedido de cidadania</td>
                <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Em curso</span></td>
              </tr>
              <tr className="border-b">
                <td className="p-3">2</td>
                <td className="p-3">2022-01-15</td>
                <td className="p-3">Pedido de passaporte</td>
                <td className="p-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Concluído</span></td>
              </tr>
              <tr>
                <td className="p-3">3</td>
                <td className="p-3">2022-02-01</td>
                <td className="p-3">Pedido de identidade</td>
                <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Em curso</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
