Aqui estÃ¡ um exemplo de cÃ³digo para o componente `Calendario.tsx` com as funcionalidades solicitadas:
```tsx
import React from 'react';
import { useLocation } from 'wouter';
import { FaCalendarAlt } from 'react-icons/fa';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';
import { BsFillGridFill } from 'react-icons/bs';
import { AiOutlineFilter } from 'react-icons/ai';

const Calendario = () => {
  const [location, setLocation] = useLocation();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation(`/processos?status=${event.target.value}`);
  };

  return (
    <div className="h-screen w-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation('/')}
            >
              <HiOutlineMenuAlt1 size={24} />
            </button>
            <h1 className="text-lg font-bold">Velloso Hub</h1>
          </div>
          <div className="flex items-center">
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation('/processos')}
            >
              <FaCalendarAlt size={24} />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation('/processos')}
            >
              <BsFillGridFill size={24} />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setLocation('/processos')}
            >
              <AiOutlineFilter size={24} />
            </button>
          </div>
        </div>
      </header>
      <main className="p-4">
        <div className="bg-white shadow-md p-4">
          <h2 className="text-lg font-bold">Processos</h2>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <label className="text-gray-600">Status:</label>
              <select
                className="bg-gray-100 border border-gray-300 text-gray-600 py-1 px-2"
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="em-andamento">Em andamento</option>
                <option value="concluido">ConcluÃ­do</option>
              </select>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
              onClick={() => setLocation('/processos/novo')}
            >
              Novo Processo
            </button>
          </div>
          <table className="w-full mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 py-2 px-4">ID</th>
                <th className="border border-gray-300 py-2 px-4">Cliente</th>
                <th className="border border-gray-300 py-2 px-4">Status</th>
                <th className="border border-gray-300 py-2 px-4">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-2 px-4">1</td>
                <td className="border border-gray-300 py-2 px-4">JoÃ£o da Silva</td>
                <td className="border border-gray-300 py-2 px-4">Pendente</td>
                <td className="border border-gray-300 py-2 px-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                    onClick={() => setLocation('/processos/1')}
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-2 px-4">2</td>
                <td className="border border-gray-300 py-2 px-4">Maria Oliveira</td>
                <td className="border border-gray-300 py-2 px-4">Em andamento</td>
                <td className="border border-gray-300 py-2 px-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                    onClick={() => setLocation('/processos/2')}
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Calendario;
```
Esse cÃ³digo cria um componente `Calendario` que inclui:

* Um header com um menu lateral e um botÃ£o para acessar a pÃ¡gina de processos
* Uma tabela com os processos, incluindo o ID, cliente, status e aÃ§Ãµes
* Um filtro de status para a tabela
* Um botÃ£o para criar um novo processo

Lembre-se de que esse Ã© apenas um exemplo e vocÃª pode personalizar o cÃ³digo para atender Ã s suas necessidades especÃ­ficas. AlÃ©m disso, Ã© importante lembrar que esse cÃ³digo nÃ£o inclui a implementaÃ§Ã£o de qualquer lÃ³gica de negÃ³cios ou banco de dados, apenas a estrutura do componente.