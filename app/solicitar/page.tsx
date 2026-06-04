'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { supabase } from '../../src/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function FormularioSolicitar() {
  const searchParams = useSearchParams()
  const prestadorId = searchParams.get('prestador')
  const prestadorNome = searchParams.get('nome') || 'Prestador'

  const [descricao, setDescricao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit() {
    setEnviando(true)
    setErro('')

    if (!descricao.trim() || !telefone.trim()) {
      setErro('Preenche todos os campos.')
      setEnviando(false)
      return
    }

    const { error } = await supabase.from('services_requestes').insert({
      prestador_id: Number(prestadorId),
      descricao: descricao,
      estado: 'pendente',
      cliente_telefone: telefone,
    })

    if (error) {
      setErro('Erro ao enviar pedido. Tenta novamente.')
      setEnviando(false)
      return
    }

    setEnviado(true)
    setEnviando(false)
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100
                        max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pedido enviado!</h2>
          <p className="text-gray-500 mb-6">
            O teu pedido foi enviado para <strong>{prestadorNome}</strong>.
            Serás contactado em breve.
          </p>
          <Link
            href="/"
            className="inline-block bg-purple-700 text-white px-6 py-3
                       rounded-lg font-medium hover:bg-purple-800 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white py-4 px-8 flex items-center gap-4">
        <button onClick={() => history.back()}
                className="text-purple-200 hover:text-white text-sm">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold">Solicitar Serviço</h1>
      </header>

      <section className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm text-gray-500">Prestador seleccionado</p>
          <p className="text-lg font-semibold text-gray-800">{prestadorNome}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Descreve o que precisas
          </h2>

          {erro && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {erro}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O teu telefone
              </label>
              <input
                type="tel"
                placeholder="Ex: 923 456 789"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3
                           text-gray-800 focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do problema
              </label>
              <textarea
                rows={4}
                placeholder="Ex: Preciso de reparar o ar condicionado do escritório."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3
                           text-gray-800 focus:outline-none focus:ring-2
                           focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-medium
                         hover:bg-purple-800 transition-colors disabled:opacity-50"
            >
              {enviando ? 'A enviar...' : 'Enviar Pedido'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function Solicitar() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">A carregar...</div>}>
      <FormularioSolicitar />
    </Suspense>
  )
}
