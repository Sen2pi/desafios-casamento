const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAwmWKzns_yfVwj9cn7xCGPvv8PVeT_GDtOO0TrNWpXNpgvaadGB50QbBrJeP9F5M6Vw/exec';

const CHALLENGES = [
  {
    id: 'refrao',
    category: 'Poses Divertidas',
    name: 'A Foto do Refrão',
    icon: '🎤',
    description: 'Tirar uma foto a cantar à boca cheia no meio da pista de dança.',
    target: 25
  },
  {
    id: 'infiltrado',
    category: 'Poses Divertidas',
    name: 'O Infiltrado',
    icon: '🕵️',
    description: 'Fazer uma pose engraçada no fundo da foto de outra pessoa sem ela perceber (photobomb).',
    target: 25
  },
  {
    id: 'brinde',
    category: 'Poses Divertidas',
    name: 'Guerra de Olhares / Brinde',
    icon: '🥂',
    description: 'Fazer um brinde em grande plano focando nos copos com o grupo a sorrir ao fundo.',
    target: 25
  },
  {
    id: 'coreografia',
    category: 'Poses Divertidas',
    name: 'A Melhor Coreografia',
    icon: '💃',
    description: 'Registar o movimento mais louco na pista de dança.',
    target: 25
  },
  {
    id: 'abraco',
    category: 'Poses de Grupo',
    name: 'O Abraço de Grupo',
    icon: '🤗',
    description: 'Todo o grupo de amigos ou família num abraço bem apertado a olhar para a câmara.',
    target: 25
  },
  {
    id: 'cima',
    category: 'Poses de Grupo',
    name: 'Perspetiva de Cima',
    icon: '📐',
    description: 'Alguém tira a foto de cima enquanto o grupo junta as cabeças no centro a olhar para cima e a sorrir.',
    target: 25
  },
  {
    id: 'oculos',
    category: 'Poses de Grupo',
    name: 'Óculos e Acessórios',
    icon: '🕶️',
    description: 'Grupo a usar óculos de sol, adereços da Photobooth ou plumas de forma estilosa.',
    target: 25
  },
  {
    id: 'danca-lenta',
    category: 'Poses de Grupo',
    name: 'A Dança Lenta',
    icon: '🩰',
    description: 'Foto abraçados na pista de dança durante uma música calma.',
    target: 25
  },
  {
    id: 'beijo',
    category: 'Poses de Grupo',
    name: 'Beijo Disfarçado',
    icon: '💋',
    description: 'O casal a dar um beijo escondido atrás do menu, do copo ou de um leque.',
    target: 25
  },
  {
    id: 'cumplice',
    category: 'Poses de Grupo',
    name: 'O Olhar Cúmplice',
    icon: '👀',
    description: 'Em vez de olharem para a câmara, olharem fixamente um para o outro a sorrir.',
    target: 25
  },
  {
    id: 'noivos',
    category: 'Para Convidados',
    name: 'Com os Noivos',
    icon: '💑',
    description: 'Uma foto com os noivos a sorrir.',
    target: 25
  },
  {
    id: 'modelo',
    category: 'Para Convidados',
    name: 'Pose de Modelo',
    icon: '📸',
    description: 'A tua melhor pose de modelo no corte do bolo / pista.',
    target: 25
  },
  {
    id: 'brinde-mesa',
    category: 'Para Convidados',
    name: 'Brinde da Mesa',
    icon: '🍾',
    description: 'Um brinde com as pessoas da tua mesa.',
    target: 25
  },
  {
    id: 'sapato',
    category: 'Para Convidados',
    name: 'Sapato Extravagante',
    icon: '👠',
    description: 'O sapato mais extravagante da festa.',
    target: 25
  },
  {
    id: 'espontanea',
    category: 'Para Convidados',
    name: 'Foto Espontânea',
    icon: '😂',
    description: 'Uma foto espontânea de alguém a chorar de emoção ou a rir muito.',
    target: 25
  }
];
