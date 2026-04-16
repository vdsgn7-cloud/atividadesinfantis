'use client'
import { useRef, useState } from 'react'
import { TEMAS, PROMPTS, LABELS, NUM_CORES, NUMS_EMBARALHADOS, Tema } from '@/lib/prompts'

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gerador de atividades infantis</h1>
          <p className="text-sm text-gray-500 mt-1">Ilustrações geradas por IA no estilo livro de colorir</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Descreva a atividade <span className="font-normal">(opcional)</span></label>
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
            <div
              ref={sheetRef}
              style={{
                background: '#fff',
                width: 794,
                minHeight: 1123,
                padding: '44px 52px',
                fontFamily: 'Arial, sans-serif',
                border: '1px solid #ddd',
                margin: '0 auto',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#aaa', letterSpacing: 1, marginBottom: 4 }}>COLÉGIO CRISTO REI</div>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#e85d04' }}>Conte e ligue ao número certo!</div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 3 }}>
                  Observe cada grupo de {tema}, conte e trace uma linha até o número correto.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div style={{ flex: 1, borderBottom: '1.5px solid #bbb', fontSize: 12, color: '#999', paddingBottom: 2 }}>
                  Nome: _________________________________
                </div>
                <div style={{ width: 150, borderBottom: '1.5px solid #bbb', fontSize: 12, color: '#999', paddingBottom: 2 }}>
                  Data: ___/___/______
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: 6, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {imagens.map((url, i) => (
                    <div key={i} style={{ background: '#fafafa', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 90, height: 90, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #f0f0f0' }}>
                        {url
                          ? <img src={url} alt={labels[i]} style={{ width: 90, height: 90, objectFit: 'contain' }} crossOrigin="anonymous" />
                          : <div style={{ width: 90, height: 90, background: '#eee', borderRadius: 8 }} />
                        }
                      </div>
                      <div style={{ fontSize: 13, color: '#777', flex: 1 }}>{labels[i]}</div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e85d04', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ borderLeft: '2px dashed #ccc', height: '100%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {NUMS_EMBARALHADOS.map((n, i) => (
                    <div key={i} style={{ background: '#fafafa', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e85d04', flexShrink: 0 }} />
                      <div style={{ fontSize: 52, fontWeight: 'bold', color: NUM_CORES[(n - 1) % 5], lineHeight: 1 }}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20, background: '#fff8f0', border: '2px dashed #ffd166', borderRadius: 10, padding: '10px', textAlign: 'center', fontSize: 13, color: '#b07d00', fontWeight: 'bold' }}>
                ⭐ Muito bem! Você sabe contar! ⭐
              </div>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 10, color: '#ccc', letterSpacing: 1 }}>
                COLÉGIO CRISTO REI — EDUCAÇÃO INFANTIL
              </div>
            </div>

            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={baixar}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm"
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
  )
}
