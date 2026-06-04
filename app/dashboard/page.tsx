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
  cliente_telefone: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pendente')

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      setUser(user)

      const { data: perfilData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      setPerfil(perfilData)

      if (perfilData) {
        const { data: pedidosData } = await supabase
          .from('services_requestes')
          .select('*')
          .eq('prestador_id', perfilData.id)
          .order('created_at', { ascending: false })

        setPedidos(pedidosData || [])
      }

      setLoading(false)
    }

    carregarDados()
  }, [router])

  async function actualizarEstado(pedidoId: number, novoEstado: string) {
    await supabase
      .from('services_requestes')
      .update({ estado: novoEstado })
      .eq('id', pedidoId)

    setPedidos(pedidos.map(p =>
      p.id === pedidoId ? { ...p, estado: novoEstado } : p
    ))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">A carregar...</p>
      </main>
    )
  }

  const pedidosFiltrados = pedidos.filter(p => {
    if (tab === 'todos') return true
    return p.estado === tab
  })

  const cores: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-700',
    aceite: 'bg-blue-100 text-blue-700',
    'em progresso': 'bg-purple-100 text-purple-700',
    concluido: 'bg-green-100 text-green-700',
    recusado: 'bg-red-100 text-red-700',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white py-4 px-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-purple-200 text-sm">{perfil?.name || user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-purple-200 hover:text-white text-sm">
            Início
          </Link>
          <button
            onClick={logout}
            className="bg-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-500
                       transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-purple-700">{pedidos.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {pedidos.filter(p => p.estado === 'pendente').length}
            </p>
            <p className="text-xs text-gray-500">Pendentes</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.estado === 'aceite' || p.estado === 'em progresso').length}
            </p>
            <p className="text-xs text-gray-500">Em curso</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">
              {pedidos.filter(p => p.estado === 'concluido').length}
            </p>
            <p className="text-xs text-gray-500">Concluídos</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['pendente', 'aceite', 'em progresso', 'concluido', 'todos'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {pedidosFiltrados.length > 0 ? (
          <div className="grid gap-4">
            {pedidosFiltrados.map((p) => (
              <div key={p.id}
                   className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-400">
                      Pedido #{p.id} · {new Date(p.created_at).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-gray-800 mt-1">{p.descricao}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📞 {p.cliente_telefone}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    cores[p.estado] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.estado}
                  </span>
                </div>

                {p.estado === 'pendente' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => actualizarEstado(p.id, 'aceite')}
                      className="flex-1 bg-purple-700 text-white py-2 rounded-lg text-sm
                                 font-medium hover:bg-purple-800 transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => actualizarEstado(p.id, 'recusado')}
                      className="flex-1 bg-white text-red-600 py-2 rounded-lg text-sm
                                 font-medium border border-red-200 hover:bg-red-50
                                 transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                )}

                {p.estado === 'aceite' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => actualizarEstado(p.id, 'em progresso')}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm
                                 font-medium hover:bg-blue-700 transition-colors"
                    >
                      Iniciar Serviço
                    </button>
                  </div>
                )}

                {p.estado === 'em progresso' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => actualizarEstado(p.id, 'concluido')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg text-sm
                                 font-medium hover:bg-green-700 transition-colors"
                    >
                      Marcar como Concluído
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400">Nenhum pedido {tab !== 'todos' ? tab : ''} encontrado.</p>
          </div>
        )}
      </section>
    </main>
  )
}
