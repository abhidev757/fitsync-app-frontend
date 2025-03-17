import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa"
import {Link} from 'react-router-dom'

const Aboutpage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black">
      <Link to = '/home' >
        <div className="text-2xl font-bold">FITSYNC</div>
         </Link>
        <nav className="space-x-4">
        <Link to = '/about' >
          <a  className="text-yellow-400">About Us</a>
        </Link>
         <Link to = '/contact' >
          <a  className="text-white">Contact Us</a>
         </Link>
          <Link to = '/signin' >
          <button className="bg-gray-800 text-white px-4 py-2 rounded">Become a Member</button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHHifAS0BPOmxUSdJNWWaEifH1e5YH.png')"}}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="max-w-2xl mb-8">Welcome to FITSYNC, where fitness meets technology. It's not just a gym, it's a lifestyle. At FITSYNC, we're committed to providing you with a personalized fitness experience that goes beyond physical well-being, encompassing mental health and overall life balance.</p>
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold">Let's Reach Your Peak</button>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHHifAS0BPOmxUSdJNWWaEifH1e5YH.png" alt="Our Mission" className="rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-yellow-400">▶▶▶</span> Our Mission
            </h2>
            <p className="mb-4">At the core of FITSYNC is a mission to empower individuals to reach their peak potential physically, mentally, and emotionally.</p>
            <p>We strive to create an inclusive space where everyone, regardless of fitness level, feels inspired and supported on their journey towards a healthier and more fulfilling life.</p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHHifAS0BPOmxUSdJNWWaEifH1e5YH.png" alt="Our Approach" className="rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 md:pr-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-yellow-400">▶▶▶</span> Our Approach
            </h2>
            <p className="mb-4">What sets us apart is our comprehensive approach to fitness. We combine state-of-the-art facilities, cutting-edge technology, and a diverse range of classes designed to cater to different preferences and goals.</p>
            <p>Our team of certified trainers is dedicated to providing personalized guidance, ensuring that you have the tools and motivation to reach your fitness goals.</p>
          </div>
        </div>
      </section>

      {/* Our Core Values */}
      <section className="py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Passion', 'Commitment', 'Community', 'Growth', 'Authenticity', 'Inclusivity'].map((value, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg">
              <div className="text-yellow-400 text-4xl mb-4">
                {['👑', '👥', '⚡', '📈', '🔒', '∞'][index]}
              </div>
              <h3 className="text-2xl font-bold mb-2">{value}</h3>
              <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="py-8 bg-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between px-4">
          {['Motivation', 'Weight Management', 'Well being', 'Nutrition', 'Environmentally Friendly', 'Fitness'].map((topic, index) => (
            <span key={index} className="text-yellow-400">
              {topic} <span className="ml-2">▶</span>
            </span>
          ))}
        </div>
      </section>

      {/* Meet your certified trainers */}
      <section className="py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Meet your certified trainers</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {['David Johnson', 'Sara Wallace', 'Mark Johnson'].map((trainer, index) => (
            <div key={index} className="relative">
              <img src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aEZGfwTzihx7hh5nRUB1UbR6X2uRij.png`} alt={trainer} className="rounded-lg shadow-lg" />
              <div className="absolute bottom-0 left-0 bg-gray-800 px-4 py-2 rounded-tr-lg">
                <h3 className="text-xl font-bold">{trainer}</h3>
                <p className="text-yellow-400">Certified Trainer</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative h-96 bg-cover bg-center" style={{backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-G4WsjQM9rcrgXFOg4atKgUQWQTpMks.png')"}}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-4xl font-bold mb-4">READY TO START YOUR<br />JOURNEY WITH FITSYNC</h2>
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold mt-8">Become a Member</button>
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
  )
}

export default Aboutpage
