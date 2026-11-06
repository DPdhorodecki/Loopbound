export type Speaker = 'marcinho' | 'chuchuty' | 'kennedyto' | 'system';

/** Arte de um painel da HQ (desenhada em `src/render/comic.ts`). */
export type ComicPanelId =
  | 'school'
  | 'abduction'
  | 'lab'
  | 'cell'
  | 'radio'
  | 'escape'
  | 'capsule'
  | 'landing'
  | 'signal';

export interface StorySlide {
  speaker: Speaker;
  /** Nome curto mostrado na caixa de diálogo. */
  name: string;
  text: string;
  /** Quando presente, a cena aparece como painel de HQ acima da fala. */
  art?: ComicPanelId;
}

export interface Sector {
  id: number;
  short: string;
  name: string;
  subtitle: string;
  /** Primeira e última fase (índices 0-based). */
  range: [number, number];
  intro: StorySlide[];
  outro: StorySlide[];
}

export interface LevelRadio {
  briefing: string;
  hints: [string, string];
  solved: string;
  /** Transmissão do Chuchuty, quando a fase tem encontro com o vilão. */
  chuchuty?: string;
}

export const MARCI_NOME = 'GENERAL MARCINHO';
export const CHUCHUTY_NOME = 'ALIEN CHUCHUTY';
export const KEN_NOME = 'KENNEDYTO';
export const SYSTEM_NOME = 'SISTEMA';

/** Prólogo em HQ: do colégio ao despertar na cela. */
export const PROLOGUE: StorySlide[] = [
  {
    speaker: 'system',
    name: SYSTEM_NOME,
    art: 'school',
    text: 'COLÉGIO ESTADUAL PRESIDENTE KENNEDY. 23H47. O GUARDIÃO DO PÁTIO FAZ A RONDA DE SEMPRE — ATÉ QUE UMA SOMBRA TAPA AS ESTRELAS.',
  },
  {
    speaker: 'kennedyto',
    name: KEN_NOME,
    art: 'abduction',
    text: 'AU! AU! ...O TELHADO DO GINÁSIO ABRIU. UMA LUZ VERDE ME PEGOU PELAS PATAS. EU NÃO CONSIGO ME MEXER!',
  },
  {
    speaker: 'chuchuty',
    name: CHUCHUTY_NOME,
    art: 'lab',
    text: 'ENFIM, O CACHORRO-GUARDIÃO. VOCÊ É A CHAVE QUE EU PROCURAVA. A INSTALAÇÃO VAI ADORAR VOCÊ — E O NÚCLEO TAMBÉM.',
  },
  {
    speaker: 'kennedyto',
    name: KEN_NOME,
    art: 'cell',
    text: 'AUUU... ONDE EU ESTOU? ESTE LUGAR É FRIO, METÁLICO E CHEIRA A EXPERIMENTO ALIENÍGENA. TEM UM CAMPO ESTRANHO PULSANDO NO CHÃO.',
  },
  {
    speaker: 'marcinho',
    name: MARCI_NOME,
    art: 'radio',
    text: 'KENNEDYTO, ESTÁ ME OUVINDO? AQUI É O GENERAL MARCINHO! LOCALIZAMOS VOCÊ. A INSTALAÇÃO TEM UM CAMPO DE LOOP: CADA TENTATIVA DEIXA UM ECO. ECOS TÊM PESO. USE ISSO PARA ESCAPAR.',
  },
];

