import { Link } from 'react-router-dom'

const Aboutpage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-900">
        <Link to='/home'>
          <div className="text-2xl font-black tracking-tighter">FITSYNC</div>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to='/about' className="text-[#CCFF00] font-bold">About Us</Link>
          <Link to='/contact' className="hover:text-[#CCFF00] transition-colors">Contact Us</Link>
          <Link to='/signin'>
            <button className="bg-white text-black px-5 py-2 rounded-sm font-bold hover:bg-[#CCFF00] transition-all">
              Become a Member
            </button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070')"}}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-6xl font-black mb-6 tracking-tight uppercase italic">Our <span className="text-[#CCFF00]">Story</span></h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Welcome to FITSYNC, where elite fitness architecture meets cutting-edge technology. 
            We are more than a platform; we are a lifestyle designed to calibrate your 
            physical performance and mental resilience.
          </p>
          <div className="w-24 h-1 bg-[#CCFF00] mx-auto"></div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 group">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070" 
              alt="Our Mission" 
              className="rounded-2xl shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-5xl font-black mb-8 tracking-tighter italic">
              <span className="text-[#CCFF00]">///</span> OUR MISSION
            </h2>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              At the core of FITSYNC is a mission to empower individuals to reach their absolute peak potential—physically, mentally, and emotionally.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed border-l-2 border-[#CCFF00] pl-6 italic">
              We create inclusive, high-performance spaces where every athlete, from beginner to professional, feels fueled for evolution.
            </p>
          </div>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="py-24 px-6 bg-[#0D1117]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16 tracking-tighter">THE CORE VALUES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Passion', 'Commitment', 'Community', 'Growth', 'Authenticity', 'Inclusivity'].map((value, index) => (
              <div key={index} className="bg-black p-8 rounded-2xl border border-gray-900 hover:border-[#CCFF00]/50 transition-all group">
                <div className="text-[#CCFF00] text-5xl mb-6 group-hover:scale-110 transition-transform">
                  {['👑', '👥', '⚡', '📈', '🔒', '∞'][index]}
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{value}</h3>
                <p className="text-gray-500 leading-relaxed">
                  Engineered to maintain the highest standards of athletic integrity and community growth.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics / Ticker Style */}
      <section className="py-12 bg-[#CCFF00]">
        <div className="max-w-7xl mx-auto overflow-hidden">
          <div className="flex justify-between px-6 animate-pulse">
            {['MOTIVATION', 'WEIGHT MANAGEMENT', 'WELL BEING', 'NUTRITION', 'FITNESS'].map((topic, index) => (
              <span key={index} className="text-black font-black text-sm tracking-widest flex items-center">
                {topic} <span className="ml-4 text-xs">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Meet your certified trainers */}
      <section className="py-24 px-6">
        <h2 className="text-5xl font-black text-center mb-16 tracking-tighter uppercase italic">The <span className="text-[#CCFF00]">Experts</span></h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {['David Johnson', 'Sara Wallace', 'Mark Johnson'].map((trainer, index) => (
            <div key={index} className="relative group overflow-hidden rounded-2xl">
              <img 
                src={`https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974`} 
                alt={trainer} 
                className="w-full h-[450px] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-2xl font-black uppercase italic">{trainer}</h3>
                <p className="text-[#CCFF00] font-bold tracking-widest text-sm uppercase">Elite Performance Coach</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 text-center border-t border-gray-900">
        <h2 className="text-6xl font-black mb-10 tracking-tighter">
          READY TO EVOLVE WITH <span className="text-[#CCFF00]">FITSYNC?</span>
        </h2>
        <button className="bg-[#CCFF00] text-black px-12 py-5 rounded-full text-xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all">
          Join the Elite
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D1117] py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-black mb-4">FITSYNC</div>
          <p className="text-gray-600 text-sm">Copyright © 2026 FitSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Aboutpage