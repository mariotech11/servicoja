import { supabase } from '../src/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('users').select('*')

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        ServiçoJá
      </h1>
      <p className="text-gray-500">
        {error ? `Erro: ${error.message}` : `Ligação ao Supabase OK — ${data?.length} utilizadores`}
      </p>
    </main>
  )
}
