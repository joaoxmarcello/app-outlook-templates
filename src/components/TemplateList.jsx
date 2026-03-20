import { useState } from 'react';

function TemplateCard({ template, onUse, onEdit, onDelete, onDuplicate, isOfficeAvailable }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Remove tags HTML para exibir prévia limpa
  const bodyPreview = template.body
    ? template.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
    : '';

  return (
    <div className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Cabeçalho do card */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <h3 className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">
            {template.name}
          </h3>
          {template.category && (
            <span className="shrink-0 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full leading-none">
              {template.category}
            </span>
          )}
        </div>
        {template.subject && (
          <p className="text-xs text-gray-500 truncate">
            <span className="text-gray-400 font-medium">Assunto:</span> {template.subject}
          </p>
        )}
        {bodyPreview && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
            {bodyPreview}
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onUse(template)}
          disabled={!isOfficeAvailable}
          title={
            isOfficeAvailable
              ? 'Inserir este template no email em edição'
              : 'Disponível somente quando aberto dentro do Outlook'
          }
          className="flex-1 text-xs py-1.5 rounded font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Usar
        </button>
        <button
          onClick={() => onEdit(template)}
          title="Editar template"
          className="text-xs py-1.5 px-2.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDuplicate(template.id)}
          title="Duplicar template"
          className="text-xs py-1.5 px-2 rounded border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          ⎘
        </button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(template.id)}
              className="text-xs py-1.5 px-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs py-1.5 px-2 rounded border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Excluir template"
            className="text-xs py-1.5 px-2 rounded border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition-colors"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

export default function TemplateList({
  templates,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  isOfficeAvailable,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Barra de busca e filtros */}
      <div className="p-2 border-b bg-gray-50 space-y-1.5 flex-shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Buscar por nome ou assunto..."
          className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        />
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-600"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de templates */}
      <div className="flex-1 overflow-y-auto">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none">
            <div className="text-5xl mb-3 opacity-60">📋</div>
            <p className="text-xs font-semibold text-gray-600 mb-1">
              {searchQuery || selectedCategory
                ? 'Nenhum template encontrado'
                : 'Nenhum template ainda'}
            </p>
            <p className="text-xs text-gray-400">
              {searchQuery || selectedCategory
                ? 'Tente remover os filtros de busca'
                : 'Clique em "+ Novo" para criar seu primeiro template'}
            </p>
          </div>
        ) : (
          templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={onUse}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              isOfficeAvailable={isOfficeAvailable}
            />
          ))
        )}
      </div>

      {/* Aviso quando fora do Outlook */}
      {!isOfficeAvailable && templates.length > 0 && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700 flex-shrink-0">
          ⚠️ Abra no Outlook para usar o botão "Usar"
        </div>
      )}
    </div>
  );
}
