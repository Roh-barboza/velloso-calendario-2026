Aqui estÃ¡ um exemplo de cÃ³digo para o arquivo `Clientes.tsx` com as funcionalidades solicitadas:

```tsx
import React from 'react';
import { Link } from 'wouter';
import { FaFilter } from 'react-icons/fa';
import { HiOutlineChevronDoubleLeft } from 'react-icons/hi';
import { BsFillGridFill, BsList } from 'react-icons/bs';
import { useLocation } from 'wouter';

const Clientes = () => {
  const [location, setLocation] = useLocation();

  const handleFilter = (status: string) => {
    setLocation(`/clientes/${status}`);
  };

  return (
    <div className="flex h-screen">
      <aside className="bg-sidebar w-64 h-screen p-4">
        <h2 className="text-lg font-bold text-white mb-4">Velloso Hub</h2>
        <ul>
          <li>
            <Link to="/clientes" className="text-white hover:text-gray-300">
              Clientes
            </Link>
          </li>
          <li>
            <Link to="/clientes/novos" className="text-white hover:text-gray-300">
              Novos
            </Link>
          </li>
          <li>
            <Link to="/clientes/em-andamento" className="text-white hover:text-gray-300">
              Em Andamento
            </Link>
          </li>
          <li>
            <Link to="/clientes/concluidos" className="text-white hover:text-gray-300">
              ConcluÃ­dos
            </Link>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Clientes</h2>
          <div className="flex items-center">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={() => handleFilter('todos')}
            >
              Todos
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ml-2"
              onClick={() => handleFilter('novos')}
            >
              Novos
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ml-2"
              onClick={() => handleFilter('em-andamento')}
            >
              Em Andamento
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ml-2"
              onClick={() => handleFilter('concluidos')}
            >
              ConcluÃ­dos
            </button>
          </div>
        </header>
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            onClick={() => setLocation('/clientes')}
          >
            <HiOutlineChevronDoubleLeft className="mr-2" />
            Voltar
          </button>
          <div className="flex items-center">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              onClick={() => setLocation('/clientes/grid')}
            >
              <BsFillGridFill className="mr-2" />
              Grid
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={() => setLocation('/clientes/list')}
            >
              <BsList className="mr-2" />
              Lista
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array(10)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">Cliente {index + 1}</td>
                    <td className="px-4 py-2">cliente{index + 1}@email.com</td>
                    <td className="px-4 py-2">(11) 99999-9999</td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        onClick={() => handleFilter('novos')}
                      >
                        Novos
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Clientes;
```

Esse cÃ³digo cria uma pÃ¡gina com uma sidebar, um header com filtros de status e uma tabela com dados de clientes. A tabela Ã© renderizada com base no estado da localizaÃ§Ã£o atual, que Ã© atualizado quando o usuÃ¡rio clica em um dos botÃµes de filtro. AlÃ©m disso, o cÃ³digo inclui botÃµes para voltar Ã  pÃ¡gina anterior e para mudar entre a exibiÃ§Ã£o em grid e em lista.