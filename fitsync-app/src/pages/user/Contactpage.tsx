import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import { Link } from 'react-router-dom'

const ContactPage = () => {
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
    console.log('Form submitted:', formData);
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-900">
        <Link to='/home'>
          <div className="text-2xl font-black tracking-tighter">FITSYNC</div>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to='/about' className="hover:text-[#CCFF00] transition-colors">About Us</Link>
          <Link to='/contact' className="text-[#CCFF00] font-bold">Contact Us</Link>
          <Link to='/signin'>
            <button className="bg-white text-black px-5 py-2 rounded-sm font-bold hover:bg-[#CCFF00] transition-all">
              Become a Member
            </button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        {/* Background Image with darker overlay for elite feel */}
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale opacity-40" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')"}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black to-black"></div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-6xl font-black mb-6 tracking-tight">
            GET IN <span className="text-[#CCFF00]">TOUCH</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Whether you have questions about membership, calisthenics programs, 
            or need injury recovery assistance, our elite team is ready to help you evolve.
          </p>
          <div className="w-20 h-1 bg-[#CCFF00] mx-auto"></div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 px-4 -mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 bg-[#0D1117] p-1 rounded-3xl border border-gray-800 shadow-2xl">
          
          {/* Info Side */}
          <div className="md:w-1/3 bg-black rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-8 text-[#CCFF00]">Contact Info</h2>
              <div className="space-y-8">
                <div className="flex items-start group">
                  <FaPhoneAlt className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Call Us</p>
                    <p className="text-white font-medium group-hover:text-[#CCFF00] transition-colors">+269 (0) 256 215</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <FaEnvelope className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Email Us</p>
                    <p className="text-white font-medium group-hover:text-[#CCFF00] transition-colors">support@fitsync.com</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <FaMapMarkerAlt className="text-[#CCFF00] mt-1 mr-4" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Location</p>
                    <p className="text-white font-medium leading-tight">123 Performance Way,<br/>FitCity, HQ 5021</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-12">
               <FaInstagram className="text-gray-400 hover:text-[#CCFF00] text-xl cursor-pointer" />
               <FaFacebook className="text-gray-400 hover:text-[#CCFF00] text-xl cursor-pointer" />
               <FaTwitter className="text-gray-400 hover:text-[#CCFF00] text-xl cursor-pointer" />
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00] focus:outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest ml-1">Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you reach your peak?"
                  rows={5}
                  className="w-full bg-black border border-gray-800 text-white p-4 rounded-xl focus:border-[#CCFF00] focus:outline-none transition-all resize-none"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-black mb-4">FITSYNC</div>
          <p className="text-gray-600 text-sm">Copyright © 2026 FitSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;