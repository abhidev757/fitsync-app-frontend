import { FaCrown, FaAppleAlt, FaMedal, FaHandsHelping, FaDumbbell, FaFire } from "react-icons/fa"
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa"
import { Link } from "react-router-dom"

const Homepage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
         <Link to = '/home' >
        <div className="text-2xl font-bold">FITSYNC</div>
         </Link>
        <nav className="space-x-4">
          <Link to='/about' >
          <a className="hover:text-gray-300">
            About Us
          </a>
          </Link>

          <Link to='/contact'>
          <a  className="hover:text-gray-300">
            Contact Us
          </a>
          </Link>
          <Link to='/signin' >
          <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">Become a Member</button>
          </Link>
        </nav>
      </header>

      <nav className="bg-gray-900 p-4">
        <ul className="flex justify-center space-x-6">
          {["Motivation", "Weight Management", "Well being", "Nutrition", "Fitness", "Equipment Guides"].map((item) => (
            <li key={item} className="flex items-center">
              <span className="text-yellow-400 mr-1">▶</span>
              <a href="#" className="hover:text-yellow-400">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="container mx-auto px-4">
        <section className="text-center py-20">
          <h1 className="text-6xl font-bold mb-4">
            Peak Performance.
            <br />
            Peak Results.
          </h1>
          <p className="mb-8 text-gray-400">
            Welcome to FITSYNC, where every workout propels you
            <br />
            toward the summit of your fitness goals.
          </p>
          <Link to='/signup' >
          <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-yellow-300">
            Let's Reach Your Peak
          </button>
          </Link>
        </section>

        <section className="flex justify-between items-center border border-gray-800 rounded-lg p-6 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold">10K</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">1K</div>
            <div className="text-sm text-gray-400">Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">10M</div>
            <div className="text-sm text-gray-400">Calories Burnt</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">20K</div>
            <div className="text-sm text-gray-400">Hours Trained</div>
          </div>
        </section>

        <section className="flex items-center space-x-8 mb-20">
          <div className="w-1/2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZcTJbHGjri2w1psge4sNjE13EaoTiS.png"
              alt="People exercising in a gym"
              className="rounded-lg"
            />
          </div>
          <div className="w-1/2">
            <div className="text-yellow-400 text-2xl mb-4">{">>>"}</div>
            <h2 className="text-4xl font-bold mb-4">
              We're here to assist
              <br />
              you in your fitness
              <br />
              goals
            </h2>
            <p className="text-gray-400 mb-6">
              Our dedicated team is committed to guiding you towards your fitness aspirations. From personalized
              workouts to expert advice.
            </p>
            <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-300">
              About Us
            </button>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-4">Why FitSync?</h2>
          <p className="text-gray-400 mb-8">
            Choose FitSync for easy access, expert guidance, and a journey towards lasting health and fitness.
          </p>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: <FaCrown className="text-yellow-400 text-4xl mb-4" />,
                title: "Certified Trainer",
                description:
                  "Expert guidance tailored to your unique needs and goals. Our dedicated team of certified trainers is committed to your success, providing personalized coaching and unwavering support.",
              },
              {
                icon: <FaAppleAlt className="text-yellow-400 text-4xl mb-4" />,
                title: "Nutrition & Diet",
                description:
                  "Unlock your full potential with our comprehensive diet plans and expert guidance tailored to your unique needs and fitness goals. Our team of certified nutritionists will empower you.",
              },
              {
                icon: <FaMedal className="text-yellow-400 text-4xl mb-4" />,
                title: "Years' Mastery",
                description:
                  "Benefit from decades of fitness expertise with our master trainers, boasting years of experience and a proven track record of transforming lives. Our seasoned team brings unparalleled knowledge.",
              },
              {
                icon: <FaHandsHelping className="text-yellow-400 text-4xl mb-4" />,
                title: "Encouragement",
                description:
                  "More than a fitness journey, FitSync is a supportive community and expert guidance. Our motivating environment fosters growth, accountability, and lasting success.",
              },
              {
                icon: <FaDumbbell className="text-yellow-400 text-4xl mb-4" />,
                title: "1-on-1 Training",
                description:
                  "Experience personalized attention and expert guidance tailored to your unique fitness goals and needs. Unlock your full potential with customized workout routines.",
              },
              {
                icon: <FaFire className="text-yellow-400 text-4xl mb-4" />,
                title: "Commitment",
                description:
                  "Embark on a transformative journey to a fitter, healthier, and stronger you. Through consistent dedication and perseverance, unlock your full potential and achieve lasting results.",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-lg">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mb-20">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7w9tXyuX8nkF2i5c5QEL0vwmqclONh.png"
            alt="Person exercising"
            className="w-full h-[400px] object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-4">
              READY TO START YOUR
              <br />
              JOURNEY WITH FitSync
            </h2>
            <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-yellow-300">
              Become a Member
            </button>
          </div>
        </section>
      </main>

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

export default Homepage
