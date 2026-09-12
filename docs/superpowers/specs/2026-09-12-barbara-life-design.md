# BÁRBARA LIFE — Design Specification

## Visão
BÁRBARA LIFE é um PWA privado, carinhoso e delicado, criado exclusivamente para a Bárbara. O produto combina diário pessoal, metas, autocuidado, saúde, beleza, memórias, sonhos e evolução pessoal em uma experiência premium, feminina e acolhedora, sem linguagem infantil e sem tom romântico exagerado.

## Objetivo principal
Criar um espaço pessoal que transmita a sensação de “esse espaço foi feito só para mim”, com uso diário simples, visual rosa rosé premium e histórico seguro no Supabase.

## Stack
- React
- Vite
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Storage privado
- PWA instalável

## Identidade visual
- Rosa rosé como cor principal
- Branco e rosa claro como base
- Dourado rosé em detalhes sutis
- Cards arredondados
- Sombras leves
- Microanimações suaves
- Tipografia elegante e legível
- Visual mobile-first
- Nada infantil, carregado ou excessivamente romântico

## Navegação principal
1. Hoje
2. Diário
3. Metas
4. Cuidar de Mim
5. Evolução

## Tela de login
- Login por e-mail e senha via Supabase Auth
- Sem cadastro público
- Recuperação de senha
- Sessão persistente
- Visual limpo com a frase: “Seu espaço, seu tempo, sua história.”
- Apenas usuários previamente autorizados podem acessar

## Home — Hoje
Cabeçalho com saudação por período do dia, por exemplo: “Bom dia, Bárbara 💗”.

Conteúdo:
- frase do dia
- check-in de humor
- metas do dia
- progresso diário
- lembrete de água e saúde
- card “Bárbara, hoje”
- botão principal “Escrever sobre meu dia”
- resumo rápido de autocuidado

## Bárbara, hoje
Resumo inteligente e acolhedor baseado no histórico recente, sem diagnóstico médico.

Exemplo:
“Você está há 6 dias registrando sua rotina. Esta semana você cumpriu 78% das suas metas. Hoje, talvez valha priorizar descanso e uma meta pequena de autocuidado.”

O resumo deve usar apenas dados registrados pela própria usuária.

## Diário
- criar entrada por data
- título opcional
- texto livre
- sentimento/humor
- gratidão do dia
- aprendizado do dia
- “o que quero fazer diferente amanhã?”
- fotos opcionais
- favoritos
- busca por palavra, data ou sentimento
- calendário com dias registrados
- modo desabafo separado
- opção de PIN local adicional para abrir a área do diário

## Metas diárias
- criar, editar e concluir metas
- categorias: pessoal, saúde, beleza, trabalho, financeiro, estudos, outros
- prioridade
- horário opcional
- recorrência
- observação
- barra de progresso do dia
- mensagem de celebração ao atingir 100%

## Objetivos de longo prazo
- objetivo
- motivo
- categoria
- data de início
- data desejada
- progresso percentual
- etapas
- anotações

Categorias principais:
- financeiro
- profissional
- pessoal
- beleza
- saúde
- estudos
- sonhos

## Saúde e bem-estar
Check-in simples, sem diagnóstico:
- horas de sono
- quantidade de água
- energia de 1 a 5
- humor de 1 a 5
- estresse de 1 a 5
- atividade física sim/não
- percepção da alimentação

Lembretes suaves:
- beber água
- descansar
- registrar como está se sentindo
- movimento leve

## Cuidar de Mim
Área com autocuidado e beleza.

Categorias:
- cabelo
- skincare
- maquiagem
- unhas
- looks
- acessórios
- perfumes
- autoestima
- organização pessoal

Funções:
- dicas do dia
- favoritos
- rotina da manhã
- rotina da noite
- rotina semanal de beleza
- sequência de autocuidado

## Memórias
- foto
- texto
- data
- sentimento
- título
- favorito

## Carta para o futuro
- título
- conteúdo
- data de abertura
- bloqueada até a data escolhida no frontend

## Sonhos e desejos
- registrar coisas que quer viver, conquistar, comprar, conhecer ou realizar
- categoria
- prazo opcional
- status
- notas

## Evolução
Dashboard mensal e semanal com:
- dias com diário
- taxa de metas concluídas
- humor predominante
- média de sono
- média de água
- dias de autocuidado
- pequenas vitórias
- conquistas
- sequência de uso

## Conquistas
Gamificação discreta, sem clima de jogo.

Exemplos:
- primeira página
- 7 dias escrevendo
- 30 dias cuidando de você
- 100% das metas em um dia
- primeira memória
- primeiro mês completo

## Relatórios
### Semanal
- metas concluídas
- dias com diário
- sono médio
- água média
- humor predominante
- autocuidado

### Mensal
- visão do mês
- melhores dias
- consistência
- principais conquistas
- evolução de hábitos

## Banco de dados Supabase
Tabelas previstas:
- profiles
- daily_goals
- long_term_goals
- goal_steps
- diary_entries
- mood_entries
- wellness_checkins
- beauty_favorites
- selfcare_routines
- routine_items
- memories
- future_letters
- dreams
- achievements
- reminders

Cada tabela pessoal deve conter `user_id uuid not null` ligado ao usuário autenticado.

## Segurança
- RLS habilitado em todas as tabelas expostas
- políticas com `auth.uid() = user_id`
- sem `service_role` no frontend
- sem cadastro público
- buckets privados para fotos
- rotas internas protegidas por sessão
- dados de autorização nunca baseados em `user_metadata`
- diário com trava adicional local opcional

## Storage
Bucket privado para:
- fotos do diário
- memórias
- avatar

Caminho por usuário:
`{user_id}/...`

## PWA
- manifest
- ícone 192x192
- ícone 512x512
- modo standalone
- theme color rosa rosé
- service worker
- tela offline
- atualização segura
- nunca cachear tokens, senhas ou respostas privadas

## Estados de interface
Cada tela deve ter:
- loading
- vazio
- erro
- sucesso

Mensagens devem ser acolhedoras e curtas.

## Acessibilidade
- contraste legível
- alvos de toque adequados
- suporte a teclado quando aplicável
- labels em inputs
- não depender apenas de cor para status

## Escopo da versão 1.0
A versão 1.0 inclui:
- autenticação privada
- Home Hoje
- Diário
- Metas
- Saúde
- Beleza e autocuidado
- Memórias
- Sonhos
- Evolução
- Conquistas
- Relatórios semanal e mensal
- PWA
- Supabase com RLS

## Fora do escopo inicial
- diagnóstico médico
- aconselhamento clínico
- compartilhamento social
- múltiplos usuários visíveis entre si
- pagamentos
- chat público

## Critérios de sucesso
A versão 1.0 é considerada pronta quando:
1. Bárbara consegue entrar com segurança.
2. Todos os dados ficam salvos no Supabase.
3. Apenas ela consegue acessar os próprios dados.
4. Diário, metas, saúde e autocuidado persistem corretamente.
5. O app funciona bem no celular.
6. O app pode ser instalado como PWA.
7. Nenhuma informação privada é exposta no frontend ou em buckets públicos.
8. A experiência visual transmite cuidado, exclusividade e simplicidade.