export const SECTORS: Sector[] = [
  {
    id: 1,
    short: 'CELA',
    name: 'SETOR 1 — O DESPERTAR',
    subtitle: 'Celas e corredores de serviço',
    range: [0, 5],
    intro: [
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'KENNEDYTO, PRESTE ATENÇÃO! ESSA PORTA TEM UM PAINEL DE SEGURANÇA. OBSERVE OS SÍMBOLOS AO REDOR: ELES INDICAM A SEQUÊNCIA.',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'VOCÊ ESTÁ NO BLOCO DE CELAS. SINTA O CAMPO DE LOOP: QUANDO O CICLO FECHA, SEU CAMINHO VIRA UM ECO. CHEGUE À ESCOTILHA E SAIA DESSE SETOR.',
      },
    ],
    outro: [
      {
        speaker: 'chuchuty',
        name: CHUCHUTY_NOME,
        text: 'QUEM ESTÁ SABOTANDO MINHA INSTALAÇÃO? NINGUÉM SAI DO SETOR 1 SEM A MINHA PERMISSÃO!',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'BOA, KENNEDYTO! VOCÊ SAIU DA CELA. O PRÓXIMO SETOR É O LABORATÓRIO. A ENERGIA ESTÁ CORTADA E O CHUCHUTY ESTÁ ESPERANDO.',
      },
    ],
  },
  {
    id: 2,
    short: 'LAB',
    name: 'SETOR 2 — LABORATÓRIO EXPERIMENTAL',
    subtitle: 'Energia, vidro e experimentos',
    range: [6, 11],
    intro: [
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'ENCONTREI A PLANTA ELÉTRICA DO LABORATÓRIO. A ENERGIA ESTÁ DISTRIBUÍDA EM TRÊS CIRCUITOS. FAÇA A CORRENTE CHEGAR AO PAINEL PRINCIPAL.',
      },
      {
        speaker: 'kennedyto',
        name: KEN_NOME,
        text: 'AU! TEM TUBOS COM ALGO SE MEXENDO DENTRO. MELHOR NÃO TOCAR. E O QUE É ESSE CHEIRO DE QUEIMADO?',
      },
    ],
    outro: [
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'ENERGIA RESTAURADA! OS ARQUIVOS DO LABORATÓRIO FALAM DE UM ARTEFATO ANTIGO... O NÚCLEO DO CONHECIMENTO.',
      },
      {
        speaker: 'chuchuty',
        name: CHUCHUTY_NOME,
        text: 'NÃO LEIA OS MEUS ARQUIVOS, CACHORRO! ESSE NÚCLEO É MEU!',
      },
    ],
  },
  {
    id: 3,
    short: 'INDÚSTRIA',
    name: 'SETOR 3 — SETOR INDUSTRIAL',
    subtitle: 'Esteiras, prensas e dutos',
    range: [12, 17],
    intro: [
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'ESSE SETOR É CHEIO DE MÁQUINAS. ELAS TRABALHAM EM CONJUNTO: OBSERVE O MOVIMENTO ANTES DE ATIVAR QUALQUER COISA.',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'ESTOU VENDO CÂMERAS DAQUI. O CHUCHUTY JÁ PERCEBEU QUE ALGUÉM ESTÁ SABOTANDO A INSTALAÇÃO. NÃO FIQUE PARADO NO MESMO LUGAR.',
      },
    ],
    outro: [
      {
        speaker: 'chuchuty',
        name: CHUCHUTY_NOME,
        text: 'VOCÊ ATRAVESSOU A PRODUÇÃO INTEIRA?! IMPOSSÍVEL! MEUS SISTEMAS ERAM PERFEITOS!',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'A CENTRAL DE COMANDO ESTÁ LOGO À FRENTE. É LÁ QUE O CHUCHUTY GUARDA OS ARQUIVOS DO SEQUESTRO. VÁ COM CUIDADO.',
      },
    ],
  },
  {
    id: 4,
    short: 'COMANDO',
    name: 'SETOR 4 — CENTRAL DE COMANDO',
    subtitle: 'Arquivos, senhas e perseguição',
    range: [18, 23],
    intro: [
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'KENNEDYTO, ENCONTRAMOS OS ARQUIVOS DO CHUCHUTY! ELE USA UMA SENHA BASEADA NOS REGISTROS DA INSTALAÇÃO. PROCURE PISTAS NOS DOCUMENTOS.',
      },
      {
        speaker: 'system',
        name: SYSTEM_NOME,
        text: 'ALERTA: INTRUSO DETECTADO NA CENTRAL. PROTOCOLO DE PERSEGUIÇÃO ATIVADO.',
      },
    ],
    outro: [
      {
        speaker: 'kennedyto',
        name: KEN_NOME,
        text: 'AU... ESTE DOCUMENTO DIZ QUE EU NÃO FUI SEQUESTRADO POR ACASO. EU SOU O GUARDIÃO DO NÚCLEO DO CONHECIMENTO.',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'ENTÃO É ISSO. O NÚCLEO SÓ RESPONDE A DESAFIOS DE LÓGICA. É POR ISSO QUE ELE PRECISAVA DE VOCÊ. AGORA VAMOS AO HANGAR. É A ÚLTIMA CHANCE.',
      },
    ],
  },
  {
    id: 5,
    short: 'HANGAR',
    name: 'SETOR 5 — A GRANDE FUGA',
    subtitle: 'Cápsula, lançamento e confronto final',
    range: [24, 29],
    intro: [
      {
        speaker: 'chuchuty',
        name: CHUCHUTY_NOME,
        text: 'COMO VOCÊ CONSEGUIU CHEGAR ATÉ AQUI?! NINGUÉM ESCAPA DA MINHA INSTALAÇÃO!',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'É AGORA, KENNEDYTO! ESSA É SUA ÚLTIMA OPORTUNIDADE! O SISTEMA DE LANÇAMENTO ESTÁ BLOQUEADO. USE TUDO O QUE APRENDEU. ESTAMOS ESPERANDO VOCÊ VOLTAR PARA CASA!',
      },
    ],
    outro: [
      {
        speaker: 'chuchuty',
        name: CHUCHUTY_NOME,
        text: 'NÃÃÃÃO! MEU PLANO PERFEITO! MINHA INSTALAÇÃO! MINHA CAMISETA DO IRON MAIDEN!',
      },
      {
        speaker: 'marcinho',
        name: MARCI_NOME,
        text: 'A CÁPSULA ESTÁ LIVRE! VAI, KENNEDYTO! VOLTE PARA A TERRA!',
      },
    ],
  },
];

