export const TEMAS = ['frutas', 'animais', 'brinquedos', 'transporte', 'alimentos', 'natureza', 'escola'] as const
export type Tema = typeof TEMAS[number]

export const PROMPTS: Record<Tema, string[]> = {
  frutas:      ['one apple',          'two bananas',       'three strawberries', 'four oranges',   'five grapes bunch'],
  animais:     ['one sitting cat',    'two dogs',          'three rabbits',      'four ducks',      'five baby chicks'],
  brinquedos:  ['one ball',           'two toy cars',      'three stars',        'four balloons',   'five crayons'],
  transporte:  ['one car',            'two bicycles',      'three buses',        'four airplanes',  'five boats'],
  alimentos:   ['one cupcake',        'two cookies',       'three candies',      'four ice creams', 'five apples'],
  natureza:    ['one flower',         'two butterflies',   'three trees',        'four raindrops',  'five leaves'],
  escola:      ['one pencil',         'two books',         'three erasers',      'four scissors',   'five rulers'],
}

export const LABELS: Record<Tema, string[]> = {
  frutas:      ['1 maçã', '2 bananas', '3 morangos', '4 laranjas', '5 uvas'],
  animais:     ['1 gato', '2 cachorros', '3 coelhos', '4 patos', '5 pintinhos'],
  brinquedos:  ['1 bola', '2 carrinhos', '3 estrelas', '4 balões', '5 giz'],
  transporte:  ['1 carro', '2 bicicletas', '3 ônibus', '4 aviões', '5 barcos'],
  alimentos:   ['1 cupcake', '2 biscoitos', '3 balas', '4 sorvetes', '5 maçãs'],
  natureza:    ['1 flor', '2 borboletas', '3 árvores', '4 gotas', '5 folhas'],
  escola:      ['1 lápis', '2 livros', '3 borrachas', '4 tesouras', '5 réguas'],
}

export const NUM_CORES = ['#2d9e5f', '#4361ee', '#f4a261', '#e85d04', '#9b5de5']
export const NUMS_EMBARALHADOS = [4, 1, 5, 2, 3]
