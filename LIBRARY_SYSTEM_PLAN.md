# Sistema de Bibliotecas Externas - Plano de Implementação

## Objetivo

Implementar sistema de importação/exportação de bibliotecas com suporte a referências externas via URL.

---

## ⚠️ REGRA DE IMPLEMENTAÇÃO IMPORTANTE

Após completar cada fase:

1. ✅ Marcar fase como concluída no plano (`[x]`)
2. 💾 **Fazer commit das alterações da fase**
3. ➡️ **Aguardar confirmação para prosseguir**
4. 🚀 Só então iniciar a próxima fase

**Nunca pular fases ou fazer múltiplas fases sem commit intermediário!**

---

## Requisitos

### Funcionalidades Principais

1. **Exportar biblioteca** - Salvar biblioteca como JSON separado
2. **Importar biblioteca via arquivo** - Com escolha: interno ou externo
3. **Importar biblioteca via URL** - Com escolha: interno ou externo
4. **Bibliotecas Externas** - Referência por URL, carregada sempre que abrir projeto
5. **Gerenciador de Bibliotecas** - Interface para gerenciar todas as bibliotecas

### Tipos de Biblioteca

- **Internal**: Criada no projeto, editável
- **Imported**: Importada de arquivo/URL mas salva no JSON, editável
- **External**: Referência por URL, carregada dinamicamente, read-only

### Sistema de Fallback (Opção D)

- Retry inteligente: 3 tentativas com backoff
- Cache no localStorage se carregar com sucesso
- Se falhar: usa cache (se existir) ou modo degradado
- Detectar: problema de internet do usuário vs URL quebrada
- Mostrar status: Online, Cache, Indisponível

---

## 📋 Plano de Implementação Reorganizado

### **FASE 1: Fundação - Tipos Base**

✅ Não quebra código existente - apenas adiciona novos tipos

1.1. Criar `types/librarySource.ts`

- `LibrarySourceType`: 'internal' | 'imported' | 'external'
- `LibraryLoadStatus`: 'online' | 'cached' | 'unavailable' | 'loading'
- `ExternalLibraryReference` interface

  1.2. Atualizar `types/library.ts` (retrocompatível)

- Adicionar campos opcionais: `sourceType?`, `sourceUrl?`
- Manter compatibilidade com bibliotecas existentes

  1.3. Atualizar `types/project.ts` (retrocompatível)

- Adicionar campo opcional: `externalLibraries?: ExternalLibraryReference[]`

### **FASE 2: Validação**

✅ Independente - apenas adiciona funções utilitárias

2.1. Adicionar em `utils/typeValidators.ts`

- `validateLibrary(data: unknown)` - valida estrutura de Library
- Reutilizar helpers existentes (isObject, isArray, isString)

### **FASE 3: Cache**

✅ Independente - módulo isolado

3.1. Criar `utils/libraryCache.ts`

- Interface para localStorage
- Funções: save, get, clear, list, clearAll
- Prefixo: `visual-wiring:lib-cache:`

### **FASE 4: Carregamento Externo**

✅ Usa apenas tipos já criados nas fases anteriores

4.1. Criar `utils/externalLibraryLoader.ts`

- `detectNetworkError()` - distingue offline vs URL inválida
- `loadExternalLibrary(url)` - com retry e fallback
- Usa: validateLibrary, libraryCache

  4.2. Criar `utils/libraryManager.ts`

- `loadAllExternalLibraries(references[])` - carrega em paralelo
- Agrupa erros por tipo
- Retorna status consolidado

### **FASE 5: Operações de Biblioteca**

✅ Usa tipos já criados, funções independentes

5.1. Adicionar em `utils/projectManager.ts`

- `exportLibraryToFile(library)` - salva como JSON
- `importLibraryToProject(project, library, generateNewIds?)` - adiciona ao projeto
- `addExternalLibraryReference(project, url)` - adiciona referência
- `removeLibrary(project, libraryId)`
- `convertExternalToInternal(project, libraryId)`

### **FASE 6: Hook de Importação**

✅ Reutiliza useLoadFromURL existente

6.1. Criar `hooks/useLibraryImport.ts`

- Wrapper do useLoadFromURL com validator de biblioteca
- Estado para controlar fluxo de importação

### **FASE 7: Atualizar Provider**

