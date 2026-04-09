import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const Documentos = () => {
  const [data] = useState([
    { id: 1, nome: 'Documento 1', status: 'Em andamento', data: '2022-01-01' },
    { id: 2, nome: 'Documento 2', status: 'Concluído', data: '2022-02-01' },
    { id: 3, nome: 'Documento 3', status: 'Em andamento', data: '2022-03-01' },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#592343] mb-6">Documentos</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#592343] text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.id}</td>
                  <td className="p-3">{row.nome}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documentos;
