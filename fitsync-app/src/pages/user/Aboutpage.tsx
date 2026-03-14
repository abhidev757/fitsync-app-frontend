import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'

const Aboutpage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <Link to='/home'>
          <div className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
            FIT<span className="text-[#CCFF00]">SYNC</span>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to='/about' className="text-[#CCFF00] font-bold uppercase text-xs tracking-widest">About Us</Link>
          <Link to='/contact' className="hover:text-[#CCFF00] transition-colors uppercase text-xs tracking-widest">Contact Us</Link>
          <Link to='/signin'>
            <button className="bg-white text-black px-5 py-2 rounded-sm font-black text-xs uppercase hover:bg-[#CCFF00] transition-all">
              Become a Member
            </button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-[#CCFF00] text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
          <Link to='/about' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic text-[#CCFF00]">About Us</Link>
          <Link to='/contact' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic">Contact Us</Link>
          <Link to='/signin' onClick={() => setIsMenuOpen(false)}>
            <button className="bg-[#CCFF00] text-black px-8 py-4 rounded-full font-black uppercase">
              Become a Member
            </button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[400px] bg-cover bg-center flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070')"}}>
        <div className="absolute inset-0 bg-black/80 md:bg-black/70"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase italic leading-none">
            Our <span className="text-[#CCFF00]">Story</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-lg leading-relaxed mb-8 italic">
            Welcome to FITSYNC, where elite fitness architecture meets cutting-edge technology. 
            We are more than a platform; we are a lifestyle designed to calibrate your 
            physical performance and mental resilience.
          </p>
          <div className="w-16 md:w-24 h-1 bg-[#CCFF00] mx-auto"></div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="w-full md:w-1/2 group order-2 md:order-1">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070" 
                alt="Our Mission" 
                className="relative rounded-2xl shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700 w-full h-64 md:h-auto object-cover" 
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 text-left">
            <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 tracking-tighter italic uppercase">
              <span className="text-[#CCFF00]">///</span> OUR MISSION
            </h2>
            <p className="text-gray-400 text-sm md:text-lg mb-6 leading-relaxed">
              At the core of FITSYNC is a mission to empower individuals to reach their absolute peak potential—physically, mentally, and emotionally.
            </p>
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed border-l-2 border-[#CCFF00] pl-6 italic">
              We create inclusive, high-performance spaces where every athlete, from beginner to professional, feels fueled for evolution.
            </p>
          </div>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="py-16 md:py-24 px-6 bg-[#0B0B0B]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 md:mb-16 tracking-tighter uppercase italic">The Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { label: 'Passion', icon: '👑' },
              { label: 'Commitment', icon: '👥' },
              { label: 'Community', icon: '⚡' },
              { label: 'Growth', icon: '📈' },
              { label: 'Authenticity', icon: '🔒' },
              { label: 'Inclusivity', icon: '∞' }
            ].map((value, index) => (
              <div key={index} className="bg-black p-8 rounded-[2rem] border border-gray-900 hover:border-[#CCFF00]/50 transition-all group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-4 uppercase tracking-tight italic">{value.label}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-medium">
                  Engineered to maintain the highest standards of athletic integrity and community growth.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics / Ticker Style (Horizontal scroll on small screens) */}
      <section className="py-8 bg-[#CCFF00] overflow-x-auto no-scrollbar">
        <div className="flex justify-start md:justify-center px-6 min-w-max space-x-8 md:space-x-12">
          {['MOTIVATION', 'WEIGHT MANAGEMENT', 'WELL BEING', 'NUTRITION', 'FITNESS'].map((topic, index) => (
            <span key={index} className="text-black font-black text-[10px] md:text-sm tracking-[0.2em] flex items-center whitespace-nowrap">
              {topic} <span className="ml-4 text-[8px]">◆</span>
            </span>
          ))}
        </div>
      </section>

      {/* Meet your certified trainers */}
      <section className="py-16 md:py-24 px-6">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-12 md:mb-16 tracking-tighter uppercase italic">
          The <span className="text-[#CCFF00]">Experts</span>
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {['David Johnson', 'Sara Wallace', 'Mark Johnson'].map((trainer, index) => (
            <div key={index} className="relative group overflow-hidden rounded-[2rem] border border-gray-900">
              <img 
                src={`https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974`} 
                alt={trainer} 
                className="w-full h-[400px] md:h-[450px] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
              />
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-2xl font-black uppercase italic leading-none mb-2">{trainer}</h3>
                <p className="text-[#CCFF00] font-black tracking-[0.2em] text-[10px] uppercase">Elite Performance Coach</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 px-6 text-center border-t border-gray-900 bg-gradient-to-b from-black to-[#0B0B0B]">
        <h2 className="text-3xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-tight">
          READY TO EVOLVE WITH <br className="md:hidden" /><span className="text-[#CCFF00]">FITSYNC?</span>
        </h2>
        <button className="w-full md:w-auto bg-[#CCFF00] text-black px-12 py-5 rounded-full text-lg md:text-xl font-black uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] transition-all active:scale-95">
          Join the Elite
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0B] py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-black mb-4 italic tracking-tighter">FIT<span className="text-[#CCFF00]">SYNC</span></div>
          <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">System Status: Active // Copyright © 2026 FitSync.</p>
        </div>
      </footer>
    </div>
  )
}

export default Aboutpage