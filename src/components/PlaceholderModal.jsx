import { useState } from 'react';

export default function PlaceholderModal({ placeholders, templateName, onConfirm, onCancel }) {
  const [values, setValues] = useState(Object.fromEntries(placeholders.map((p) => [p, ''])));

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(values);
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-50 p-0">
      <div className="bg-white rounded-t-xl shadow-2xl w-full max-h-[85vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Preencher variáveis</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Template: <span className="font-medium">{templateName}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Campos */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
          {placeholders.map((placeholder, i) => (
            <div key={placeholder}>
              <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">
                {placeholder.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={values[placeholder]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [placeholder]: e.target.value }))
                }
                placeholder={`Valor para {{${placeholder}}}`}
                autoFocus={i === 0}
                className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
        </form>

        {/* Rodapé */}
        <div className="px-4 py-3 border-t flex gap-2">
          <button
            onClick={() => onConfirm(values)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2.5 rounded-md font-semibold transition-colors"
          >
            ✅ Inserir template
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2.5 px-4 rounded-md transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
