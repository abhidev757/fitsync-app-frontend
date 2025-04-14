import { useState } from "react";
import { Home, Minus, Plus } from "lucide-react";
import { submitUserFitnessData } from "../../axios/userApi";
import { useNavigate } from "react-router-dom";

const UserInfo: React.FC = () => {
  const [sex, setSex] = useState<"Male" | "Female" | null>(null);
  const [age, setAge] = useState(20);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(85);
  const [targetWeight, setTargetWeight] = useState(71);
  const [activity, setActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = { sex, age, height, weight, targetWeight, activity };
      await submitUserFitnessData(data);
      navigate('/signin')
    } catch (error) {
      console.log("Failed to submit fitness data.",error);
      alert("Failed to submit fitness data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Home Button */}
      <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 mb-8">
        <Home size={20} />
        <span>Go to Home</span>
      </button>

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">FITSYNC</h1>

        {/* User Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl mb-4">What is your biological sex?</h2>
            <div className="flex space-x-4">
              {["Male", "Female"].map((option) => (
                <button
                  key={option}
                  className={`px-6 py-2 rounded-full font-semibold ${
                    sex === option ? "bg-yellow-400 text-black" : "bg-gray-700 border border-yellow-400"
                  }`}
                  onClick={() => setSex(option as "Male" | "Female")}
                >
                  {option}
                </button>
              ))}
            </div>

            <h2 className="text-xl mt-8 mb-4">What is your age?</h2>
            <div className="flex items-center space-x-4">
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setAge(age - 1)}>
                <Minus size={20} />
              </button>
              <span className="text-2xl text-yellow-400">{age}</span>
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setAge(age + 1)}>
                <Plus size={20} />
              </button>
            </div>

            <h2 className="text-xl mt-8 mb-4">How tall are you?</h2>
            <div className="flex items-center space-x-4">
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setHeight(height - 1)}>
                <Minus size={20} />
              </button>
              <span className="text-2xl text-yellow-400">{height} CM</span>
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setHeight(height + 1)}>
                <Plus size={20} />
              </button>
            </div>

            <h2 className="text-xl mt-8 mb-4">What is your current weight?</h2>
            <div className="flex items-center space-x-4">
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setWeight(weight - 1)}>
                <Minus size={20} />
              </button>
              <span className="text-2xl text-yellow-400">{weight} KG</span>
              <button className="bg-gray-700 p-2 rounded-full" onClick={() => setWeight(weight + 1)}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl mb-4">How active are you?</h2>
            {["Little or No Activity", "Lightly Active", "Moderately Active", "Very Active"].map((level) => (
              <button
                key={level}
                className={`w-full text-left p-4 rounded-lg mb-4 ${
                  activity === level ? "bg-yellow-400 text-black" : "bg-gray-700 border border-yellow-400"
                }`}
                onClick={() => setActivity(level)}
              >
                <h3 className="font-bold">{level}</h3>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl mb-4">What is your target weight?</h2>
          <p className="text-sm mb-4 text-gray-400">
            Your target weight is within your ideal range of 64 - 79 Kg.
          </p>
          <p className="text-yellow-400 font-bold mb-4">Lose {weight - targetWeight} Kg</p>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-700 p-2 rounded-full" onClick={() => setTargetWeight(targetWeight - 1)}>
              <Minus size={20} />
            </button>
            <span className="text-2xl text-yellow-400">{targetWeight} KG</span>
            <button className="bg-gray-700 p-2 rounded-full" onClick={() => setTargetWeight(targetWeight + 1)}>
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            className={`px-8 py-3 rounded-full text-xl font-bold ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
