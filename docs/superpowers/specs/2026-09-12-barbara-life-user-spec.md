# DIÁRIO DA BÁRBARA — Escopo Oficial

Aplicativo PWA moderno, feminino, elegante e totalmente responsivo chamado **Diário da Bárbara / BÁRBARA LIFE**, de uso exclusivo da Bárbara.

## Identidade visual
- Rosa claro, rosa queimado, rosé, branco e detalhes discretos em dourado rosé.
- Fundos com degradês suaves.
- Cards arredondados, sombras suaves, ícones delicados, microanimações, calendário moderno, gráficos de evolução e tipografia elegante.
- Não infantil.
- Sensação principal: **“Este é o meu espaço.”**

## Login privado
- Supabase Auth.
- Sem cadastro público.
- Acesso autorizado somente para Bárbara.
- E-mail e senha.
- Sessão persistente.
- Entrar, esqueci minha senha e sair.
- RLS em todos os dados pessoais.
- Cada registro com `user_id`.
- Nunca expor `service_role` no frontend.

## Home — Meu Dia
- Saudação: “Bom dia, Bárbara 💗”.
- Data atual.
- Frase do dia automática.
- Pergunta: “Como você quer se sentir hoje?”.
- Check-in de humor: incrível, bem, normal, triste, cansada, estressada.
- Histórico salvo.

## Metas do dia
- Criar metas personalizadas.
- Nome, categoria, horário opcional, prioridade, concluída/não concluída, recorrência e observação.
- Barra de progresso e percentual.
- Celebração em 100%: “Você conseguiu, Bárbara! Dia concluído.”

## Objetivos
Categorias: financeiro, profissional, pessoal, beleza, saúde, estudos e sonhos.

Campos:
- objetivo
- motivo
- data de início
- data desejada
- progresso %
- pequenas etapas
- anotações

## Diário
- Título e texto livre.
- Perguntas opcionais: como foi meu dia, o que aconteceu, o que me deixou feliz, o que me incomodou, o que aprendi, o que quero fazer diferente amanhã e pelo que sou grata.
- Sentimento, data, fotos e favoritos.
- Calendário por dia.
- Pesquisa por conteúdo.

## Minha Evolução
- Linha do tempo.
- Dias com diário.
- Metas concluídas.
- Humor.
- Hábitos.
- Objetivos.
- Sequência de uso.
- Indicadores mensais.

## Saúde e bem-estar
- Sono.
- Água.
- Energia 1–5.
- Humor 1–5.
- Estresse 1–5.
- Exercício sim/não.
- Alimentação: muito boa, boa, poderia melhorar.
- Sem diagnóstico médico.
- Lembretes suaves de água, descanso, saúde e movimento.

## Beleza & Visual — Meu Momento
- Cabelo, skincare, maquiagem, unhas, roupas, acessórios, perfumes, organização pessoal, postura, autoestima, looks, cores e cuidados pessoais.
- Dica do dia.
- Categorias: cabelo, maquiagem, looks, skincare, unhas e autocuidado.
- Favoritos.

## Rotina de autocuidado
### Manhã
Checklist personalizável com água, skincare, cabelo, café da manhã, metas e foco do dia.

### Noite
Checklist personalizável com skincare, organização de amanhã, diário, gratidão, reduzir celular e sono.

## Calendário
Indicadores por dia para diário, metas, humor, exercício e autocuidado.

Ao tocar em um dia, exibir resumo com humor, metas, água, diário e autocuidado.

## Relatório semanal
- Metas concluídas.
- Dias com diário.
- Média de sono.
- Média de água.
- Humor predominante.
- Autocuidado.
- Mensagem: “Olhe tudo o que você conseguiu fazer por você esta semana.”

## Conquistas
Gamificação leve:
- Primeira página.
- 7 dias.
- Hidratação.
- Focada.
- Meu momento.
- Consistência de 30 dias.

## Supabase
Tabelas:
- `profiles`
- `daily_goals`
- `long_term_goals`
- `goal_steps`
- `diary_entries`
- `mood_entries`
- `wellness_checkins`
- `beauty_favorites`
- `selfcare_routines`
- `routine_items`
- `achievements`
- `reminders`

Todos os dados pessoais associados ao UUID autenticado e protegidos com RLS baseada em `(select auth.uid()) = user_id`.

## Privacidade
- Sem acesso sem login.
- Sem cadastro público.
- Sem tabelas pessoais abertas.
- RLS.
- Fotos em Storage privado.
- Sem `service_role` no frontend.
- Rotas internas protegidas.
- Opção “Bloquear Diário” com nova autenticação ou PIN local.

## PWA
- Manifest.
- Ícone.
- Splash screen.
- Service worker.
- Tela offline.
- Atualização automática segura.
- Mobile-first.
- Nome instalado: “Diário da Bárbara 💗”.

## Menu principal
- Hoje
- Metas
- Diário
- Saúde
- Beleza
- Evolução
- Bárbara

O produto deve parecer uma combinação de **diário + amiga pessoal + planejador + autocuidado + motivação + acompanhamento da evolução da Bárbara**.
