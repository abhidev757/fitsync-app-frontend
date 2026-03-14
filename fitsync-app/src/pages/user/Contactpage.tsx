import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa"
import { Link } from 'react-router-dom'

const ContactPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Operational Comms Transmitted:', formData);
  };

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
          <Link to='/about' className="hover:text-[#CCFF00] transition-colors uppercase text-xs tracking-widest">About Us</Link>
          <Link to='/contact' className="text-[#CCFF00] font-bold uppercase text-xs tracking-widest">Contact Us</Link>
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
          <Link to='/about' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic">About Us</Link>
          <Link to='/contact' onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase italic text-[#CCFF00]">Contact Us</Link>
          <Link to='/signin' onClick={() => setIsMenuOpen(false)}>
            <button className="bg-[#CCFF00] text-black px-8 py-4 rounded-full font-black uppercase">
              Become a Member
            </button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[450px] flex items-center justify-center overflow-hidden px-6">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale opacity-30 md:opacity-40" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')"}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black to-black"></div>
        
        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
            GET IN <span className="text-[#CCFF00]">TOUCH</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-lg leading-relaxed mb-8 italic">
            Whether you have questions about membership, calisthenics programs, 
            or need injury recovery assistance, our elite team is ready to help you evolve.
          </p>
          <div className="w-16 md:w-20 h-1 bg-[#CCFF00] mx-auto"></div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 md:py-24 px-4 -mt-10 md:-mt-20 relative z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-2 bg-[#0B0B0B] p-2 rounded-[2.5rem] border border-gray-900 shadow-2xl">
          
          {/* Info Side */}
          <div className="w-full md:w-1/3 bg-black rounded-[2rem] p-8 md:p-10 flex flex-col justify-between border border-gray-900/50">
            <div>
              <h2 className="text-xl md:text-2xl font-black mb-8 text-[#CCFF00] uppercase italic tracking-tighter">Contact Info</h2>
              <div className="space-y-8">
                <div className="flex items-start group">
                  <FaPhoneAlt className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Voice Comms</p>
                    <p className="text-white text-sm font-bold group-hover:text-[#CCFF00] transition-colors tracking-tight">+269 (0) 256 215</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <FaEnvelope className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Digital Signal</p>
                    <p className="text-white text-sm font-bold group-hover:text-[#CCFF00] transition-colors tracking-tight">support@fitsync.com</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <FaMapMarkerAlt className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Operational HQ</p>
                    <p className="text-white text-sm font-bold leading-tight tracking-tight">123 Performance Way,<br/>FitCity, HQ 5021</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-6 mt-12">
               <FaInstagram className="text-gray-600 hover:text-[#CCFF00] text-xl cursor-pointer transition-colors" />
               <FaFacebook className="text-gray-600 hover:text-[#CCFF00] text-xl cursor-pointer transition-colors" />
               <FaTwitter className="text-gray-600 hover:text-[#CCFF00] text-xl cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-2/3 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tighter uppercase italic">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] ml-1 italic">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00]/50 focus:outline-none transition-all text-sm font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] ml-1 italic">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00]/50 focus:outline-none transition-all text-sm font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] ml-1 italic">Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you reach your peak?"
                  rows={5}
                  className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00]/50 focus:outline-none transition-all resize-none text-sm font-bold"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all active:scale-[0.98]"
              >
                Transmit Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0B] py-12 border-t border-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-black mb-4 italic tracking-tighter">FIT<span className="text-[#CCFF00]">SYNC</span></div>
          <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">Operational Registry // Copyright © 2026 FitSync.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;