export const ENDING: StorySlide[] = [
  {
    speaker: 'system',
    name: SYSTEM_NOME,
    art: 'capsule',
    text: 'A CÁPSULA ESCAPA SEGUNDOS ANTES DO FECHAMENTO DAS PORTAS DO HANGAR. A INSTALAÇÃO FICA PARA TRÁS, PERDIDA ENTRE AS ESTRELAS.',
  },
  {
    speaker: 'kennedyto',
    name: KEN_NOME,
    text: 'AU! AU! ...CASA. EU CONSIGO VER O COLÉGIO. E O GENERAL MARCINHO ESTÁ LÁ EMBAIXO.',
  },
  {
    speaker: 'marcinho',
    name: MARCI_NOME,
    art: 'landing',
    text: 'MISSÃO CUMPRIDA! EU SABIA QUE VOCÊ CONSEGUIRIA, KENNEDYTO!',
  },
  {
    speaker: 'system',
    name: SYSTEM_NOME,
    text: 'ENQUANTO TODOS COMEMORAM, UMA PEQUENA TELA DENTRO DA NAVE ALIENÍGENA COMEÇA A PISCAR: SINAL DETECTADO.',
  },
  {
    speaker: 'chuchuty',
    name: CHUCHUTY_NOME,
    art: 'signal',
    text: 'CHUCHUTY AINDA ESTÁ VIVO... TRANSMISSÃO INTERROMPIDA. FIM... OU SERÁ QUE NÃO?',
  },
];

