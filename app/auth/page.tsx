'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [tipo, setTipo] = useState('cliente')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setErro('')
    setSucesso('')

    if (!email.trim() || !password.trim()) {
      setErro('Preenche email e password.')
      setLoading(false)
      return
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setErro('Email ou password incorrectos.')
        setLoading(false)
        return
      }
      router.push('/')
    } else {
      if (!nome.trim() || !telefone.trim()) {
        setErro('Preenche todos os campos.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome, telefone, tipo },
        },
      })

      if (error) {
        setErro(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        await supabase.from('users').insert({
          name: nome,
          email: email,
          telefone: telefone,
          tipo: tipo,
        })
      }

      setSucesso('Conta criada! Verifica o teu email para confirmar.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-purple-700 text-center mb-2">
          ServiçoJá
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {isLogin ? 'Entra na tua conta' : 'Cria a tua conta'}
        </p>

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">
            {sucesso}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3
                             text-gray-800 focus:outline-none focus:ring-2
                             focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
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
                  Eu sou
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('cliente')}
                    className={`py-3 rounded-lg font-medium border transition-colors ${
                      tipo === 'cliente'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('prestador')}
                    className={`py-3 rounded-lg font-medium border transition-colors ${
                      tipo === 'prestador'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    Prestador
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Ex: joao@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3
                         text-gray-800 focus:outline-none focus:ring-2
                         focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3
                         text-gray-800 focus:outline-none focus:ring-2
                         focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded-lg font-medium
                       hover:bg-purple-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'A processar...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? 'Não tens conta?' : 'Já tens conta?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setErro(''); setSucesso(''); }}
            className="text-purple-700 font-medium hover:underline"
          >
            {isLogin ? 'Cria aqui' : 'Entra aqui'}
          </button>
        </p>
      </div>
    </main>
  )
}
