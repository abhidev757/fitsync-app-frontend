import { ChevronRight, Utensils, Flame, Footprints, Droplets } from "lucide-react"
import { Button } from "../../components/user/ui/button"
import { Card, CardContent } from "../../components/user/ui/card"
import ProgressCircle from "../../components/user/progress-circle"

const Dashboard = () => {
  console.log(localStorage.getItem('userId'));
  
  // Mock data for the dashboard
  const user = {
    name: "Tassy Omah",
    avatar: "https://via.placeholder.com/100",
    age: 25,
    location: "New York, USA",
    goal: "75kg",
    height: "186cm",
    weight: "90kg",
    sleepTime: 6.5,
    sleepGoal: 8,
    nutrition: {
      calories: 2600,
      protein: 65,
      carb: 50,
      fat: 65,
      fiber: 50,
    },
    workout: {
      calories: 399,
      steps: 2265,
      water: "5/9",
    },
  }

  // Calendar days
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  const dates = Array.from({ length: 31 }, (_, i) => i + 1)
  const currentDay = 8 // Highlighted day

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-[#1a1a1a] to-[#1a1a1a] border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Hello {user.name},</h2>
              <p className="text-gray-400 mb-4">Have a nice day and don't forget to take care of your health!</p>
              <Button variant="link" className="text-[#d9ff00] p-0 flex items-center gap-1">
                Learn more <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative h-40 w-40 mr-8">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MihUgsEmDGQ55ZWPpknmkqxqAmeQOb.png"
                alt="Meditation illustration"
                className="object-contain h-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Nutrition */}
        <div className="md:col-span-2">
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#d9ff00]/20 p-2 rounded-lg">
                  <Utensils className="h-6 w-6 text-[#d9ff00]" />
                </div>
                <div>
                  <h3 className="font-medium">Track Food</h3>
                  <p className="text-sm text-gray-400">Eat {user.nutrition.calories} cal</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Protein */}
                <div>
                  <p className="text-sm mb-2">Protein</p>
                  <ProgressCircle percentage={user.nutrition.protein} size={80} strokeWidth={10}>
                    <span className="text-sm font-bold">{user.nutrition.protein}%</span>
                  </ProgressCircle>
                </div>

                {/* Carb */}
                <div>
                  <p className="text-sm mb-2">Carb</p>
                  <ProgressCircle percentage={user.nutrition.carb} size={80} strokeWidth={10}>
                    <span className="text-sm font-bold">{user.nutrition.carb}%</span>
                  </ProgressCircle>
                </div>

                {/* Fat */}
                <div>
                  <p className="text-sm mb-2">Fat</p>
                  <ProgressCircle percentage={user.nutrition.fat} size={80} strokeWidth={10}>
                    <span className="text-sm font-bold">{user.nutrition.fat}%</span>
                  </ProgressCircle>
                </div>

                {/* Fiber */}
                <div>
                  <p className="text-sm mb-2">Fiber</p>
                  <ProgressCircle percentage={user.nutrition.fiber} size={80} strokeWidth={10}>
                    <span className="text-sm font-bold">{user.nutrition.fiber}%</span>
                  </ProgressCircle>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {/* Workout */}
            <Card className="bg-[#1a1a1a] border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#d9ff00] p-1 rounded">
                    <Flame className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-sm">Workout</span>
                </div>
                <ProgressCircle percentage={40} size={100} strokeWidth={10}>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.workout.calories}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                </ProgressCircle>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="bg-[#1a1a1a] border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#d9ff00] p-1 rounded">
                    <Footprints className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-sm">Steps</span>
                </div>
                <ProgressCircle percentage={60} size={100} strokeWidth={10}>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.workout.steps}</p>
                    <p className="text-xs text-gray-400">Steps</p>
                  </div>
                </ProgressCircle>
              </CardContent>
            </Card>

            {/* Water */}
            <Card className="bg-[#1a1a1a] border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#d9ff00] p-1 rounded">
                    <Droplets className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-sm">Water</span>
                </div>
                <ProgressCircle percentage={55} size={100} strokeWidth={10}>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.workout.water}</p>
                    <p className="text-xs text-gray-400">Glasses</p>
                  </div>
                </ProgressCircle>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - User Profile & Sleep */}
        <div className="space-y-6">
          {/* User Profile */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full overflow-hidden mb-2">
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="text-xl font-bold">Charles Robbie</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
                <span>{user.age} years old</span>
                <span className="mx-1">•</span>
                <span>{user.location}</span>
              </p>

              <div className="grid grid-cols-3 w-full gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Goal</p>
                  <p className="font-bold">{user.goal}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Height</p>
                  <p className="font-bold">{user.height}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="font-bold">{user.weight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Time */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-1">Sleep Time</h3>
              <p className="text-sm text-gray-400 mb-4">Ready for today's Challenges?</p>

              <div className="flex justify-center mb-4">
                <ProgressCircle percentage={(user.sleepTime / user.sleepGoal) * 100} size={120} strokeWidth={12}>
                  <span className="text-xl font-bold">{user.sleepTime}h</span>
                </ProgressCircle>
              </div>

              <p className="text-center text-sm">Goal is {user.sleepGoal} hours</p>
            </CardContent>
          </Card>

          {/* Trainer's Appointment */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-[#d9ff00]">📅</span> Trainer's Appointment
              </h3>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day, i) => (
                  <div key={i} className="text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Dates */}
              <div className="grid grid-cols-7 gap-1">
                {dates.map((date) => (
                  <div
                    key={date}
                    className={`text-center p-1 rounded-full ${date === currentDay ? "bg-[#d9ff00] text-black" : "hover:bg-[#2a2a2a]"}`}
                  >
                    {date}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

