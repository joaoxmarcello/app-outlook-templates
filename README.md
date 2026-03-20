# Meus Templates — Outlook Add-in

Add-in para Outlook que permite criar, armazenar e reutilizar templates de email, funcionando tanto no **Outlook Web (OWA)** quanto no **Outlook Clássico (Desktop)**.

---

## Funcionalidades

- ✅ Criar, editar e excluir templates com nome, assunto e corpo
- ✅ Editor visual (WYSIWYG) e editor HTML direto
- ✅ Pré-visualização do template em HTML
- ✅ **Variáveis dinâmicas** via `{{variavel}}` — preenchidas na hora de usar
- ✅ Categorias para organização
- ✅ Busca por nome, assunto ou categoria
- ✅ Duplicar templates com um clique
- ✅ Modo de inserção: substituir o corpo ou inserir no início
- ✅ Exportar/importar templates como JSON (backup e compartilhamento)
- ✅ Funciona 100% offline — armazenamento no `localStorage` do navegador

---

## Tecnologias

- **React 18** + **Vite**
- **Tailwind CSS**
- **Office.js** (API oficial de add-ins do Microsoft Office)
- Sem backend — dados armazenados localmente

---

## Executar localmente (desenvolvimento)

```bash
cd app-outlook-templates
npm install
npm run dev
```

> O app estará em `http://localhost:3000`.  
> Fora do Outlook, o botão "Usar" mostra uma prévia em `alert()` ao invés de inserir no email.

---

## Build e deploy

### Build
```bash
npm run build
# Arquivos gerados em: dist/
```

### Deploy no Render.com

1. Crie um novo serviço **Static Site** no [render.com](https://render.com)
2. Aponte para este repositório
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Após o deploy, anote a URL (ex: `https://meus-templates.onrender.com`)

> ⚠️ **HTTPS é obrigatório** para add-ins do Office. O Render.com fornece HTTPS automaticamente.

---

## Instalar o add-in no Outlook

Antes de instalar, **edite o arquivo `manifest.xml`** e substitua todas as ocorrências de `https://SEU-DOMINIO.com` pela URL real do seu deploy.

### Outlook Web (OWA)

1. Acesse o Outlook Web: [outlook.live.com](https://outlook.live.com) ou o endereço corporativo
2. Clique em **Configurações** (ícone de engrenagem) → **Exibir todas as configurações do Outlook**
3. Navegue até **Email** → **Personalizar ações** → ou vá diretamente para **Gerenciar suplementos**
4. Em **Meus suplementos**, clique em **+ Adicionar um suplemento personalizado** → **Adicionar de arquivo...**
5. Selecione o arquivo `manifest.xml`
6. Ao compor um email, clique no ícone **Meus Templates** na barra de ferramentas

### Outlook Clássico (Desktop — Windows)

1. Abra o Outlook Desktop
2. Clique em **Arquivo** → **Gerenciar Suplementos** (abre o OWA) — ou
3. Na guia **Página Inicial**, clique em **Obter Suplementos**
4. Na janela que abrir, clique em **Meus suplementos** → **+ Adicionar suplemento personalizado** → **Adicionar de arquivo...**
5. Selecione o arquivo `manifest.xml`
6. Ao compor um email, o botão **Meus Templates** aparecerá na ribbon

> **Requisito:** Office 2016 ou superior, ou Microsoft 365.

---

## Como usar

### Criar um template

1. Abra o painel "Meus Templates" no Outlook ao compor um email
2. Clique em **+ Novo**
3. Preencha nome, categoria (opcional), assunto (opcional) e conteúdo
4. Use `{{variavel}}` no corpo ou assunto para campos dinâmicos
   - Ex: `Olá {{nome}}, seu protocolo é {{protocolo}}.`
5. Clique em **Criar template**

### Usar um template

1. No painel, localize o template desejado (use a busca ou filtro de categoria)
2. Clique em **Usar**
3. Se o template tiver variáveis, um formulário aparecerá para preenchê-las
4. Clique em **Inserir template** — o conteúdo será inserido no email

### Backup e restauração

- **Exportar:** Configurações (⚙️) → Exportar templates → salva um arquivo `.json`
- **Importar:** Configurações (⚙️) → Importar templates → selecione o arquivo `.json`

---

## Estrutura do projeto

```
app-outlook-templates/
├── manifest.xml              # Manifesto do add-in (editar URLs antes de instalar)
├── index.html                # Página principal do task pane
├── public/
│   └── commands.html         # Página auxiliar exigida pelo manifesto
├── src/
│   ├── main.jsx              # Ponto de entrada (aguarda Office.onReady)
│   ├── App.jsx               # Componente principal com roteamento de views
│   ├── index.css             # Estilos globais + Tailwind
│   ├── hooks/
│   │   ├── useTemplates.js   # CRUD de templates no localStorage
│   │   └── useOffice.js      # Integração com a API Office.js
│   └── components/
│       ├── TemplateList.jsx  # Lista de templates com busca/filtro
│       ├── TemplateEditor.jsx# Editor de templates (visual + HTML)
│       ├── PlaceholderModal.jsx # Modal para preencher variáveis
│       └── SettingsPanel.jsx # Exportar, importar, limpar dados
├── render.yaml               # Config de deploy no Render.com
├── vite.config.js
├── tailwind.config.js
└── package.json
```
