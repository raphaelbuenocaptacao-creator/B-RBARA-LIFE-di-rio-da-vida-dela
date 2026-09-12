# BÁRBARA LIFE

Aplicativo PWA privado de diário, metas, autocuidado, beleza, saúde e evolução pessoal, criado exclusivamente para a Bárbara.

## Arquitetura

- React + Vite + TypeScript
- PWA instalável e mobile-first
- Backend compartilhado AUREON Base em `https://aureonbase.vercel.app`
- Tenant exclusivo: `barbara-life`
- Dados pessoais armazenados em coleções `owner_scoped`
- Acesso do app restrito ao e-mail autorizado da Bárbara
- Sessão persistente com access/refresh token próprios do BÁRBARA LIFE
- Sem cadastro público na interface
- Recuperação de senha pelo AUREON Base

## Dados isolados

O projeto `barbara-life` possui ambientes próprios e coleções privadas para diário, metas, humor, bem-estar, autocuidado, memórias, sonhos, conquistas e lembretes. Cada registro é associado ao usuário autenticado pela camada de tenant do AUREON Base.

## Publicação

A produção é publicada pelo GitHub Pages a partir da branch `main` depois que testes e build passam no GitHub Actions.

URL esperada:

`https://raphaelbuenocaptacao-creator.github.io/B-RBARA-LIFE-di-rio-da-vida-dela/`
