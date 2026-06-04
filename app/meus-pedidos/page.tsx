'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Pedido = {
  id: number
  descricao: string
  estado: string
  prestador_id: number
  cliente_telefone: string
  created_at: string
}

export default function MeusPedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [prestadores, setPrestadores] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      setUserEmail(user.email || '')

      const { data: pedidosData } = await supabase
        .from('services_requestes')
        .select('*')
        .eq('cliente_email', user.email)
        .order('created_at', { ascending: false })

      setPedidos(pedidosData || [])

      if (pedidosData && pedidosData.length > 0) {
        const ids = [...new Set(pedidosData.map(p => p.prestador_id))]
        const { data: prestadoresData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', ids)

        if (prestadoresData) {
          const map: Record<number, string> = {}
          prestadoresData.forEach(p => { map[p.id] = p.name })
          setPrestadores(map)
        }
      }

      setLoading(false)
    }
    carregar()
  }, [router])

  const cores: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-700',
    aceite: 'bg-blue-100 text-blue-700',
    'em progresso': 'bg-purple-100 text-purple-700',
    concluido: 'bg-green-100 text-green-700',
    recusado: 'bg-red-100 text-red-700',
  }

  const mensagens: Record<string, string> = {
    pendente: 'O prestador ainda não respondeu ao teu pedido.',
    aceite: 'O prestador aceitou! Vai entrar em contacto contigo.',
    'em progresso': 'O serviço está a ser realizado.',
    concluido: 'Serviço concluído com sucesso!',
    recusado: 'O prestador não pode atender este pedido.',
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">A carregar...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white py-4 px-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Meus Pedidos</h1>
          <p className="text-purple-200 text-sm">{userEmail}</p>
        </div>
        <Link href="/" className="text-purple-200 hover:text-white text-sm">
          ← Início
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {pedidos.length > 0 ? (
          <div className="grid gap-4">
            {pedidos.map((p) => (
              <div key={p.id}
                   className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-gray-400">
                    Pedido #{p.id} · {new Date(p.created_at).toLocaleDateString('pt-PT')}
                  </p>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    cores[p.estado] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.estado}
                  </span>
                </div>

                <p className="text-gray-800 font-medium mb-1">{p.descricao}</p>

                <p className="text-sm text-gray-500 mb-3">
                  Prestador: <strong>{prestadores[p.prestador_id] || 'N/A'}</strong>
                </p>

                <div className={`text-sm p-3 rounded-lg ${
                  p.estado === 'concluido' ? 'bg-green-50 text-green-700' :
                  p.estado === 'recusado' ? 'bg-red-50 text-red-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {mensagens[p.estado] || p.estado}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 mb-4">Ainda não fizeste nenhum pedido.</p>
            <Link href="/"
              className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg
                         font-medium hover:bg-purple-800 transition-colors">
              Encontrar Prestador
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
