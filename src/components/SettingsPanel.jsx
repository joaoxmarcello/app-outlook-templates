import { useRef, useState } from 'react';

export default function SettingsPanel({ templates, onImport, onClearAll, onClose }) {
  const fileInputRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-templates-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('O arquivo deve conter um array de templates');
        const valid = data.every((t) => typeof t.id === 'string' && typeof t.name === 'string');
        if (!valid) throw new Error('Um ou mais templates estão com formato inválido');

        onImport(data);
        setImportSuccess(
          `${data.length} template${data.length > 1 ? 's' : ''} importado${data.length > 1 ? 's' : ''} com sucesso (duplicatas ignoradas)`
        );
      } catch (err) {
        setImportError('Erro ao importar: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Exportar / Importar */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Exportar / Importar
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={templates.length === 0}
              className="w-full text-left text-xs py-2.5 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <span className="text-base">⬇️</span>
              <div>
                <p className="font-medium">Exportar templates</p>
                <p className="text-gray-400">
                  {templates.length} template{templates.length !== 1 ? 's' : ''} como arquivo JSON
                </p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left text-xs py-2.5 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
            >
              <span className="text-base">⬆️</span>
              <div>
                <p className="font-medium">Importar templates</p>
                <p className="text-gray-400">Carregar arquivo JSON exportado anteriormente</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />

            {importError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                ❌ {importError}
              </div>
            )}
            {importSuccess && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                ✅ {importSuccess}
              </div>
            )}
          </div>
        </div>

        {/* Informações */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Armazenamento
          </h3>
          <div className="bg-gray-50 rounded-md border border-gray-200 px-3 py-2.5 text-xs text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Templates salvos:</span> {templates.length}
            </p>
            <p>
              <span className="font-medium">Local:</span> localStorage do navegador
            </p>
            <p className="text-gray-400">
              Os templates ficam salvos neste dispositivo e não são sincronizados automaticamente.
              Use Exportar/Importar para fazer backup ou transferir.
            </p>
          </div>
        </div>

        {/* Zona de perigo */}
        <div>
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
            Zona de perigo
          </h3>
          {confirmClear ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-xs text-red-700 mb-3">
                ⚠️ Isso vai apagar <strong>todos os {templates.length} templates</strong>. Esta
                ação <strong>não pode ser desfeita</strong>. Considere exportar antes.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded-md font-medium transition-colors"
                >
                  Apagar tudo
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-2 px-3 rounded-md transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={templates.length === 0}
              className="w-full text-left text-xs py-2.5 px-3 rounded-md border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <span className="text-base">🗑️</span>
              <span className="font-medium">Apagar todos os templates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
