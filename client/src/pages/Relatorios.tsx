import { useLocation } from 'wouter';
import { FiChevronLeft } from 'react-icons/fi';

const Relatorios = () => {
  const [pathname] = useLocation();

  return (
    <div className="flex h-screen">
      <div className="bg-[#592343] w-64 h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Relatórios</h2>
          <button className="bg-white text-[#592343] rounded-full p-2">
            <FiChevronLeft size={20} />
          </button>
        </div>
        <ul>
          <li className="mb-2">
            <a
              href="#"
              className={`text-sm text-white hover:text-gray-200 ${
                pathname === '/relatorios' ? 'bg-white text-[#592343]' : ''
              }`}
            >
              Relatórios
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className={`text-sm text-white hover:text-gray-200 ${
                pathname === '/relatorios/itens' ? 'bg-white text-[#592343]' : ''
              }`}
            >
              Itens
            </a>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold text-[#592343] mb-4">Relatórios</h1>
        <p className="text-gray-500">Em breve...</p>
      </div>
    </div>
  );
};

export default Relatorios;
