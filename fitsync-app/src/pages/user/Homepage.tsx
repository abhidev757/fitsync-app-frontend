import { useState } from "react"
import { FaCrown, FaAppleAlt, FaMedal, FaHandsHelping, FaDumbbell, FaFire, FaBars, FaTimes } from "react-icons/fa"
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa"
import { Link } from "react-router-dom"

const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 md:p-6 border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <Link to='/home'>
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">FITSYNC</div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to='/about' className="hover:text-[#CCFF00] transition-colors text-sm font-bold uppercase">About Us</Link>
          <Link to='/contact' className="hover:text-[#CCFF00] transition-colors text-sm font-bold uppercase">Contact Us</Link>
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

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
          <Link to='/about' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic">About Us</Link>
          <Link to='/contact' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic">Contact Us</Link>
          <Link to='/signin' onClick={() => setIsMenuOpen(false)}>
            <button className="bg-[#CCFF00] text-black px-8 py-4 rounded-full font-black uppercase">
              Become a Member
            </button>
          </Link>
        </div>
      )}

      {/* SUB-NAV (Horizontal scroll on mobile) */}
      <nav className="bg-[#0D1117] p-3 border-b border-gray-900 overflow-x-auto no-scrollbar">
        <ul className="flex justify-start md:justify-center space-x-6 md:space-x-8 text-[10px] md:text-sm font-black uppercase tracking-widest min-w-max px-4">
          {["Motivation", "Weight Management", "Well being", "Nutrition", "Fitness", "Guides"].map((item) => (
            <li key={item} className="flex items-center group cursor-pointer">
              <span className="text-[#CCFF00] mr-2 text-[8px]">▶</span>
              <a href="#" className="text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="container mx-auto px-4 md:px-6">
        {/* HERO SECTION */}
        <section className="text-center py-16 md:py-32">
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
            PEAK PERFORMANCE.
            <br />
            <span className="text-[#CCFF00] italic">PEAK RESULTS.</span>
          </h1>
          <p className="mb-10 text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to FITSYNC, where elite calisthenics meets mindful recovery. 
            Every workout propels you toward the summit of your fitness goals.
          </p>
          <Link to='/signup'>
            <button className="bg-[#CCFF00] text-black px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.3)]">
              Initialize Evolution
            </button>
          </Link>
        </section>

        {/* STATS BAR (Grid columns adjusted) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 border border-gray-900 bg-[#0D1117]/50 backdrop-blur-sm rounded-3xl p-8 md:p-10 mb-24">
          {[
            { label: "Members", value: "10K" },
            { label: "Trainers", value: "1K" },
            { label: "Calories Burnt", value: "10M" },
            { label: "Hours Trained", value: "20K" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-5xl font-black text-[#CCFF00] tracking-tighter">{stat.value}</div>
              <div className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-gray-600 mt-2 font-black">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ASSIST SECTION (Order changed on mobile) */}
        <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-32">
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute -inset-2 bg-[#CCFF00] rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <img
              src="/images/Hero_Image1.jpg"
              alt="Elite Coaching"
              className="relative rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full object-cover aspect-square md:aspect-video"
            />
          </div>
          <div className="w-full md:w-1/2 text-left">
            <div className="text-[#CCFF00] text-2xl md:text-4xl font-black mb-4">///</div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[0.9] uppercase italic">
              We assist<br />your evolution.
            </h2>
            <p className="text-gray-500 text-sm md:text-lg mb-8 leading-relaxed italic">
              From high-tension calisthenics to injury preventative yoga, our dedicated team guides your 
              physical aspirations with data-backed expert advice.
            </p>
            <button className="w-full md:w-auto border-2 border-[#CCFF00] text-[#CCFF00] px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-[#CCFF00] hover:text-black transition-all">
              About Our Method
            </button>
          </div>
        </section>

        {/* WHY FITSYNC (Grid 1 on mobile, 3 on desktop) */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter">Why FitSync?</h2>
          <p className="text-gray-600 mb-12 text-sm md:text-lg font-bold uppercase tracking-widest">Elite access. Expert guidance. Lasting health.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <FaCrown />, title: "Certified Trainer", desc: "Expert guidance tailored to your unique needs and goals." },
              { icon: <FaAppleAlt />, title: "Nutrition & Diet", desc: "Unlock your full potential with comprehensive, data-driven diet plans." },
              { icon: <FaMedal />, title: "Years' Mastery", desc: "Benefit from decades of fitness expertise and proven transformation." },
              { icon: <FaHandsHelping />, title: "Encouragement", desc: "A supportive community fostering growth and accountability." },
              { icon: <FaDumbbell />, title: "1-on-1 Training", desc: "Personalized attention tailored to your unique fitness level." },
              { icon: <FaFire />, title: "Commitment", desc: "A transformative journey through consistent dedication and results." },
            ].map((feature, index) => (
              <div key={index} className="group bg-[#0B0B0B] p-8 rounded-[2rem] border border-gray-900 hover:border-[#CCFF00]/30 transition-all shadow-xl">
                <div className="text-[#CCFF00] text-3xl md:text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-black uppercase italic mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs md:text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA (Scale down height on mobile) */}
        <section className="relative mb-32 overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border border-gray-900">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Join FitSync"
            className="w-full h-[400px] md:h-[600px] object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-center items-center text-center p-6">
            <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter leading-none uppercase">
              READY TO EVOLVE WITH <br/><span className="text-[#CCFF00] italic">FITSYNC?</span>
            </h2>
            <button className="w-full md:w-auto bg-[#CCFF00] text-black px-12 py-5 rounded-full text-lg md:text-xl font-black uppercase tracking-[0.2em] hover:shadow-[0_0_50px_rgba(204,255,0,0.6)] transition-all">
              Initialize Membership
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER (Stacking on mobile) */}
      <footer className="bg-[#0B0B0B] py-16 border-t border-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-3xl font-black italic tracking-tighter">FIT<span className="text-[#CCFF00]">SYNC</span></div>
            <div className="flex space-x-10">
              <FaInstagram className="text-gray-600 hover:text-[#CCFF00] text-2xl transition-colors cursor-pointer" />
              <FaFacebook className="text-gray-600 hover:text-[#CCFF00] text-2xl transition-colors cursor-pointer" />
              <FaTwitter className="text-gray-600 hover:text-[#CCFF00] text-2xl transition-colors cursor-pointer" />
              <FaYoutube className="text-gray-600 hover:text-[#CCFF00] text-2xl transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">
            System Status: Active // Copyright © 2026 FitSync Registry.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage