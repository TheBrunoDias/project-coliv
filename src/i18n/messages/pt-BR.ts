/**
 * Source of truth for UI copy. Other languages must implement the same `Messages` shape,
 * so a missing translation is a type error. Use functions for interpolation and plurals.
 */

type ScheduleUnit = 'daily' | 'weekly' | 'monthly';

const residents = (count: number) => (count === 1 ? 'morador' : 'moradores');

export const ptBR = {
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    remove: 'Remover',
    edit: 'Editar',
    close: 'Fechar',
    loading: 'Carregando',
    or: 'ou',
    you: 'você',
    formerMember: 'Ex-morador',
    deletedGroup: 'Grupo removido',
    saveError: 'Não foi possível salvar. Tente novamente.',
    actionError: 'Não foi possível concluir. Tente novamente.',
    typeToConfirm: (text: string) => `Digite "${text}" para confirmar`,
    hello: (name: string) => `Olá, ${name}!`,
    signOut: 'Sair da conta',
    deleteAccount: 'Excluir conta',
    language: 'Idioma',
  },

  nav: {
    home: 'Início',
    tasks: 'Tarefas',
    shopping: 'Compras',
    notices: 'Mural',
    house: 'Casa',
  },

  currencies: {
    EUR: 'Euro (€)',
    BRL: 'Real (R$)',
    USD: 'Dólar americano (US$)',
    GBP: 'Libra esterlina (£)',
  },

  auth: {
    continueWithGoogle: 'Continuar com Google',
    email: 'E-mail',
    password: 'Senha',
    login: {
      title: 'Entrar',
      subtitle: 'Bem-vindo de volta à sua casa.',
      forgotPassword: 'Esqueci minha senha',
      submit: 'Entrar',
      noAccount: 'Ainda não tem conta?',
      createAccount: 'Criar conta',
      resetNeedsEmail: 'Digite seu e-mail acima para redefinir a senha.',
      resetSent:
        'Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.',
    },
    register: {
      title: 'Criar conta',
      subtitle: 'Organize a casa junto com quem mora com você.',
      name: 'Nome',
      submit: 'Criar conta',
      haveAccount: 'Já tem conta?',
      signIn: 'Entrar',
    },
    errorScreen: {
      title: 'Ops!',
      generic: 'Algo deu errado.',
      profileLoad: 'Não foi possível carregar seu perfil.',
      deleteAccount: 'Não foi possível excluir sua conta por completo. Tente novamente.',
      retry: 'Tentar novamente',
      signOut: 'Sair',
    },
    errors: {
      generic: 'Algo deu errado. Tente novamente.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/user-disabled': 'Esta conta foi desativada.',
      'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
      'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
      'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
      'auth/popup-blocked':
        'O navegador bloqueou a janela de login. Permita pop-ups e tente novamente.',
      'auth/user-mismatch': 'Entre com a mesma conta que você está usando agora.',
      'auth/requires-recent-login': 'Por segurança, entre novamente e tente outra vez.',
      'auth/missing-password': 'Digite sua senha.',
      'auth/account-exists-with-different-credential':
        'Este e-mail já está cadastrado com outro método de login.',
    },
  },

  deleteAccount: {
    title: 'Excluir conta?',
    warning: 'Esta ação não pode ser desfeita. Seu perfil e seu login serão apagados.',
    adminWarning: (house: string) =>
      `Como você é admin, a casa "${house}" também será excluída, com todos os moradores, tarefas, compras e avisos.`,
    residentWarning: (house: string) => `Você sairá da casa "${house}".`,
    confirmWord: 'EXCLUIR',
    passwordLabel: 'Sua senha',
    googleReauth: 'Por segurança, vamos pedir para você entrar com o Google mais uma vez.',
    submit: 'Excluir minha conta',
  },

  onboarding: {
    noHouse: 'Você ainda não faz parte de nenhuma casa.',
    createTitle: 'Criar uma casa',
    createDescription: 'Você será o admin e poderá convidar os moradores.',
    inviteTitle: 'Recebeu um convite?',
    inviteDescription: 'Abra o link que o admin da casa compartilhou com você para entrar.',
  },

  createHouse: {
    name: 'Nome da casa',
    namePlaceholder: 'Ex.: República Central',
    suggestions: (firstName: string) => [`Casa de ${firstName}`, 'República', 'Apê compartilhado'],
    currency: 'Moeda das compras',
    submit: 'Criar casa',
    error: 'Não foi possível criar a casa. Tente novamente.',
  },

  house: {
    info: {
      label: 'Casa',
      rename: 'Renomear',
      renameTitle: 'Renomear casa',
      nameLabel: 'Nome da casa',
      currency: 'Moeda das compras',
      currencyError: 'Não foi possível alterar a moeda. Tente novamente.',
    },
    invite: {
      title: 'Convidar moradores',
      description: 'Qualquer pessoa com este link pode entrar na casa.',
      share: 'Compartilhar',
      copy: 'Copiar link',
      copied: 'Copiado!',
      copyError: 'Não foi possível copiar. Selecione o link e copie manualmente.',
      shareTitle: (house: string) => `Convite para ${house}`,
      shareText: (house: string) => `Entre na casa "${house}" no Coliv:`,
      regenerate: 'Gerar novo link',
      regenerateTitle: 'Gerar novo link?',
      regenerateDescription:
        'O link atual deixará de funcionar. Quem já mora na casa não é afetado.',
    },
    members: {
      title: 'Moradores',
      count: (count: number) => `${count} na casa`,
      admin: 'Admin',
      resident: 'Morador',
      youSuffix: '(você)',
      removeLabel: (name: string) => `Remover ${name}`,
      removeTitle: 'Remover morador?',
      removeDescription: (name: string) =>
        `${name} sairá da casa e precisará de um novo convite para voltar.`,
    },
    groups: {
      title: 'Grupos',
      description: 'Quartos ou equipes que podem dividir tarefas.',
      new: 'Novo',
      empty: 'Nenhum grupo ainda. Ex.: "Quarto 1", "Cozinha".',
      noMembers: 'Sem membros',
      editMembers: 'Editar membros',
      rename: 'Renomear grupo',
      delete: 'Excluir grupo',
      newTitle: 'Novo grupo',
      nameLabel: 'Nome do grupo',
      namePlaceholder: 'Ex.: Quarto 1',
      create: 'Criar grupo',
      deleteTitle: 'Excluir grupo?',
      deleteDescription: (name: string) =>
        `O grupo "${name}" será excluído. Os moradores continuam na casa.`,
      membersTitle: (name: string) => `Membros de ${name}`,
    },
    account: {
      title: 'Sua conta',
    },
    danger: {
      deleteHouse: 'Excluir casa',
      leave: 'Sair da casa',
      adminDescription:
        'Como admin, para sair você precisa excluir a casa. Todos os moradores, tarefas, compras e avisos serão apagados.',
      residentDescription: 'Você deixará de ver as tarefas, compras e avisos desta casa.',
      deleteTitle: 'Excluir casa?',
      deleteDescription:
        'Esta ação não pode ser desfeita. Todos os dados da casa serão apagados permanentemente.',
      leaveTitle: 'Sair da casa?',
      leaveDescription: 'Para voltar, você precisará de um novo convite.',
    },
  },

  invite: {
    invalidTitle: 'Convite inválido',
    invalidDescription:
      'Este link não existe mais ou foi substituído. Peça um novo link para o admin da casa.',
    backHome: 'Voltar ao início',
    alreadyMember: 'Você já faz parte desta casa.',
    goToHouse: 'Ir para a casa',
    otherHouseTitle: (house: string) => `Convite para ${house}`,
    otherHouseDescription:
      'Você já mora em outra casa. Para aceitar este convite, saia da sua casa atual primeiro.',
    goToMyHouse: 'Ir para minha casa',
    invited: 'Você foi convidado para morar nesta casa no Coliv.',
    join: 'Entrar na casa',
    switchAccount: (name: string) => `Não é você, ${name}? Usar outra conta`,
    joinError:
      'Não foi possível entrar na casa. O convite pode ter sido renovado; peça um novo link.',
  },

  dashboard: {
    latestNotice: 'Último aviso',
    seeNotices: 'Ver mural',
    myDuties: 'Suas responsabilidades agora',
    noDutiesNow: 'Nenhuma tarefa com você neste momento.',
    noTasks: 'A casa ainda não tem tarefas.',
    monthPurchases: 'Compras do mês',
    monthSummary: (total: string, perPerson: string) =>
      `${total} no total · ${perPerson} por pessoa`,
    noPurchasesThisMonth: 'Nenhuma compra registrada este mês',
    onDuty: 'Quem está de plantão',
    seeAll: 'Ver tudo',
  },

  tasks: {
    title: 'Tarefas',
    new: 'Nova tarefa',
    emptyAdmin: 'Nenhuma tarefa ainda. Crie a primeira, como "Tirar o lixo", e defina o rodízio.',
    emptyResident: 'Nenhuma tarefa ainda. O admin da casa pode criar os rodízios.',
    editLabel: 'Editar tarefa',
    deleteLabel: 'Excluir tarefa',
    deleteTitle: 'Excluir tarefa?',
    deleteDescription: (title: string) =>
      `"${title}" deixará de aparecer para todos os moradores.`,
    schedule: (unit: ScheduleUnit, interval: number) => {
      if (interval === 1) return { daily: 'Todo dia', weekly: 'Toda semana', monthly: 'Todo mês' }[unit];
      return `A cada ${interval} ${{ daily: 'dias', weekly: 'semanas', monthly: 'meses' }[unit]}`;
    },
    units: { daily: 'dias', weekly: 'semanas', monthly: 'meses' } satisfies Record<ScheduleUnit, string>,
    card: {
      responsibleNow: 'Responsável agora',
      fixed: 'Responsável fixo',
      startsOn: (day: string) => `Começa ${day}`,
      noAssignee: 'Sem responsável',
      next: 'Próximo:',
      changes: (day: string) => `troca ${day}`,
      rotationAmong: (count: number, schedule: string) => `Rodízio entre ${count} · ${schedule}`,
      noRotation: 'Sem rodízio',
    },
    form: {
      newTitle: 'Nova tarefa',
      editTitle: 'Editar tarefa',
      title: 'Tarefa',
      titlePlaceholder: 'Ex.: Tirar o lixo',
      details: 'Detalhes (opcional)',
      detailsPlaceholder: 'Ex.: Lixo reciclável às terças e sextas',
      assignees: 'Responsáveis, na ordem do rodízio',
      residents: 'Moradores',
      groups: 'Grupos',
      residentsHint: 'A tarefa fica com uma pessoa por vez.',
      groupsHint: 'A tarefa fica com um grupo inteiro por vez (ex.: Quarto A, depois Quarto B).',
      noGroups: 'Ainda não há grupos. Crie-os em',
      noGroupsLink: 'Casa → Grupos',
      schedule: 'A vez passa para o próximo',
      custom: 'Personalizado…',
      every: 'A cada',
      quantity: 'Quantidade',
      unit: 'Unidade',
      invalidInterval: (max: number) => `Use um número entre 1 e ${max}.`,
      firstTurnStarts: 'Turno do 1º da lista começa em',
      startsFrom: 'A partir de',
      create: 'Criar tarefa',
      error: 'Não foi possível salvar a tarefa. Tente novamente.',
      previewStarts: (name: string, day: string) => `${name} começa ${day}.`,
      previewNow: (name: string) => `Agora: ${name}.`,
      previewNext: (name: string, day: string) => ` Depois, ${name} a partir de ${day}.`,
    },
    rotation: {
      moveUp: 'Subir',
      moveDown: 'Descer',
      remove: 'Remover',
    },
  },

  purchases: {
    title: 'Compras',
    register: 'Registrar compra',
    empty:
      'Comprou algo para a casa? Registre a compra e o valor, e o app mostra quanto fica para cada morador.',
    monthTotal: (total: string) => `${total} no total`,
    perPerson: 'por pessoa',
    editLabel: 'Editar compra',
    deleteLabel: 'Excluir compra',
    deleteTitle: 'Excluir compra?',
    deleteDescription: 'A compra deixará de aparecer na divisão para todos os moradores.',
    card: {
      paidBy: (name: string) => `${name} pagou`,
      splitAmong: (count: number) => `Dividido entre ${count} ${residents(count)}`,
      perPersonShort: '/ pessoa',
    },
    form: {
      newTitle: 'Registrar compra',
      editTitle: 'Editar compra',
      description: 'Descrição (opcional)',
      descriptionPlaceholder: 'Ex.: Compra do mês no supermercado',
      items: 'Itens',
      itemsPlaceholder: 'Ex.: Papel higiênico',
      moreItems: 'Mais algum item?',
      addItem: 'Adicionar item',
      removeItem: (item: string) => `Remover ${item}`,
      contentHint: 'Preencha a descrição, os itens ou os dois. Em compras grandes, a descrição basta.',
      amount: 'Valor total',
      amountPlaceholder: '0,00',
      date: 'Data',
      invalidAmount: 'Digite um valor válido, como 50 ou 12,50.',
      perPerson: (amount: string) => `${amount} por pessoa`,
      splitAmong: (amount: string, count: number) =>
        `${amount} dividido entre ${count} ${residents(count)}`,
      submit: 'Registrar compra',
      error: 'Não foi possível salvar a compra. Tente novamente.',
    },
  },

  notices: {
    title: 'Mural',
    newAnnouncement: 'Novo aviso',
    rulesTitle: 'Regras da casa',
    addRule: 'Regra',
    noRulesAdmin: 'Nenhuma regra ainda. Ex.: "Silêncio após as 22h", "Louça lavada no mesmo dia".',
    noRules: 'Nenhuma regra definida ainda.',
    announcements: 'Avisos',
    noAnnouncementsAdmin:
      'Publique recados para todos os moradores, como visitas técnicas ou mudanças na casa.',
    noAnnouncements: 'Nenhum aviso por enquanto.',
    deleteRuleTitle: 'Excluir regra?',
    deleteAnnouncementTitle: 'Excluir aviso?',
    deleteDescription: (title: string) =>
      `"${title}" será removido do mural para todos os moradores.`,
    edited: 'editado',
    form: {
      newTitle: 'Publicar no mural',
      editRule: 'Editar regra',
      editAnnouncement: 'Editar aviso',
      announcement: 'Aviso',
      rule: 'Regra da casa',
      ruleHint: 'Regras ficam fixas no topo do mural até serem removidas.',
      announcementHint: 'Avisos são recados do dia a dia, do mais recente ao mais antigo.',
      title: 'Título',
      rulePlaceholder: 'Ex.: Silêncio após as 22h',
      announcementPlaceholder: 'Ex.: Manutenção do aquecedor na sexta',
      details: 'Detalhes (opcional)',
      publish: 'Publicar',
      error: 'Não foi possível publicar. Tente novamente.',
    },
  },
};

export type Messages = typeof ptBR;
