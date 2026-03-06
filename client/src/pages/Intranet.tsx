import { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

type TabType = 'arquivos' | 'fotos' | 'links';

export default function Intranet() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('arquivos');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form states
  const [fileForm, setFileForm] = useState({ title: '', description: '', category: 'geral' });
  const [photoForm, setPhotoForm] = useState({ title: '', description: '', album: 'geral' });
  const [linkForm, setLinkForm] = useState({ title: '', description: '', url: '', category: 'geral' });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar autenticado para acessar a intranet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar ao Calendário
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      // TODO: Implementar upload de arquivo via tRPC
      console.log('Uploading file:', file.name);
      // const result = await trpc.intranet.uploadFile.mutate({
      //   file,
      //   ...fileForm
      // });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // TODO: Implementar upload de foto via tRPC
      console.log('Uploading photo:', file.name);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="relative">
        <div className="h-1 flex">
          <div className="flex-1 bg-[#00924a]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#ce2b37]"></div>
        </div>
      </div>

      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-primary hover:text-primary/80 font-semibold flex items-center gap-2"
          >
            ← Voltar ao Calendário
          </button>
          
          <h1 className="text-5xl font-bold text-primary mb-2">Intranet</h1>
          <p className="text-lg text-muted-foreground">Compartilhe arquivos, fotos e links com a equipe</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(['arquivos', 'fotos', 'links'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab === 'arquivos' && <FileText className="inline mr-2 w-5 h-5" />}
              {tab === 'fotos' && <ImageIcon className="inline mr-2 w-5 h-5" />}
              {tab === 'links' && <LinkIcon className="inline mr-2 w-5 h-5" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-primary mb-4">
                {activeTab === 'arquivos' && 'Enviar Arquivo'}
                {activeTab === 'fotos' && 'Enviar Foto'}
                {activeTab === 'links' && 'Adicionar Link'}
              </h3>

              {activeTab === 'arquivos' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título do arquivo"
                    value={fileForm.title}
                    onChange={(e) => setFileForm({ ...fileForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Descrição"
                    value={fileForm.description}
                    onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <select
                    value={fileForm.category}
                    onChange={(e) => setFileForm({ ...fileForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="geral">Geral</option>
                    <option value="marketing">Marketing</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="operacional">Operacional</option>
                  </select>
                  <label className="block">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-5 h-5" />
                      {uploadingFile ? 'Enviando...' : 'Selecionar Arquivo'}
                    </div>
                  </label>
                </div>
              )}

              {activeTab === 'fotos' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título da foto"
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Descrição"
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <select
                    value={photoForm.album}
                    onChange={(e) => setPhotoForm({ ...photoForm, album: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="geral">Geral</option>
                    <option value="eventos">Eventos</option>
                    <option value="equipe">Equipe</option>
                    <option value="clientes">Clientes</option>
                  </select>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors flex items-center justify-center gap-2 font-semibold">
                      <Upload className="w-5 h-5" />
                      {uploadingPhoto ? 'Enviando...' : 'Selecionar Foto'}
                    </div>
                  </label>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título do link"
                    value={linkForm.title}
                    onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Descrição"
                    value={linkForm.description}
                    onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <select
                    value={linkForm.category}
                    onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="geral">Geral</option>
                    <option value="ferramentas">Ferramentas</option>
                    <option value="documentos">Documentos</option>
                    <option value="recursos">Recursos</option>
                  </select>
                  <button
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">
                {activeTab === 'arquivos' && 'Arquivos Compartilhados'}
                {activeTab === 'fotos' && 'Galeria de Fotos'}
                {activeTab === 'links' && 'Links Úteis'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Placeholder items */}
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {activeTab === 'arquivos' && (
                          <FileText className="w-8 h-8 text-primary" />
                        )}
                        {activeTab === 'fotos' && (
                          <ImageIcon className="w-8 h-8 text-primary" />
                        )}
                        {activeTab === 'links' && (
                          <LinkIcon className="w-8 h-8 text-primary" />
                        )}
                        <div>
                          <h4 className="font-semibold text-foreground">Item {item}</h4>
                          <p className="text-sm text-muted-foreground">Categoria: Geral</p>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Descrição do item compartilhado
                    </p>
                    {activeTab === 'arquivos' && (
                      <button className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                    {activeTab === 'links' && (
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 text-sm"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Abrir Link
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty state */}
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum {activeTab === 'arquivos' ? 'arquivo' : activeTab === 'fotos' ? 'foto' : 'link'} compartilhado ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Use o painel à esquerda para adicionar novo conteúdo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-primary text-white py-8">
        <div className="container text-center">
          <p className="text-lg font-semibold">VELLOSO CIDADANIA</p>
          <p className="text-sm text-white/80 mt-1">Assessoria em Cidadania Italiana</p>
        </div>
      </div>
    </div>
  );
}
