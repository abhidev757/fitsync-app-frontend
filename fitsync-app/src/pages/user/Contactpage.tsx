import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa"
import {Link} from 'react-router-dom'


const ContactPage: React.FC = () => {
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
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black">
      <Link to = '/home' >
        <div className="text-2xl font-bold">FITSYNC</div>
         </Link>
        <nav className="space-x-4">
          <Link to='/about' >
          <a  className="text-white">About Us</a>
          </Link>
          <Link to='contact' >
          <a  className="text-yellow-400">Contact Us</a>
          </Link>
          <Link to = '/signin' >
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Become a Member</button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qIGWdTz7S4niB1gCtEBmA9Pr0B5wr2.png')"}}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="max-w-2xl mb-8">We value your inquiries and feedback at FitSync. Whether you have questions about membership, want to learn more about our classes, or simply need assistance, our team is here to help.</p>
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold">Let's Reach Your Peak</button>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-lg border border-blue-500">
          <h2 className="text-3xl font-bold mb-8 text-center">REACH OUT</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full bg-gray-800 text-white p-3 rounded"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full bg-gray-800 text-white p-3 rounded"
                required
              />
            </div>
            <div className="md:col-span-2">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                rows={6}
                className="w-full bg-gray-800 text-white p-3 rounded"
                required
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-yellow-400 text-black py-3 rounded-full font-bold">
                Let's Reach Your Peak
              </button>
            </div>
          </form>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+269 (0) 256 215</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contact@strongx.com</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>123 Main Street, Cityville, Stateville, ZIP Code</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">FITSYNC</div>
                  <div className="flex space-x-4">
                    <FaInstagram className="text-gray-400 hover:text-white cursor-pointer" />
                    <FaFacebook className="text-gray-400 hover:text-white cursor-pointer" />
                    <FaTwitter className="text-gray-400 hover:text-white cursor-pointer" />
                    <FaYoutube className="text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                </div>
                <div className="mt-4 text-center text-gray-400">Copyright © 2023 FitSync. All rights reserved.</div>
              </div>
            </footer>
    </div>
  );
};

export default ContactPage;