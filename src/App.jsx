import { useState } from 'react';
import { useOffice } from './hooks/useOffice';
import { useTemplates } from './hooks/useTemplates';
import TemplateList from './components/TemplateList';
import TemplateEditor from './components/TemplateEditor';
import PlaceholderModal from './components/PlaceholderModal';
import SettingsPanel from './components/SettingsPanel';

// Extrai placeholders {{variavel}} de subject + body
function extractPlaceholders(template) {
  const all = [...(template.subject || ''), ...(template.body || '')].join('');
  return [
    ...new Set(
      [...`${template.subject || ''} ${template.body || ''}`.matchAll(/\{\{(\w+)\}\}/g)].map(
        (m) => m[1]
      )
    ),
  ];
}

// Substitui {{variavel}} pelos valores fornecidos
function applyPlaceholders(text, values) {
  return (text || '').replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);
}

export default function App() {
  const { isOfficeReady, isOfficeAvailable, insertTemplate } = useOffice();
  const {
    templates,
    categories,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    importTemplates,
    clearAll,
  } = useTemplates();

  const [view, setView] = useState('list'); // 'list' | 'editor' | 'settings'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [pendingInsert, setPendingInsert] = useState(null);
  const [insertError, setInsertError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!isOfficeReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleUseTemplate = (template) => {
    setInsertError('');
    const placeholders = extractPlaceholders(template);

    if (placeholders.length > 0) {
      setPendingInsert({ template, placeholders });
    } else {
      doInsert(template, {});
    }
  };

  const doInsert = async (template, values) => {
    const subject = applyPlaceholders(template.subject, values);
    const body = applyPlaceholders(template.body, values);
    const result = await insertTemplate(subject, body, template.insertMode || 'replace');
    if (result && !result.success) {
      setInsertError('Erro ao inserir: ' + result.error);
    }
  };

  const handlePlaceholderConfirm = (values) => {
    doInsert(pendingInsert.template, values);
    setPendingInsert(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setView('editor');
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setView('editor');
  };

  const handleSave = (data) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data);
    } else {
      addTemplate(data);
    }
    setView('list');
    setEditingTemplate(null);
  };

  const handleCancel = () => {
    setView('list');
    setEditingTemplate(null);
  };

  // ── Filtro de templates ───────────────────────────────────────────────────

  const filtered = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q);
    const matchCategory = !selectedCategory || t.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // ── Título da view atual ──────────────────────────────────────────────────
  const viewTitle = {
    list: 'Meus Templates',
    editor: editingTemplate ? 'Editar Template' : 'Novo Template',
    settings: 'Configurações',
  }[view];

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-blue-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button
              onClick={handleCancel}
              title="Voltar"
              className="text-blue-200 hover:text-white transition-colors text-lg leading-none"
            >
              ←
            </button>
          )}
          <span className="font-bold text-sm">{viewTitle}</span>
        </div>

        {view === 'list' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setView('settings')}
              title="Configurações"
              className="text-blue-200 hover:text-white transition-colors text-base w-7 h-7 flex items-center justify-center rounded hover:bg-blue-500"
            >
              ⚙️
            </button>
            <button
              onClick={handleNew}
              className="bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold px-2.5 py-1.5 rounded transition-colors"
            >
              + Novo
            </button>
          </div>
        )}
      </header>

      {/* ── Aviso de erro de inserção ──────────────────────────────────────── */}
      {insertError && (
        <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-3 py-1.5 flex-shrink-0">
          <p className="text-xs text-red-700">{insertError}</p>
          <button
            onClick={() => setInsertError('')}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Contagem de resultados ─────────────────────────────────────────── */}
      {view === 'list' && templates.length > 0 && (
        <div className="px-3 py-1.5 bg-gray-50 border-b text-xs text-gray-500 flex-shrink-0 flex items-center justify-between">
          <span>
            {filtered.length === templates.length
              ? `${templates.length} template${templates.length !== 1 ? 's' : ''}`
              : `${filtered.length} de ${templates.length} templates`}
          </span>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
              className="text-blue-500 hover:text-blue-700 text-xs"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Conteúdo principal ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {view === 'list' && (
          <TemplateList
            templates={filtered}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onUse={handleUseTemplate}
            onEdit={handleEdit}
            onDelete={deleteTemplate}
            onDuplicate={duplicateTemplate}
            isOfficeAvailable={isOfficeAvailable}
          />
        )}

        {view === 'editor' && (
          <TemplateEditor
            template={editingTemplate}
            categories={categories}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {view === 'settings' && (
          <SettingsPanel
            templates={templates}
            onImport={importTemplates}
            onClearAll={clearAll}
            onClose={() => setView('list')}
          />
        )}
      </main>

      {/* ── Modal de placeholders ─────────────────────────────────────────── */}
      {pendingInsert && (
        <PlaceholderModal
          placeholders={pendingInsert.placeholders}
          templateName={pendingInsert.template.name}
          onConfirm={handlePlaceholderConfirm}
          onCancel={() => setPendingInsert(null)}
        />
      )}
    </div>
  );
}