✅ Adiciona funcionalidades sem quebrar existentes

7.1. Atualizar `hooks/ProjectProvider.tsx`

- Ao carregar projeto: chamar loadAllExternalLibraries()
- Mesclar bibliotecas internas + externas
- Estado: libraryLoadStatus
- Novas funções: exportLibrary, importLibrary, addExternalLibrary

  7.2. Atualizar `hooks/ProjectContext.ts`

- Adicionar tipos das novas funções

### **FASE 8: UI - Modal de Importação**

✅ Novos componentes, não afeta código existente

8.1. Criar `components/ImportLibraryModal/`

- Similar ao ImportModal
- Valida com validateLibrary
- Abre modal de escolha após carregar

  8.2. Criar `components/LibraryImportChoiceModal/`

- Pergunta: interno vs externo
- Mostra preview da biblioteca

### **FASE 9: UI - Indicadores de Status**

✅ Componentes novos e isolados

9.1. Criar `components/LibraryStatusIcon/`

- Ícone + tooltip mostrando status
- Props: status, url, lastFetched

### **FASE 10: Atualizar Sidebar**

✅ Modificações incrementais em componente existente

10.1. Atualizar `components/ProjectSidebar/`

- Adicionar LibraryStatusIcon nas libs externas
- Desabilitar edição para libs externas

  10.2. Atualizar `components/Library/`

- Props para indicar se é read-only
- Ocultar botões de edição se external

### **FASE 11: UI - Gerenciador de Bibliotecas**

✅ Nova funcionalidade isolada

11.1. Criar `components/LibraryManager/`

- Modal/página de gerenciamento
- Lista todas as bibliotecas
- Ações: exportar, remover, converter

  11.2. Adicionar botão no ProjectPage/AppBar

- Abrir gerenciador

### **FASE 12: Feedback ao Usuário**

✅ Adiciona apenas notificações, não quebra fluxo

12.1. Modal de status de carregamento

- Mostrar ao carregar projeto com libs externas
- Resumo: sucessos, cache, erros

  12.2. Snackbar notifications

- Avisos relevantes durante operações

### **FASE 13: Migrações**

✅ Garante retrocompatibilidade

13.1. Atualizar `utils/projectMigrations.ts`

- Adicionar migração se necessário
- Garantir projetos antigos funcionem

### **FASE 14: Testes Finais**

14.1. Testar todos os fluxos
14.2. Ajustes finais

---

## Status de Implementação

- [x] Fase 1: Fundação - Tipos Base ✅
- [x] Fase 2: Validação ✅
- [x] Fase 3: Cache ✅
- [x] Fase 4: Loader de Bibliotecas Externas ✅
- [x] Fase 5: Operações de Biblioteca ✅
- [x] Fase 6: Hook de Importação ✅
- [x] Fase 7: Atualizar Provider ✅
- [x] Fase 8: UI - Modal de Importação ✅
- [ ] Fase 9: UI - Indicadores de Status
- [ ] Fase 4: Carregamento Externo
- [ ] Fase 5: Operações de Biblioteca
- [ ] Fase 6: Hook de Importação
- [ ] Fase 7: Atualizar Provider
- [ ] Fase 8: UI - Modal de Importação
- [ ] Fase 9: UI - Indicadores de Status
- [ ] Fase 10: Atualizar Sidebar
- [ ] Fase 11: UI - Gerenciador de Bibliotecas
- [ ] Fase 12: Feedback ao Usuário
- [ ] Fase 13: Migrações
- [ ] Fase 14: Testes Finais

---

## Notas Técnicas

### Detecção de Conectividade

```typescript
// Verifica se é erro de rede (offline) ou URL inválida
navigator.onLine // false = sem internet
fetch error.name === 'TypeError' && message.includes('fetch') // problema de rede
response.ok === false // URL retornou erro HTTP
```

### Estrutura de Cache

```typescript
localStorage.setItem('visual-wiring:lib-cache:URL_HASH', JSON.stringify({
  url: string,
  library: Library,
  timestamp: string,
  etag?: string // futuro: validação de cache
}));
```

### Geração de IDs Únicos

- Ao importar com `generateNewIds=true`:
  - Library: novo UUID
  - Components: novos UUIDs
  - Manter referências internas consistentes
