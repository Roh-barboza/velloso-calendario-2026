Aqui estÃ¡ um exemplo de como vocÃª pode criar o componente `Relatorios.tsx` com as funcionalidades solicitadas:

```tsx
import React from 'react';
import { useLocation } from 'wouter';
import { Sidebar, Header, Table } from './components';
import { Lucide } from '@uiw/react-icons';
import { useFilters } from './hooks';

const Relatorios = () => {
  const [location, setLocation] = useLocation();
  const { filters, setFilters } = useFilters();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const handleStatusChange = (status: string) => {
    handleFilterChange('status', status);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        className="bg-sidebar w-64"
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div className="flex-1 p-4">
        <Header
          title="RelatÃ³rios"
          metrics={
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Total de Processos: 100</div>
              <div className="text-lg font-bold">Total de Clientes: 50</div>
            </div>
          }
        />
        <div className="mt-4">
          <Table
            data={[
              { id: 1, cliente: 'Cliente 1', status: 'Em Andamento' },
              { id: 2, cliente: 'Cliente 2', status: 'ConcluÃ­do' },
              { id: 3, cliente: 'Cliente 3', status: 'Em Andamento' },
            ]}
            filters={filters}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
```

```tsx
// components/Sidebar.tsx
import React from 'react';
import { Lucide } from '@uiw/react-icons';

const Sidebar = ({ className, filters, onFilterChange }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold">Filtros</h2>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900 rounded-full p-2"
          onClick={() => onFilterChange('reset', '')}
        >
          <Lucide name="refresh" size={20} />
        </button>
      </div>
      <ul className="flex flex-col p-4">
        <li className="mb-2">
          <label className="block text-gray-600">
            <input
              type="checkbox"
              checked={filters.status === 'Em Andamento'}
              onChange={() => onFilterChange('status', 'Em Andamento')}
            />
            <span className="ml-2">Em Andamento</span>
          </label>
        </li>
        <li className="mb-2">
          <label className="block text-gray-600">
            <input
              type="checkbox"
              checked={filters.status === 'ConcluÃ­do'}
              onChange={() => onFilterChange('status', 'ConcluÃ­do')}
            />
            <span className="ml-2">ConcluÃ­do</span>
          </label>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
```

```tsx
// components/Header.tsx
import React from 'react';

const Header = ({ title, metrics }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 className="text-lg font-bold">{title}</h2>
      {metrics && (
        <div className="flex items-center justify-between">
          {metrics}
        </div>
      )}
    </div>
  );
};

export default Header;
```

```tsx
// components/Table.tsx
import React from 'react';

const Table = ({ data, filters, onStatusChange }) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Cliente</th>
          <th className="px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2">{item.id}</td>
            <td className="px-4 py-2">{item.cliente}</td>
            <td className="px-4 py-2">
              <select
                value={filters.status}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="">Selecione um status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="ConcluÃ­do">ConcluÃ­do</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
```

```tsx
// hooks/useFilters.ts
import { useState } from 'react';

const useFilters = () => {
  const [filters, setFilters] = useState({
    status: '',
  });

  return { filters, setFilters };
};

export default useFilters;
```

Essa Ã© uma implementaÃ§Ã£o bÃ¡sica das funcionalidades solicitadas. VocÃª pode personalizar e adicionar mais funcionalidades conforme necessÃ¡rio.