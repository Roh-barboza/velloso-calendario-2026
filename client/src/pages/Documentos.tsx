import { useState } from 'react';
import {
  FolderOpen, FileText, Image, File, Download, Search,
  Upload, Plus, X, Eye, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

type DocCategory = 'certidoes' | 'contratos' | 'apostilas' | 'traducoes' | 'outros';

interface Document {
  id: string;
  name: string;
  category: DocCategory;
  client?: string;
  date: string;
  size?: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
}

const CATEGORY_CONFIG: Record<DocCategory, { label: string; color: string; bg: string }> = {
  certidoes:  { label: 'Certidões',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'     },
  contratos:  { label: 'Contratos',  color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200'  },
  apostilas:  { label: 'Apostilas',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'    },
  traducoes:  { label: 'Traduções',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  outros:     { label: 'Outros',     color: 'text-gray-700',    bg: 'bg-gray-50 border-gray-200'      },
};

const MOCK_DOCS: Document[] = [
  { id: '1', name: 'Certidão de Nascimento — João Silva.pdf',          category: 'certidoes', client: 'João Silva',      date: '15/01/2026', size: '2.3 MB',  type: 'pdf'   },
  { id: '2', name: 'Contrato de Prestação de Serviços — Maria Santos.pdf', category: 'contratos', client: 'Maria Santos', date: '05/11/2025', size: '1.1 MB',  type: 'pdf'   },
  { id: '3', name: 'Apostila — Carlos Oliveira — Certidão.pdf',        category: 'apostilas', client: 'Carlos Oliveira', date: '20/02/2026', size: '850 KB', type: 'pdf'   },
  { id: '4', name: 'Tradução Juramentada — Ana Lima.docx',             category: 'traducoes', client: 'Ana Lima',        date: '12/12/2025', size: '340 KB', type: 'doc'   },
  { id: '5', name: 'RG — Pedro Costa.jpg',                             category: 'certidoes', client: 'Pedro Costa',     date: '01/03/2026', size: '1.8 MB',  type: 'image' },
  { id: '6', name: 'Certidão de Casamento — Fernanda Rocha.pdf',       category: 'certidoes', client: 'Fernanda Rocha',  date: '02/04/2026', size: '1.5 MB',  type: 'pdf'   },
  { id: '7', name: 'Apostila Haia — João Silva.pdf',                   category: 'apostilas', client: 'João Silva',      date: '28/02/2026', size: '920 KB', type: 'pdf'   },
  { id: '8', name: 'Comprovante de Residência — Maria Santos.pdf',     category: 'outros',    client: 'Maria Santos',    date: '10/01/2026', size: '650 KB', type: 'pdf'   },
];

function FileIcon({ type }: { type: Document['type'] }) {
  if (type === 'pdf')   return <FileText className="w-8 h-8 text-red-500" />;
  if (type === 'image') return <Image    className="w-8 h-8 text-blue-500" />;
  if (type === 'doc')   return <File     className="w-8 h-8 text-blue-700" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

function UploadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (doc: Document) => void }) {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState<DocCategory>('certidoes');
  const [client, setClient]     = useState('');
  const [dragging, setDragging] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      category,
      client: client || undefined,
      date: new Date().toLocaleDateString('pt-BR'),
      type: /\.pdf$/i.test(name) ? 'pdf' : /\.(jpg|png|jpeg|webp)$/i.test(name) ? 'image' : 'doc',
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#2D1B29] text-white">
          <h3 className="font-semibold">Adicionar Documento</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setName(f.name); }}
            className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-colors',
              dragging ? 'border-[#592343] bg-[#592343]/5' : 'border-gray-200 hover:border-gray-300')}
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Arraste um arquivo ou</p>
            <label className="text-sm text-[#592343] font-semibold cursor-pointer hover:underline">
              clique para selecionar
              <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setName(e.target.files[0].name); }} />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Certidão de Nascimento — João.pdf" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as DocCategory)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#592343]/30">
                {(Object.entries(CATEGORY_CONFIG) as [DocCategory, typeof CATEGORY_CONFIG[DocCategory]][]).map(([k, c]) => (
                  <option key={k} value={k}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cliente</label>
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-[#592343] text-white hover:bg-[#7a2f52] transition-colors font-semibold">Adicionar</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Documentos() {
  const [docs, setDocs]       = useState<Document[]>(MOCK_DOCS);
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState<DocCategory | ''>('');
  const [showModal, setModal] = useState(false);
  const [viewMode, setView]   = useState<'grid' | 'list'>('list');

  const filtered = docs.filter((d) => {
    const ms = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.client?.toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || d.category === catFilter;
    return ms && mc;
  });

  const countBy = Object.fromEntries(
    (Object.keys(CATEGORY_CONFIG) as DocCategory[]).map((k) => [k, docs.filter((d) => d.category === k).length])
  );

  return (
    <Layout title="Documentos">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Documentos</h2>
            <p className="text-sm text-gray-500 mt-0.5">{docs.length} arquivo{docs.length !== 1 ? 's' : ''} armazenados</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#592343] text-white rounded-lg text-sm font-semibold hover:bg-[#7a2f52] transition-colors">
            <Plus className="w-4 h-4" /> Adicionar documento
          </button>
        </div>

        {/* Category pills / KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.entries(CATEGORY_CONFIG) as [DocCategory, typeof CATEGORY_CONFIG[DocCategory]][]).map(([k, cfg]) => (
            <button key={k} onClick={() => setCat(catFilter === k ? '' : k)}
              className={cn('rounded-xl border p-3 text-left transition-all hover:shadow-sm',
                catFilter === k ? `${cfg.bg} ${cfg.color} shadow-sm` : 'bg-white border-gray-100 hover:border-gray-200')}>
              <p className="text-lg font-bold text-gray-900">{countBy[k] ?? 0}</p>
              <p className={cn('text-xs font-medium mt-0.5', catFilter === k ? cfg.color : 'text-gray-500')}>{cfg.label}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou cliente..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
          </div>
          {catFilter && (
            <button onClick={() => setCat('')}
              className="flex items-center gap-1 text-xs text-[#592343] bg-[#592343]/10 px-2.5 py-1.5 rounded-lg font-medium hover:bg-[#592343]/20 transition-colors">
              <X className="w-3 h-3" /> {CATEGORY_CONFIG[catFilter].label}
            </button>
          )}
          <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['list', 'grid'] as const).map((m) => (
              <button key={m} onClick={() => setView(m)}
                className={cn('px-2.5 py-1 text-xs rounded-md font-semibold transition-all',
                  viewMode === m ? 'bg-white text-[#592343] shadow-sm' : 'text-gray-500')}>
                {m === 'list' ? 'Lista' : 'Grade'}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum documento encontrado</p>
          </div>
        )}

        {/* List view */}
        {filtered.length > 0 && viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Documento', 'Categoria', 'Cliente', 'Data', 'Tamanho', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => {
                  const cfg = CATEGORY_CONFIG[doc.category];
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileIcon type={doc.type} />
                          <span className="font-medium text-gray-800 truncate max-w-[260px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold border', cfg.bg, cfg.color)}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.client || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{doc.date}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{doc.size || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid view */}
        {filtered.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((doc) => {
              const cfg = CATEGORY_CONFIG[doc.category];
              return (
                <motion.div key={doc.id} layout
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <FileIcon type={doc.type} />
                    <button onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">{doc.name}</p>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold border', cfg.bg, cfg.color)}>{cfg.label}</span>
                  {doc.client && <p className="text-[11px] text-gray-400 mt-1 truncate">{doc.client}</p>}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">{doc.date}</span>
                    <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <UploadModal onClose={() => setModal(false)} onAdd={(doc) => setDocs((prev) => [doc, ...prev])} />}
      </AnimatePresence>
    </Layout>
  );
}
