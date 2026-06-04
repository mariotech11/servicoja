import { supabase } from '../src/lib/supabase'
import Link from 'next/link'
import NavBar from './components/NavBar'

export default async function Home() {
  const { data: categories } = await supabase.from('categories').select('*')

  const icones: Record<string, string> = {
    wrench: '🔧', zap: '⚡', droplet: '💧',
    paintbrush: '🎨', wind: '❄️', hammer: '🔨',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">O que precisas resolver?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/prestadores?categoria=${cat.id}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                         hover:shadow-md hover:border-purple-200 transition-all
                         flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">{icones[cat.icone] || '🛠️'}</span>
              <span className="text-gray-700 font-medium">{cat.nome}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
