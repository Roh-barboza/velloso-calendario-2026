import React, { useState } from 'react';
import { Users } from 'lucide-react';

const Clientes = () => {
  const [data] = useState([
    { id: 1, nome: 'Processo 1', stato: 'Em andamento', data_inizio: '2022-01-01', data_fine: '2022-01-31' },
    { id: 2, nome: 'Processo 2', stato: 'Concluído', data_inizio: '2022-02-01', data_fine: '2022-02-28' },
    { id: 3, nome: 'Processo 3', stato: 'Em andamento', data_inizio: '2022-03-01', data_fine: '2022-03-31' },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#592343] mb-6">Clientes</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Processos em curso</p>
            <p className="text-xl font-bold">10</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Processos concluídos</p>
            <p className="text-xl font-bold">20</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Processos em espera</p>
            <p className="text-xl font-bold">30</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#592343] text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Data início</th>
                <th className="p-3 text-left">Data fim</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.id}</td>
                  <td className="p-3">{row.nome}</td>
                  <td className="p-3">{row.stato}</td>
                  <td className="p-3">{row.data_inizio}</td>
                  <td className="p-3">{row.data_fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
