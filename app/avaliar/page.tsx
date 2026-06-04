'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function FormularioAvaliar() {
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedido')
  const prestadorNome = searchParams.get('nome') || 'Prestador'

  const [avaliacao, setAvaliacao] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit() {
    if (avaliacao === 0) {
      setErro('Selecciona uma avaliação.')
      return
    }

    const { error } = await supabase.from('reviews').insert({
      pedido_id: Number(pedidoId),
      avaliacao: avaliacao,
      comentario: comentario || null,
    })

    if (error) {
      setErro('Erro ao enviar avaliação.')
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Obrigado!</h2>
          <p className="text-gray-500 mb-6">A tua avaliação ajuda outros clientes a encontrar bons profissionais.</p>
          <Link href="/meus-pedidos"
            className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg font-medium
                       hover:bg-purple-800 transition-colors">
            Voltar aos Meus Pedidos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white py-4 px-8 flex items-center gap-4">
        <Link href="/meus-pedidos" className="text-purple-200 hover:text-white text-sm">← Voltar</Link>
        <h1 className="text-xl font-bold">Avaliar Serviço</h1>
      </header>

      <section className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm text-gray-500">Prestador</p>
          <p className="text-lg font-semibold text-gray-800">{prestadorNome}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Como foi o serviço?</h2>

          {erro && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{erro}</div>}

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setAvaliacao(star)}
                onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                className="text-4xl transition-transform hover:scale-110">
                {star <= (hover || avaliacao) ? '⭐' : '☆'}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentário (opcional)</label>
            <textarea rows={3} placeholder="Conta como foi a experiência..."
              value={comentario} onChange={(e) => setComentario(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>

          <button onClick={handleSubmit}
            className="w-full bg-purple-700 text-white py-3 rounded-lg font-medium
                       hover:bg-purple-800 transition-colors">
            Enviar Avaliação
          </button>
        </div>
      </section>
    </main>
  )
}

export default function Avaliar() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">A carregar...</div>}>
      <FormularioAvaliar />
    </Suspense>
  )
}
