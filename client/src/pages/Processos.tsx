Aqui estÃ¡ um exemplo de cÃ³digo para o arquivo `Processos.tsx` com as funcionalidades solicitadas:
```tsx
import React from 'react';
import { Link, useLocation } from 'wouter';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Table } from './Table';

const Processos = () => {
  const [location, setLocation] = useLocation();

  const handleFilter = (filter: string) => {
    setLocation(`/processos/${filter}`);
  };

  return (
    <div className="bg-gray-100 h-screen">
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-4">Cidadania Italiana</h1>
          <div className="flex justify-between mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleFilter('todos')}
            >
              Todos
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleFilter('pendentes')}
            >
              Pendentes
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleFilter('aprovados')}
            >
              Aprovados
            </button>
          </div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Processos;
```

```tsx
// Header.tsx
import React from 'react';
import { Link } from 'wouter';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="flex justify-between">
        <Link to="/" className="text-lg font-bold">
          Velloso Hub
        </Link>
        <ul className="flex items-center space-x-4">
          <li>
            <Link to="/processos" className="text-lg font-bold">
              Processos
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
```

```tsx
// Sidebar.tsx
import React from 'react';

const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white p-4 w-64">
      <nav className="flex flex-col space-y-4">
        <Link to="/processos" className="text-lg font-bold">
          Processos
        </Link>
        <Link to="/processos/todos" className="text-lg font-bold">
          Todos
        </Link>
        <Link to="/processos/pendentes" className="text-lg font-bold">
          Pendentes
        </Link>
        <Link to="/processos/aprovados" className="text-lg font-bold">
          Aprovados
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
```

```tsx
// Table.tsx
import React from 'react';

const Table = () => {
  return (
    <table className="w-full border-collapse border border-gray-400">
      <thead>
        <tr>
          <th className="border border-gray-400 p-4">Nome</th>
          <th className="border border-gray-400 p-4">Sobrenome</th>
          <th className="border border-gray-400 p-4">Data de Nascimento</th>
          <th className="border border-gray-400 p-4">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-400 p-4">JoÃ£o</td>
          <td className="border border-gray-400 p-4">Silva</td>
          <td className="border border-gray-400 p-4">01/01/1990</td>
          <td className="border border-gray-400 p-4">Aprovado</td>
        </tr>
        <tr>
          <td className="border border-gray-400 p-4">Maria</td>
          <td className="border border-gray-400 p-4">Oliveira</td>
          <td className="border border-gray-400 p-4">02/02/1995</td>
          <td className="border border-gray-400 p-4">Pendente</td>
        </tr>
      </tbody>
    </table>
  );
};

export default Table;
```

Essa Ã© uma implementaÃ§Ã£o bÃ¡sica das funcionalidades solicitadas. VocÃª pode personalizar e adicionar mais funcionalidades conforme necessÃ¡rio.