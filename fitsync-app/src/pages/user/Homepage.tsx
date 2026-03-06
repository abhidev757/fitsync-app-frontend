import { FaCrown, FaAppleAlt, FaMedal, FaHandsHelping, FaDumbbell, FaFire } from "react-icons/fa"
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa"
import { Link } from "react-router-dom"

const Homepage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-gray-900">
        <Link to='/home'>
          <div className="text-2xl font-black tracking-tighter text-white">FITSYNC</div>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to='/about' className="hover:text-[#CCFF00] transition-colors">About Us</Link>
          <Link to='/contact' className="hover:text-[#CCFF00] transition-colors">Contact Us</Link>
          <Link to='/signin'>
            <button className="bg-white text-black px-5 py-2 rounded-sm font-bold hover:bg-[#CCFF00] transition-all">
              Become a Member
            </button>
          </Link>
        </nav>
      </header>

      {/* SUB-NAV */}
      <nav className="bg-[#0D1117] p-3 border-b border-gray-900">
        <ul className="flex justify-center space-x-8 text-sm font-medium">
          {["Motivation", "Weight Management", "Well being", "Nutrition", "Fitness", "Equipment Guides"].map((item) => (
            <li key={item} className="flex items-center group cursor-pointer">
              <span className="text-[#CCFF00] mr-2 text-[10px]">▶</span>
              <a href="#" className="text-gray-400 group-hover:text-white transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="container mx-auto px-6">
        {/* HERO SECTION */}
        <section className="text-center py-24">
          <h1 className="text-7xl font-black mb-6 tracking-tight">
            Peak Performance.
            <br />
            <span className="text-[#CCFF00]">Peak Results.</span>
          </h1>
          <p className="mb-10 text-gray-500 text-lg max-w-2xl mx-auto">
            Welcome to FITSYNC, where elite calisthenics meets mindful recovery. 
            Every workout propels you toward the summit of your fitness goals.
          </p>
          <Link to='/signup'>
            <button className="bg-[#CCFF00] text-black px-10 py-4 rounded-full text-xl font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              Let's Reach Your Peak
            </button>
          </Link>
        </section>

        {/* STATS BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-gray-900 bg-[#0D1117]/50 backdrop-blur-sm rounded-2xl p-8 mb-24">
          {[
            { label: "Members", value: "10K" },
            { label: "Trainers", value: "1K" },
            { label: "Calories Burnt", value: "10M" },
            { label: "Hours Trained", value: "20K" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-[#CCFF00]">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ASSIST SECTION */}
        <section className="flex flex-col md:flex-row items-center space-y-12 md:space-y-0 md:space-x-16 mb-32">
          <div className="md:w-1/2 relative">
             <div className="absolute -inset-1 bg-[#CCFF00] rounded-lg blur opacity-10"></div>
            <img
              src="/images/Hero_Image1.jpg"
              alt="Elite Coaching"
              className="relative rounded-lg grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="md:w-1/2">
            <div className="text-[#CCFF00] text-3xl font-black mb-4">///</div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              We're here to assist<br />your evolution.
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              From high-tension calisthenics to injury preventative yoga, our dedicated team guides your 
              physical aspirations with data-backed expert advice.
            </p>
            <button className="border-2 border-[#CCFF00] text-[#CCFF00] px-8 py-2 rounded-full font-bold hover:bg-[#CCFF00] hover:text-black transition-all">
              About Our Method
            </button>
          </div>
        </section>

        {/* WHY FITSYNC / FEATURES */}
        <section className="mb-32">
          <h2 className="text-4xl font-black mb-2">Why FitSync?</h2>
          <p className="text-gray-500 mb-12 text-lg">Elite access. Expert guidance. Lasting health.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaCrown />, title: "Certified Trainer", desc: "Expert guidance tailored to your unique needs and goals." },
              { icon: <FaAppleAlt />, title: "Nutrition & Diet", desc: "Unlock your full potential with comprehensive, data-driven diet plans." },
              { icon: <FaMedal />, title: "Years' Mastery", desc: "Benefit from decades of fitness expertise and proven transformation." },
              { icon: <FaHandsHelping />, title: "Encouragement", desc: "A supportive community fostering growth and accountability." },
              { icon: <FaDumbbell />, title: "1-on-1 Training", desc: "Personalized attention tailored to your unique fitness level." },
              { icon: <FaFire />, title: "Commitment", desc: "A transformative journey through consistent dedication and results." },
            ].map((feature, index) => (
              <div key={index} className="group bg-[#0D1117] p-8 rounded-2xl border border-transparent hover:border-[#CCFF00]/30 transition-all">
                <div className="text-[#CCFF00] text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative mb-32 overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Join FitSync"
            className="w-full h-[500px] object-cover opacity-60 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-center items-center text-center p-6">
            <h2 className="text-5xl font-black mb-8 tracking-tighter">
              READY TO EVOLVE WITH <span className="text-[#CCFF00]">FITSYNC?</span>
            </h2>
            <button className="bg-[#CCFF00] text-black px-12 py-4 rounded-full text-xl font-black hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all">
              Become a Member
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0D1117] py-12 border-t border-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-black mb-6 md:mb-0">FITSYNC</div>
            <div className="flex space-x-8">
              <FaInstagram className="text-gray-500 hover:text-[#CCFF00] text-xl transition-colors cursor-pointer" />
              <FaFacebook className="text-gray-500 hover:text-[#CCFF00] text-xl transition-colors cursor-pointer" />
              <FaTwitter className="text-gray-500 hover:text-[#CCFF00] text-xl transition-colors cursor-pointer" />
              <FaYoutube className="text-gray-500 hover:text-[#CCFF00] text-xl transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/50 text-center text-gray-600 text-sm">
            Copyright © 2026 FitSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage