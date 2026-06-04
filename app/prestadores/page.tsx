import { supabase } from '../../src/lib/supabase'
import Link from 'next/link'

export default async function Prestadores({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const params = await searchParams
  const categoriaId = params.categoria

  const { data: categoria } = categoriaId
    ? await supabase.from('categories').select('*').eq('id', categoriaId).single()
    : { data: null }

  let query = supabase.from('users').select('*').eq('tipo', 'prestador')
  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }
  const { data: prestadores } = await query

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white py-4 px-8 flex items-center gap-4">
        <Link href="/" className="text-purple-200 hover:text-white text-sm">← Voltar</Link>
        <h1 className="text-xl font-bold">{categoria ? categoria.nome : 'Todos os Prestadores'}</h1>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {prestadores && prestadores.length > 0 ? (
          <div className="grid gap-4">
            {prestadores.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                    <p className="text-gray-500 text-sm">{p.email}</p>
                    <p className="text-gray-400 text-sm">{p.telefone}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Disponível</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/solicitar?prestador=${p.id}&nome=${encodeURIComponent(p.name)}`}
                    className="w-full block text-center bg-purple-700 text-white py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors">
                    Solicitar Serviço
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 mb-4">Nenhum prestador disponível nesta categoria.</p>
            <Link href="/" className="text-purple-700 font-medium hover:underline">Ver outras categorias</Link>
          </div>
        )}
      </section>
    </main>
  )
}
