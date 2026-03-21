Aqui estÃ¡ um exemplo de cÃ³digo para o componente `Documentos.tsx` com as caracterÃ­sticas solicitadas:

```tsx
import React from 'react';
import { useLocation } from 'wouter';
import { FaFile, FaFilter, FaSort } from 'lucide-icons-react';
import { Header, Sidebar, Table } from './components';
import { useFilters } from './hooks';

const Documentos = () => {
  const [location, setLocation] = useLocation();
  const { filters, setFilters } = useFilters();

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
  };

  const handleSortChange = (field: string) => {
    // Implementar lÃ³gica de ordenaÃ§Ã£o
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        className="bg-sidebar w-64"
        icon={<FaFile />}
        title="Documentos"
      >
        <ul>
          <li>
            <a
              href="#"
              className={location === '/documentos' ? 'text-blue-500' : ''}
              onClick={() => setLocation('/documentos')}
            >
              Todos
            </a>
          </li>
          <li>
            <a
              href="#"
              className={location === '/documentos/pendentes' ? 'text-blue-500' : ''}
              onClick={() => setLocation('/documentos/pendentes')}
            >
              Pendentes
            </a>
          </li>
          <li>
            <a
              href="#"
              className={location === '/documentos/aceitos' ? 'text-blue-500' : ''}
              onClick={() => setLocation('/documentos/aceitos')}
            >
              Aceitos
            </a>
          </li>
        </ul>
      </Sidebar>
      <div className="flex-1 p-4">
        <Header
          title="Documentos"
          metrics={[
            { label: 'Total', value: 100 },
            { label: 'Pendentes', value: 20 },
            { label: 'Aceitos', value: 80 },
          ]}
        />
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <FaFilter className="mr-2" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md py-1 px-2"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aceito">Aceito</option>
            </select>
          </div>
          <div className="flex items-center">
            <FaSort className="mr-2" />
            <select
              value={filters.order}
              onChange={(e) => handleSortChange('order', e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md py-1 px-2"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
        <Table
          data={[
            { id: 1, nome: 'Cliente 1', status: 'Pendente' },
            { id: 2, nome: 'Cliente 2', status: 'Aceito' },
            { id: 3, nome: 'Cliente 3', status: 'Pendente' },
          ]}
          columns={[
            { label: 'ID', key: 'id' },
            { label: 'Nome', key: 'nome' },
            { label: 'Status', key: 'status' },
          ]}
        />
      </div>
    </div>
  );
};

export default Documentos;
```

Esse cÃ³digo inclui:

* Um sidebar com um Ã­cone e um tÃ­tulo;
* Um header com mÃ©tricas;
* Uma tabela com dados mock;
* Filtros de status e ordenaÃ§Ã£o;
* Uso do hook `useLocation` do Wouter para gerenciar a rota atual;
* Uso do hook `useFilters` para gerenciar os filtros aplicados.

Lembre-se de que esse Ã© apenas um exemplo e vocÃª precisarÃ¡ adaptÃ¡-lo Ã s suas necessidades especÃ­ficas. AlÃ©m disso, Ã© importante implementar a lÃ³gica de ordenaÃ§Ã£o e outros comportamentos necessÃ¡rios para o seu aplicativo.