/** Dicas por fase. A segunda dica é sempre mais específica que a primeira. */
export const LEVEL_RADIO: Record<string, LevelRadio> = {
  'primeiros-passos': {
    briefing: 'ANDE ATÉ A ESCOTILHA. O CAMPO DE LOOP JÁ ESTÁ ATIVO: NÃO HÁ NADA PARA DESBLOQUEAR AQUI, SÓ CAMINHO.',
    hints: ['SIGA O CORREDOR ATÉ O FIM E VIRE À DIREITA.', 'A ESCOTILHA FICA NO CANTO INFERIOR DIREITO. A GEMA É OPCIONAL.'],
    solved: 'PRIMEIRO PASSO CONCLUÍDO. AGORA VAMOS ABRIR A PRIMEIRA PORTA BLINDADA.',
  },
  'peso-morto': {
    briefing: 'EMPURRE O CONTÊINER PARA A PLACA VERMELHA. A PLACA ABRE O PORTÃO, MAS SÓ COM PESO EM CIMA.',
    hints: ['VOCÊ NÃO É PESADO O BASTANTE. EMPURRE O CONTÊINER PARA A PLACA.', 'POSICIONE-SE À ESQUERDA DO CONTÊINER E EMPURRE-O PARA BAIXO, DEPOIS PARA A DIREITA.'],
    solved: 'PORTÃO ABERTO! O CONTÊINER CONTINUA SEGURANDO A PLACA. ATRAVESSE.',
  },
  'primeiro-eco': {
    briefing: 'A PLACA PRECISA FICAR PRESSIONADA ENQUANTO VOCÊ ATRAVESSA. ENCERRE O CICLO COM O ECO EM CIMA DELA.',
    hints: ['PISE NA PLACA E ENCERRE O CICLO COM TAB. O ECO VAI REPETIR SEU CAMINHO.', 'NO PRÓXIMO CICLO, DEIXE O ECO NA PLACA E CORRA PARA A ESCOTILHA.'],
    solved: 'O ECO SEGUROU A PLACA! É ASSIM QUE VAMOS ABRIR TODOS OS PORTÕES.',
  },
  'o-vao': {
    briefing: 'DUAS PLACAS, DOIS ECOS. O VAZIO MATA, ENTÃO NÃO PISE FORA DO PISO.',
    hints: ['MONTE UM ECO PARA CADA PLACA. O PRIMEIRO PODE FICAR ONDE ESTÁ.', 'NO ÚLTIMO CICLO, USE AS DUAS PLACAS JÁ PRESAS E ATRAVESSE O CORREDOR CENTRAL.'],
    solved: 'DOIS ECOS, DUAS PLACAS, UMA TRAVESSIA. O VAZIO NÃO É MAIS UM PROBLEMA.',
  },
  'a-estrela-do-batedor': {
    briefing: 'PEGUE O CARTÃO DE ACESSO E ABRA A PORTA TRANCADA. UM ECO PODE SEGURAR A PLACA NO MEIO.',
    hints: ['O CARTÃO ESTÁ NA PARTE DE CIMA. PEGUE-O ANTES DE TENTAR A PORTA.', 'DEIXE UM ECO NA PLACA VERMELHA E USE O CARTÃO NA PORTA PARA CHEGAR À SAÍDA.'],
    solved: 'CARTÃO USADO E PORTA ABERTA. A ESCOTILHA ESTÁ LOGO À FRENTE.',
  },
  'peso-extra': {
    briefing: 'UM CONTÊINER SEGURA UMA PLACA. UM ECO SEGURA A OUTRA. VOCÊ SÓ PASSA.',
    hints: ['EMPURRE O CONTÊINER PARA A PLACA AZUL E ENCERRE O CICLO.', 'NO CICLO SEGUINTE, DEIXE O ECO NA PLACA VERMELHA E ATRAVESSE OS DOIS PORTÕES.'],
    solved: 'DOIS PESOS, DOIS PORTÕES. O BLOCO DE CELAS ESTÁ ABERTO.',
    chuchuty: 'CACHORRO! VOCÊ ESTÁ MEXENDO ONDE NÃO DEVE. MINHAS CÂMERAS ESTÃO EM TODO LUGAR.',
  },
  'tres-portoes': {
    briefing: 'TRÊS PLACAS, TRÊS ECOS. CADA ECO PRECISA FICAR EM UMA PLACA DIFERENTE.',
    hints: ['COMECE PELA PLACA VERMELHA. TERMINE O CICLO EM CIMA DELA.', 'DEPOIS FAÇA O MESMO COM A AZUL E A DOURADA. NO ÚLTIMO CICLO, ATRAVESSE OS TRÊS PORTÕES.'],
    solved: 'TRÊS ECOS, TRÊS PORTÕES. O LABORATÓRIO ESTÁ LOGO ADIANTE.',
  },
  'pavio-curto': {
    briefing: 'O CICLO É MUITO CURTO. VOCÊ NÃO CONSEGUE ATRAVESSAR SOZINHO: PRECISA DE UM ECO NA PLACA.',
    hints: ['O PRIMEIRO CICLO É SÓ PARA CHEGAR À PLACA. TERMINE EM CIMA DELA.', 'NO SEGUNDO CICLO O ECO SEGURA O PORTÃO. SIGA EM FRENTE SEM PARAR.'],
    solved: 'CICLO CURTO, ECO CERTEIRO. A PORTA DO LABORATÓRIO ESTÁ ABERTA.',
  },
  'caminhos-cruzados': {
    briefing: 'O CONTÊINER ABRE UM LADO. O ECO ABRE O OUTRO. OS DOIS CAMINHOS SE CRUZAM.',
    hints: ['USE O CONTÊINER PARA PRESSIONAR A PLACA DO LADO ESQUERDO.', 'NO CICLO SEGUINTE, DEIXE O ECO NA PLACA DIREITA E SUBA PELO CORREDOR CENTRAL.'],
    solved: 'CAMINHOS CRUZADOS, SAÍDA ENCONTRADA. A ENERGIA DO LABORATÓRIO ESTÁ VOLTANDO.',
  },
  'ultima-luz': {
    briefing: 'TRÊS PORTÕES, DOIS ECOS E UM CONTÊINER. NÃO HÁ ESPAÇO PARA DESPERDÍCIO.',
    hints: ['O CONTÊINER PODE FICAR EM UMA PLACA. OS ECOS FICAM NAS OUTRAS DUAS.', 'NO ÚLTIMO CICLO, ATRAVESSE OS TRÊS PORTÕES E SUBA ATÉ A ESCOTILHA.'],
    solved: 'A ÚLTIMA LUZ DO LABORATÓRIO ACENDEU. O GERADOR PRINCIPAL ESTÁ ESTÁVEL.',
    chuchuty: 'PARE DE BRINCAR COM A MINHA ENERGIA! ESSA INSTALAÇÃO CUSTOU CARO!',
  },
  'a-alavanca': {
    briefing: 'ENCARE A ALAVANCA E APERTE E. ELA FICA LIGADA E ABRE O PORTÃO DA COR.',
    hints: ['CHEGUE AO LADO DA ALAVANCA E APERTE E.', 'A ALAVANCA FICA LIGADA MESMO DEPOIS DE VOCÊ SAIR. ATRAVESSE O PORTÃO VERMELHO.'],
    solved: 'ALAVANCA LIGADA. A CORRENTE CHEGOU AO PAINEL PRINCIPAL.',
  },
  'dois-interruptores': {
    briefing: 'DUAS ALAVANCAS, DOIS PORTÕES. LIGUE AS DUAS ANTES DE ATRAVESSAR.',
    hints: ['A PRIMEIRA ALAVANCA É VERMELHA; A SEGUNDA É AZUL. APERTE E EM CADA UMA.', 'DEPOIS DE LIGAR AS DUAS, SIGA EM FRENTE E ATRAVESSE OS DOIS PORTÕES.'],
    solved: 'DOIS CIRCUITOS ATIVOS. O LABORATÓRIO NÃO ESTÁ MAIS ÀS ESCURAS.',
  },
  'circuito-duplo': {
    briefing: 'A ALAVANCA ABRE UM PORTÃO. O CONTÊINER NA PLACA ABRE O OUTRO.',
    hints: ['LIGUE A ALAVANCA VERMELHA PRIMEIRO. DEPOIS EMPURRE O CONTÊINER PARA A PLACA AZUL.', 'OS DOIS PORTÕES PRECISAM FICAR ABERTOS AO MESMO TEMPO PARA VOCÊ PASSAR.'],
    solved: 'CIRCUITO DUPLO ESTÁVEL. A SOBRECARGA DO LABORATÓRIO PASSOU.',
  },
  prelo: {
    briefing: 'O BOTÃO SÓ CEDE COM PESO EM CIMA. EMPURRE O CONTÊINER PARA ELE.',
    hints: ['O BOTÃO AZUL ESTÁ NO CHÃO. O CONTÊINER É A CHAVE.', 'EMPURRE O CONTÊINER PARA BAIXO ATÉ O BOTÃO E ATRAVESSE O PORTÃO AZUL.'],
    solved: 'PRENSA ATIVADA! O PORTÃO AZUL ABRIU. O SETOR INDUSTRIAL ESTÁ LOGO ABAIXO.',
  },
  'dois-botoes': {
    briefing: 'DOIS BOTÕES, DOIS CONTÊINERES, DOIS CIRCUITOS. UM CONTÊINER PARA CADA BOTÃO.',
    hints: ['NÃO TENTE USAR O MESMO CONTÊINER NOS DOIS BOTÕES.', 'COLOQUE UM CONTÊINER NO BOTÃO VERMELHO E OUTRO NO AZUL. DEPOIS ATRAVESSE OS DOIS PORTÕES.'],
    solved: 'OS DOIS CIRCUITOS ESTÃO PRESSIONADOS. A PRODUÇÃO PODE CONTINUAR.',
  },
  'alavanca-e-botao': {
    briefing: 'LIGUE A ALAVANCA E PRESSIONE O BOTÃO COM O CONTÊINER. UM CIRCUITO NÃO BASTA.',
    hints: ['A ALAVANCA VERMELHA FICA LIGADA SOZINHA. O BOTÃO AZUL PRECISA DO CONTÊINER.', 'ATIVE A ALAVANCA, EMPURRE O CONTÊINER PARA O BOTÃO E ATRAVESSE OS DOIS PORTÕES.'],
    solved: 'ALAVANCA E BOTÃO EM SINCRONIA. O ELEVADOR INDUSTRIAL ESTÁ LIVRE.',
  },
  conduto: {
    briefing: 'O DUTO ATRAVESSA A SALA. O CONTÊINER NÃO É NECESSÁRIO; O QUE IMPORTA É A ROTA.',
    hints: ['PISE NO DUTO AZUL DA ESQUERDA. ELE TE LEVA PARA O PAR DO OUTRO LADO.', 'DEPOIS DO TELEPORTE, LIGUE A ALAVANCA AZUL E ATRAVESSE O PORTÃO.'],
    solved: 'DUTO ESTÁVEL. VOCÊ ATRAVESSOU A PAREDE SEM ABRIR NENHUMA PORTA.',
  },
  'duto-coberto': {
    briefing: 'A ALAVANCA VERMELHA ABRE O PORTÃO. O CAMINHO ATÉ ELA É O DESAFIO.',
    hints: ['A ALAVANCA ESTÁ NA PARTE DE BAIXO. CHEGUE ATÉ ELA E APERTE E.', 'DEPOIS DE LIGAR A ALAVANCA, SUBA PELO LADO DIREITO E ATRAVESSE O PORTÃO VERMELHO.'],
    solved: 'VÁLVULA DE SEGURANÇA ABERTA. A PRENSA NÃO VAI MAIS BLOQUEAR O CORREDOR.',
    chuchuty: 'VOCÊ NÃO PASSA DO SETOR INDUSTRIAL. EU TENHO UMA CAMISETA DO IRON MAIDEN MAIOR QUE VOCÊ!',
  },
  'dutos-em-serie': {
    briefing: 'O DUTO LEVA AO OUTRO LADO. A ALAVANCA AZUL ABRE O PORTÃO DA SAÍDA.',
    hints: ['ENTRE NO DUTO AZUL. O PAR ESTÁ DO OUTRO LADO DA PAREDE.', 'AO SAIR DO DUTO, LIGUE A ALAVANCA AZUL E ATRAVESSE O PORTÃO.'],
    solved: 'DUTOS EM SÉRIE CONECTADOS. O ARMAZÉM ESTÁ ABERTO.',
  },
  'codigo-romano': {
    briefing: 'LEIA AS PISTAS NO CHÃO E DIGITE A SENHA NA TELA. A ORDEM É A DOS NÚMEROS ROMANOS.',
    hints: ['AS PISTAS FICAM NA PARTE DE CIMA DA SALA, EM ORDEM DA ESQUERDA PARA A DIREITA.', 'ABRA A TELA COM E, DIGITE OS SÍMBOLOS NA ORDEM DAS PISTAS E CONFIRME COM C.'],
    solved: 'CÓDIGO ROMANO ACEITO. A CENTRAL DE COMANDO ESTÁ À SUA FRENTE.',
    chuchuty: 'QUEM TE ENSINOU A LER OS MEUS ARQUIVOS? ISSO É PROPRIEDADE ALIENÍGENA!',
  },
  'codigo-de-cor': {
    briefing: 'AS CORES NO CHÃO FORMAM A SENHA. A ORDEM É A DAS PISTAS.',
    hints: ['AS PISTAS DE COR FICAM NA PARTE DE CIMA. OLHE A ORDEM DOS QUADRADOS.', 'ABRA A TELA, ESCOLHA AS CORES NA ORDEM DAS PISTAS E CONFIRME.'],
    solved: 'CÓDIGO DE COR ACEITO. OS ARQUIVOS ESTÃO SE ABRINDO.',
  },
  'codigo-e-peso': {
    briefing: 'A SENHA ABRE A PORTA. O CAMINHO ATÉ A TELA É SIMPLES, MAS A ORDEM IMPORTA.',
    hints: ['LEIA AS PISTAS DE COR NA PARTE DE CIMA ANTES DE DESCER.', 'DIGITE AS CORES NA ORDEM DAS PISTAS E CONFIRME COM C.'],
    solved: 'ARQUIVO DESBLOQUEADO. HÁ UM DOCUMENTO SOBRE O NÚCLEO DO CONHECIMENTO.',
  },
  'codigo-e-alavanca': {
    briefing: 'RESOLVA A TELA E LIGUE A ALAVANCA. A PORTA SÓ ABRE COM OS DOIS SISTEMAS ATIVOS.',
    hints: ['A TELA FICA NA PARTE DE BAIXO. A ALAVANCA ESTÁ MAIS ADIANTE.', 'DIGITE A SENHA, CONFIRME, LIGUE A ALAVANCA VERMELHA E ATRAVESSE O PORTÃO.'],
    solved: 'DOIS SISTEMAS ATIVOS. O CORREDOR DA CENTRAL ESTÁ ABERTO.',
  },
  'codigo-e-duto': {
    briefing: 'A SENHA E O DUTO ABREM CAMINHO ATÉ A ALAVANCA. USE OS DOIS.',
    hints: ['RESOLVA A TELA PRIMEIRO. DEPOIS USE O DUTO PARA CHEGAR AO OUTRO LADO.', 'LIGUE A ALAVANCA AZUL AO SAIR DO DUTO E ATRAVESSE O PORTÃO.'],
    solved: 'SENHA E DUTO CONECTADOS. A ALARME DA CENTRAL COMEÇOU A TOCAR.',
  },
  'cores-e-botoes': {
    briefing: 'A SENHA DE COR ABRE A PORTA. NÃO DEIXE NENHUMA PISTA PARA TRÁS.',
    hints: ['AS PISTAS DE COR FICAM NA PARTE DE CIMA DA SALA.', 'DIGITE AS CORES NA ORDEM DAS PISTAS. A PORTA VIOLETA VAI CEDER.'],
    solved: 'SENHA CORRETA. A PORTA DA CENTRAL DE COMANDO ESTÁ ABERTA.',
    chuchuty: 'VOCÊ ABRIU O MEU ARQUIVO PESSOAL! ESSES DOCUMENTOS SÃO CONFIDENCIAIS!',
  },
  'senha-e-vao': {
    briefing: 'CUIDADO COM O VAZIO. A ALAVANCA ABRE O PORTÃO DA SAÍDA.',
    hints: ['NÃO PISE NO VAZIO. A ROTA SEGURA CONTORNA A ÁREA ESCURA.', 'LIGUE A ALAVANCA REDONDA E ATRAVESSE O PORTÃO DA DIREITA.'],
    solved: 'VOCÊ ATRAVESSOU O VAZIO SEM CAIR. A CENTRAL ESTÁ CADA VEZ MAIS PERTO.',
  },
  'tres-mecanismos': {
    briefing: 'ALAVANCA, CONTÊINER E PLACA. OS DOIS PORTÕES PRECISAM SER ABERTOS NA ORDEM CERTA.',
    hints: ['LIGUE A ALAVANCA VERMELHA PARA ABRIR O PRIMEIRO PORTÃO.', 'EMPURRE O CONTÊINER PARA A PLACA AZUL PARA ABRIR O SEGUNDO PORTÃO E CHEGAR À SAÍDA.'],
    solved: 'TRÊS MECANISMOS EM SINCRONIA. O CAMINHO PARA O HANGAR ESTÁ ABERTO.',
  },
  'quatro-mecanismos': {
    briefing: 'DUTO, BOTÃO, CONTÊINER E SENHA. USE TUDO SEM DEIXAR NADA PARA TRÁS.',
    hints: ['RESOLVA A SENHA PRIMEIRO. O DUTO LEVA AO BOTÃO.', 'COLOQUE O CONTÊINER NO BOTÃO AZUL, ATRAVESSE O PORTÃO AZUL E SIGA ATÉ A SAÍDA.'],
    solved: 'QUATRO MECANISMOS DOMINADOS. O CHUCHUTY ESTÁ PERDENDO O CONTROLE.',
  },
  'labirinto-final': {
    briefing: 'DUAS ALAVANCAS, UM CONTÊINER E UM DUTO. O LABIRINTO NÃO PERDOA CAMINHO ERRADO.',
    hints: ['LIGUE A ALAVANCA VERMELHA E USE O DUTO PARA CRUZAR A PAREDE.', 'COLOQUE O CONTÊINER NO BOTÃO AZUL E ATRAVESSE O PORTÃO AZUL ATÉ A SAÍDA.'],
    solved: 'LABIRINTO FINAL RESOLVIDO. SÓ FALTA A CÁPSULA.',
  },
  'ultima-prova': {
    briefing: 'SENHA, DUTO, CONTÊINER E PLACA. O SISTEMA DE LANÇAMENTO EXIGE TODOS OS CIRCUITOS.',
    hints: ['RESOLVA A SENHA E USE O DUTO. NÃO ESQUEÇA DO CONTÊINER NA PLACA AZUL.', 'ABRA A PORTA VIOLETA, COLOQUE O CONTÊINER NA PLACA AZUL E ATRAVESSE O PORTÃO AZUL.'],
    solved: 'ÚLTIMA PROVA VENCIDA! A CÁPSULA DE EMERGÊNCIA ESTÁ PRONTA PARA O LANÇAMENTO.',
    chuchuty: 'NÃO! ESSA CÁPSULA É MINHA! EU IA USAR ELA PARA VOLTAR AO PLANETA DO IRON MAIDEN!',
  },
};

export const SYSTEM_LEVEL_RADIO: LevelRadio = {
  briefing: 'AVANCE ATÉ A ESCOTILHA. O SISTEMA DE LOOP ESTÁ INSTÁVEL.',
  hints: ['OBSERVE O MAPA E PROCURE UM CAMINHO ATÉ A SAÍDA.', 'USE OS MECANISMOS DA SALA. NÃO HÁ ATALHO SEM RESOLVER O PUZZLE.'],
  solved: 'SETOR LIBERADO. CONTINUE.',
};

export const radioFor = (id: string): LevelRadio => LEVEL_RADIO[id] ?? SYSTEM_LEVEL_RADIO;

export function sectorForLevel(index: number): Sector {
  return SECTORS.find((s) => index >= s.range[0] && index <= s.range[1]) ?? SECTORS[0];
}

export function isSectorStart(index: number): boolean {
  return SECTORS.some((s) => s.range[0] === index);
}

export function speakerName(speaker: Speaker): string {
  if (speaker === 'marcinho') return MARCI_NOME;
  if (speaker === 'chuchuty') return CHUCHUTY_NOME;
  if (speaker === 'kennedyto') return KEN_NOME;
  return SYSTEM_NOME;
}
