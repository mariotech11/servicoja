'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()
        setPerfil(data)
      }
      setLoading(false)
    }
    check()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
    router.refresh()
  }

  return (
    <header className="bg-purple-700 text-white py-6 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">ServiçoJá</h1>
        <p className="text-purple-200 mt-1">Encontra o profissional certo em Luanda</p>
      </div>

      {!loading && (
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {perfil?.tipo === 'prestador' && (
                <Link href="/dashboard"
                  className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium
                             hover:bg-purple-500 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/meus-pedidos"
                className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium
                           hover:bg-purple-500 transition-colors">
                Meus Pedidos
              </Link>
              <button onClick={logout}
                className="bg-white text-purple-700 px-4 py-2 rounded-lg text-sm
                           font-medium hover:bg-purple-50 transition-colors">
                Sair
              </button>
            </>
          ) : (
            <Link href="/auth"
              className="bg-white text-purple-700 px-4 py-2 rounded-lg text-sm
                         font-medium hover:bg-purple-50 transition-colors">
              Entrar / Registar
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
