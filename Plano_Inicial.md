# Plano de Desenvolvimento — Plataforma Pública Modular

**Versão:** 1.0  
**Data:** 16 de setembro de 2026  
**Objetivo:** construir uma plataforma SaaS modular para prefeituras brasileiras. Cada ente contrata somente as áreas de que necessita, mas todos os módulos funcionam sobre uma base única de dados, documentos, identidade e processos.

---

## 1. Visão de produto

A plataforma deve resolver uma falha recorrente da administração pública: dados, documentos e solicitações do cidadão ficam espalhados entre planilhas, pastas, sistemas legados e secretarias. O produto será uma **plataforma pública integrada**, não apenas uma coleção de sistemas.

Princípios:

1. **Núcleo único, módulos independentes.** Uma prefeitura pode começar apenas com atendimento e processo digital, depois incluir tributação, obras ou educação sem recadastrar dados.
2. **Digital primeiro, sem excluir o presencial.** O atendente deve conseguir abrir um pedido presencial e digitalizar documentos; o cidadão deve conseguir fazer o mesmo pelo portal ou celular.
3. **Integração antes de substituição.** A prefeitura pode manter sistemas existentes, desde que a nova plataforma consiga trocar dados de modo seguro e auditável.
4. **Conformidade como requisito de arquitetura.** LGPD, transparência, retenção documental, rastreabilidade e integrações regulatórias entram desde o início.
5. **Configuração por ente.** Leis, organogramas, tipos de processo, taxas, prazos, formulários e fluxos variam por município. Devem ser configuráveis, sem alterar código na maior parte dos casos.
6. **Mobile orientado ao trabalho de campo.** O celular serve para vistoria, foto, geolocalização, coleta offline e consulta; a gestão completa continua prioritariamente no navegador.

### Resultado esperado

```
Cidadão / servidor / fornecedor
             │
 Portal web · aplicativo móvel · balcão presencial
             │
 Núcleo Público: identidade · processo · documento · comunicação · auditoria
             │
 Tributação | Compras | Obras | Saúde | Educação | Assistência | RH | demais módulos
             │
 Integrações: GOV.BR · PNCP · NFS-e · e-SUS · Educacenso · eSocial · legados
```

---

## 2. Decisão tecnológica

### Linguagem principal: TypeScript

Usar **TypeScript em modo estrito** em frontend, backend, integrações e aplicativos móveis. É a melhor escolha para esta primeira fase porque reduz linguagens e equipes distintas, permite compartilhar contratos de API e modelos de validação, e mantém produtividade elevada para uma plataforma predominantemente web. O verificador estático ajuda a reduzir erros de contrato em um domínio extenso e sensível. O React Native adota TypeScript como padrão em projetos novos, reforçando a escolha para os módulos móveis. [TypeScript](https://www.typescriptlang.org/docs/handbook/intro) e [React Native](https://reactnative.dev/docs/typescript).

Não significa que TypeScript deve ser uma regra eterna: componentes de alto volume analítico, IA ou processamento de imagem podem futuramente ser serviços isolados em Python, e isso só deve ocorrer quando houver necessidade medida.

### Stack recomendada

| Camada | Escolha inicial | Papel |
|---|---|---|
| Web administrativo e portal | Next.js + React + TypeScript | Aplicação responsiva, SSR onde útil e acessibilidade |
| API | NestJS + TypeScript | API modular, autenticação, RBAC, jobs e documentação OpenAPI |
| Mobile | React Native + Expo + TypeScript | Android/iOS; foco inicial em Android e uso offline de campo |
| Banco principal | MongoDB Atlas | Documentos por domínio, dados flexíveis e isolamento por município |
| Arquivos | Armazenamento S3 compatível | Documentos, fotos, versões e política de retenção |
| Cache/fila | Redis + fila de jobs | Sessões, limites, notificações, OCR e integrações assíncronas |
| Busca documental | PostgreSQL FTS inicialmente; OpenSearch quando a escala justificar | Busca por metadados e texto extraído por OCR |
| OCR | Serviço desacoplado; Tesseract/serviço comercial conforme qualidade | Extração de texto, classificação e conferência humana |
| Observabilidade | OpenTelemetry + logs centralizados + métricas + alertas | Diagnóstico, auditoria operacional e SLOs |
| Infraestrutura | Containers Docker, IaC e CI/CD | Ambientes reproduzíveis, implantação segura e auditável |

### Arquitetura: monólito modular primeiro

Iniciar com um **monólito modular**, e não microserviços. Cada domínio terá módulo, banco lógico, APIs e regras claramente separados. Isso diminui custo operacional e acelera a entrega inicial. Extrair serviços somente quando houver motivo concreto: OCR pesado, notificações em grande escala, busca, integrações de alta latência ou relatórios analíticos.

---

## 3. Modelo SaaS e isolamento de municípios

Cada cliente é um `tenant` (ente municipal). Todo dado de negócio deve carregar `tenant_id`; políticas de banco e testes devem impedir acesso cruzado. Para clientes grandes ou com exigência contratual, oferecer instância e banco dedicados.

Níveis de oferta:

| Plano | Uso | Operação |
|---|---|---|
| Compartilhado | Municípios pequenos e médios | Banco compartilhado com isolamento rigoroso |
| Dedicado | Municípios maiores ou dados sensíveis | Banco/ambiente próprio, mesmos artefatos de software |
| Híbrido | Dados locais e serviços em nuvem | Conectores seguros para legados e sincronização |

Entidades comuns obrigatórias: ente, unidade administrativa, usuário, perfil, cidadão, empresa, endereço/logradouro, imóvel, servidor, processo, documento, tarefa, notificação, integração e evento de auditoria.

---

## 4. Núcleo Público: primeiro produto comercial

O núcleo é obrigatório em qualquer contratação e deve ser entregue como o **MVP de mercado**. Ele é útil sozinho e será a fundação de todos os módulos posteriores.

### 4.1 Cadastro mestre

- Cadastro unificado de cidadão, empresa, endereço, unidade administrativa e servidor.
- CPF/CNPJ e dados de contato com validação e histórico de alterações.
- Deduplicação assistida; nunca mesclar registros automaticamente sem revisão humana.
- Identificador interno estável e mapeamento de identificadores dos sistemas legados.
- Consentimentos e preferências de contato quando aplicáveis.

### 4.2 Identidade e acesso
