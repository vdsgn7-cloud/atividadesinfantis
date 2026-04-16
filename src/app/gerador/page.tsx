'use client'
import { useRef, useState } from 'react'
import { TEMAS, PROMPTS, LABELS, NUMS_EMBARALHADOS, Tema } from '@/lib/prompts'

const TIPOS = ['Contagem', 'Ligar elementos', 'Vogais / letras', 'Colorir conforme número', 'Completar sequência', 'Tracejado']
const FAIXAS = ['Maternal (2–3 anos)', 'Jardim I (4 anos)', 'Jardim II (5 anos)', '1° ano', '2° ano', '3° ano']

export default function GeradorPage() {
  const [descricao, setDescricao] = useState('')
  const [faixa, setFaixa] = useState('Jardim I (4 anos)')
  const [tema, setTema] = useState<Tema>('frutas')
  const [tipos, setTipos] = useState<string[]>(['Contagem', 'Ligar elementos'])
  const [loading, setLoading] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [imagens, setImagens] = useState<(string | null)[]>([])
  const [pronto, setPronto] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  function toggleTipo(t: string) {
    setTipos(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function gerarImagem(prompt: string): Promise<string | null> {
    const res = await fetch('/api/gerar-imagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    return data.url ?? null
  }

  async function gerar() {
    setLoading(true)
    setPronto(false)
    setImagens([])
    setProgresso(5)
    setStatusMsg('Gerando todas as ilustrações em paralelo...')

    const lista = PROMPTS[tema]
    let done = 0

    const imgs = await Promise.all(
      lista.map(p =>
        gerarImagem(p).then(url => {
          done++
          setProgresso(Math.round(5 + done * 19))
          setStatusMsg(`${done} de 5 ilustrações prontas...`)
          return url
        })
      )
    )

    setImagens(imgs)
    setProgresso(100)
    setStatusMsg('Pronto!')
    setPronto(true)
    setLoading(false)
  }

  async function baixar() {
    if (!sheetRef.current) return
    const h2c = (await import('html2canvas')).default
    const canvas = await h2c(sheetRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      width: 794,
      useCORS: true,
      allowTaint: true,
    })
    const a = document.createElement('a')
    a.download = 'atividade_cristo_rei.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const labels = LABELS[tema]

  // Altura de cada linha para alinhar bolinhas com ilustrações
  const ROW_HEIGHT = 120
  const ROW_GAP = 14

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Baloo+2:wght@700;800&family=Patrick+Hand&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Gerador de atividades infantis</h1>
            <p className="text-sm text-gray-500 mt-1">Estilo livro de colorir — preto e branco, pronto para imprimir</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Descreva a atividade <span className="font-normal">(opcional)</span>
              </label>
              <textarea
                className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                rows={3}
                placeholder="Ex: ligar quantidade de frutas com os números..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Faixa etária</label>
                <select
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  value={faixa}
                  onChange={e => setFaixa(e.target.value)}
                >
                  {FAIXAS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tema visual</label>
                <select
                  className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none capitalize"
                  value={tema}
                  onChange={e => setTema(e.target.value as Tema)}
                >
                  {TEMAS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Tipo de atividade</label>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleTipo(t)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      tipos.includes(t)
                        ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={gerar}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? 'Gerando...' : 'Gerar atividade'}
            </button>

            {loading && (
              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">{statusMsg}</p>
              </div>
            )}
          </div>

          {pronto && imagens.length > 0 && (
            <div className="mt-2">

              {/* ===== FOLHA A4 ===== */}
              <div
                ref={sheetRef}
                style={{
                  background: '#fff',
                  width: 794,
                  minHeight: 1123,
                  padding: '32px 44px 60px',
                  fontFamily: "'Patrick Hand', Arial, sans-serif",
                  margin: '0 auto',
                  border: '3px dashed #444',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* ── Cabeçalho ATIVIDADE ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
                  <div style={{
                    border: '3px solid #000',
                    borderRadius: 6,
                    padding: '4px 16px',
                    display: 'inline-block',
                  }}>
                    <div style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 26,
                      color: '#000',
                      letterSpacing: 1,
                    }}>
                      ATIVIDADE
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "'Patrick Hand', cursive",
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#000',
                  }}>
                    EU SOU:
                  </span>
                  <span style={{
                    display: 'inline-block',
                    width: 380,
                    borderBottom: '2px solid #000',
                    marginLeft: 8,
                  }}>&nbsp;</span>
                </div>

                {/* ── Título decorativo ── */}
                <div style={{
                  textAlign: 'center',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#000',
                  letterSpacing: 3,
                  margin: '8px 0 4px',
                  padding: '6px 0',
                  borderTop: '2.5px dashed #000',
                  borderBottom: '2.5px dashed #000',
                }}>
                  • LIGUE A QUANTIDADE AO NÚMERO •
                </div>

                {/* ── Instrução ── */}
                <div style={{
                  fontFamily: "'Patrick Hand', cursive",
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#000',
                  margin: '12px 0 20px',
                }}>
                  1- CONTE CADA GRUPO DE {tema.toUpperCase()} E LIGUE AO NÚMERO CORRETO.
                </div>

                {/* ── Área principal com posicionamento absoluto para alinhar bolinhas ── */}
                <div style={{ position: 'relative', width: '100%' }}>

                  {/* Total de altura da área */}
                  {(() => {
                    const totalH = imagens.length * ROW_HEIGHT + (imagens.length - 1) * ROW_GAP
                    const colW = 280
                    const centerX = 397 - 44 // centro relativo ao padding

                    return (
                      <div style={{ height: totalH, position: 'relative' }}>

                        {/* Linha tracejada central */}
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          bottom: 0,
                          borderLeft: '2px dashed #aaa',
                          transform: 'translateX(-50%)',
                        }} />

                        {/* Coluna esquerda — ilustrações */}
                        {imagens.map((url, i) => {
                          const top = i * (ROW_HEIGHT + ROW_GAP)
                          const centerY = top + ROW_HEIGHT / 2
                          return (
                            <div key={i}>
                              {/* Ilustração */}
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top,
                                width: colW,
                                height: ROW_HEIGHT,
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                {url
                                  ? <img
                                      src={url}
                                      alt={labels[i]}
                                      crossOrigin="anonymous"
                                      style={{
                                        width: ROW_HEIGHT,
                                        height: ROW_HEIGHT,
                                        objectFit: 'contain',
                                        filter: 'grayscale(100%) contrast(1.3)',
                                      }}
                                    />
                                  : <div style={{ width: ROW_HEIGHT, height: ROW_HEIGHT, background: '#eee', border: '1px dashed #ccc', borderRadius: 8 }} />
                                }
                              </div>

                              {/* Bolinha esquerda — alinhada ao centro da ilustração */}
                              <div style={{
                                position: 'absolute',
                                left: colW + 8,
                                top: centerY - 8,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: '#000',
                              }} />
                            </div>
                          )
                        })}

                        {/* Coluna direita — números */}
                        {NUMS_EMBARALHADOS.map((n, i) => {
                          const top = i * (ROW_HEIGHT + ROW_GAP)
                          const centerY = top + ROW_HEIGHT / 2
                          return (
                            <div key={i}>
                              {/* Bolinha direita */}
                              <div style={{
                                position: 'absolute',
                                right: colW + 8,
                                top: centerY - 8,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: '#000',
                              }} />

                              {/* Número em círculo */}
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top,
                                width: colW,
                                height: ROW_HEIGHT,
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: 24,
                              }}>
                                <div style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: '50%',
                                  border: '3.5px solid #000',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontFamily: "'Fredoka One', cursive",
                                  fontSize: 44,
                                  color: '#000',
                                  lineHeight: 1,
                                }}>
                                  {n}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                      </div>
                    )
                  })()}
                </div>

                {/* ── Rodapé ── */}
                <div style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontFamily: "'Patrick Hand', cursive",
                  fontSize: 11,
                  color: '#999',
                  letterSpacing: 1,
                }}>
                  COLÉGIO CRISTO REI — EDUCAÇÃO INFANTIL
                </div>

              </div>
              {/* ===== FIM FOLHA ===== */}

              <div className="flex justify-center mt-4 gap-3">
                <button
                  onClick={baixar}
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm"
                >
                  Baixar PNG
                </button>
                <button
                  onClick={gerar}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
                >
                  Gerar novamente
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}
