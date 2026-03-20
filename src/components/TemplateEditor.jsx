import { useState, useRef, useEffect } from 'react';

const EMPTY_FORM = { name: '', subject: '', body: '', category: '' };

// Extrai nomes de placeholders {{variavel}} de uma string
function extractPlaceholders(text) {
  return [...new Set([...(text || '').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export default function TemplateEditor({ template, categories, onSave, onCancel }) {
  const isEditing = !!template;

  const [form, setForm] = useState(
    template
      ? { name: template.name, subject: template.subject || '', body: template.body || '', category: template.category || '' }
      : EMPTY_FORM
  );
  const [bodyMode, setBodyMode] = useState('visual'); // 'visual' | 'html'
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [insertMode, setInsertMode] = useState('replace'); // 'replace' | 'prepend'

  const editorRef = useRef(null);
  // Evita sobrescrever o cursor enquanto o usuário digita no modo visual
  const isSyncingRef = useRef(false);

  // Quando muda para modo visual, sincroniza state → DOM
  useEffect(() => {
    if (bodyMode === 'visual' && editorRef.current) {
      isSyncingRef.current = true;
      editorRef.current.innerHTML = form.body || '';
      isSyncingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyMode]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleEditorInput = () => {
    if (!isSyncingRef.current && editorRef.current) {
      set('body', editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    handleEditorInput();
    editorRef.current?.focus();
  };

  const insertPlaceholder = (name) => {
    const tag = `{{${name}}}`;
    if (bodyMode === 'visual' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, tag);
      handleEditorInput();
    } else {
      set('body', form.body + tag);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Informe um nome para o template';
    if (!form.body.replace(/<[^>]*>/g, '').trim()) e.body = 'O conteúdo não pode estar vazio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body,
      category: form.category.trim(),
      insertMode,
    });
  };

  const placeholders = [...extractPlaceholders(form.subject), ...extractPlaceholders(form.body)];
  const uniquePlaceholders = [...new Set(placeholders)];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-3">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nome do template <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Resposta de suporte, Boas-vindas..."
            className={`w-full border rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
          <input
            type="text"
            list="category-suggestions"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="Ex: Suporte, Vendas, RH... (opcional)"
            className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <datalist id="category-suggestions">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Assunto */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Assunto do email{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => set('subject', e.target.value)}
            placeholder="Deixe em branco para não alterar o assunto"
            className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Corpo */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700">
              Conteúdo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBodyMode('visual')}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${bodyMode === 'visual' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Visual
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setBodyMode('html')}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${bodyMode === 'html' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                HTML
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setShowPreview((p) => !p)}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPreview ? 'Fechar prévia' : 'Prévia'}
              </button>
            </div>
          </div>

          {/* Barra de formatação (somente modo visual) */}
          {bodyMode === 'visual' && (
            <div className="flex items-center gap-0.5 border border-b-0 border-gray-300 rounded-t bg-gray-50 px-1.5 py-1 flex-wrap">
              {[
                { cmd: 'bold', label: 'B', cls: 'font-bold', title: 'Negrito' },
                { cmd: 'italic', label: 'I', cls: 'italic', title: 'Itálico' },
                { cmd: 'underline', label: 'U', cls: 'underline', title: 'Sublinhado' },
              ].map(({ cmd, label, cls, title }) => (
                <button
                  key={cmd}
                  title={title}
                  onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
                  className={`${cls} text-xs w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700`}
                >
                  {label}
                </button>
              ))}
              <span className="w-px h-4 bg-gray-300 mx-0.5" />
              <button
                title="Lista com marcadores"
                onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
                className="text-sm w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                ≡
              </button>
              <button
                title="Lista numerada"
                onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }}
                className="text-xs w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600 font-mono"
              >
                1.
              </button>
              <span className="w-px h-4 bg-gray-300 mx-0.5" />
              <button
                title="Alinhar à esquerda"
                onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); }}
                className="text-xs w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                ⬅
              </button>
              <button
                title="Centralizar"
                onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter'); }}
                className="text-xs w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                ↔
              </button>
              <button
                title="Link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const url = prompt('URL do link:');
                  if (url) execCmd('createLink', url);
                }}
                className="text-xs w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center text-blue-500"
              >
                🔗
              </button>
            </div>
          )}

          {/* Editor visual (contenteditable) */}
          {bodyMode === 'visual' && (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              className={`w-full border rounded-b border-gray-300 px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[130px] max-h-[220px] overflow-y-auto ${errors.body ? 'border-red-400' : ''}`}
              style={{ lineHeight: '1.6' }}
            />
          )}

          {/* Editor HTML */}
          {bodyMode === 'html' && (
            <textarea
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="<p>Corpo do email em HTML...</p>"
              spellCheck={false}
              className={`w-full border rounded-md px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[150px] resize-y ${errors.body ? 'border-red-400' : 'border-gray-300'}`}
            />
          )}
          {errors.body && <p className="text-red-500 text-xs mt-0.5">{errors.body}</p>}
        </div>

        {/* Prévia HTML */}
        {showPreview && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pré-visualização do email
            </label>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;font-size:13px;margin:10px;color:#1f2937}ul,ol{padding-left:20px}a{color:#2563eb}</style></head><body>${form.body || '<em style="color:#9ca3af">Nenhum conteúdo ainda</em>'}</body></html>`}
              className="w-full border border-gray-200 rounded-md bg-white"
              style={{ height: '160px' }}
              sandbox="allow-same-origin"
              title="Pré-visualização do template"
            />
          </div>
        )}

        {/* Variáveis dinâmicas (placeholders) */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            Variáveis dinâmicas{' '}
            {uniquePlaceholders.length > 0 && (
              <span className="bg-amber-200 text-amber-900 rounded-full px-1.5 py-0.5 ml-1">
                {uniquePlaceholders.length} detectada{uniquePlaceholders.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <p className="text-xs text-amber-700 mb-2">
            Use <code className="bg-amber-100 px-1 rounded font-mono">{`{{variavel}}`}</code> para campos
            preenchidos na hora de usar o template.
          </p>
          <div className="flex flex-wrap gap-1">
            {['nome', 'empresa', 'cargo', 'data', 'protocolo', 'prazo', 'valor'].map((ph) => (
              <button
                key={ph}
                onClick={() => insertPlaceholder(ph)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs px-1.5 py-0.5 rounded transition-colors font-mono"
              >
                +{`{{${ph}}}`}
              </button>
            ))}
          </div>
          {uniquePlaceholders.length > 0 && (
            <div className="mt-2 pt-2 border-t border-amber-200">
              <p className="text-xs text-amber-600 mb-1">Variáveis neste template:</p>
              <div className="flex flex-wrap gap-1">
                {uniquePlaceholders.map((p) => (
                  <span key={p} className="bg-amber-200 text-amber-900 text-xs px-1.5 py-0.5 rounded font-mono">
                    {`{{${p}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modo de inserção */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Ao usar o template
          </label>
          <select
            value={insertMode}
            onChange={(e) => setInsertMode(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="replace">Substituir o corpo do email</option>
            <option value="prepend">Inserir no início do email</option>
          </select>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-1 pb-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-md font-semibold transition-colors"
          >
            {isEditing ? '💾 Salvar alterações' : '✅ Criar template'}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-md transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
