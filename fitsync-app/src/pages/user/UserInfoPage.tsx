import { useState } from "react";
import { Home, Minus, Plus, ChevronRight, Activity, Target, User } from "lucide-react";
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
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = { sex, age, height, weight, targetWeight, activity };
      await submitUserFitnessData(data);
      navigate('/signin');
    } catch (error) {
      console.log("Failed to submit fitness data.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 font-sans pb-12">
      {/* Home Navigation */}
      <div className="max-w-5xl mx-auto mb-6 md:mb-10">
        <button 
          onClick={() => navigate('/home')}
          className="group flex items-center space-x-3 text-gray-500 hover:text-[#CCFF00] transition-colors"
        >
          <div className="p-2 bg-[#0B0B0B] border border-gray-900 rounded-xl group-hover:border-[#CCFF00]/50 transition-all">
            <Home size={16} />
          </div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Return to Base</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
            <p className="text-[#CCFF00] font-black text-[9px] md:text-xs tracking-[0.4em] uppercase mb-2">Protocol Initialization</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              FIT<span className="text-[#CCFF00]">SYNC</span> BIOMETRICS
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Left Column: Core Data */}
          <div className="space-y-10 md:space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User size={16} className="text-[#CCFF00]" />
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 italic">Biological Profile</h2>
              </div>
              <div className="flex space-x-3 md:space-x-4">
                {["Male", "Female"].map((option) => (
                  <button
                    key={option}
                    className={`flex-1 py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-2 active:scale-95 ${
                      sex === option 
                        ? "bg-[#CCFF00] border-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]" 
                        : "bg-black border-gray-900 text-gray-600 hover:border-gray-700"
                    }`}
                    onClick={() => setSex(option as "Male" | "Female")}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Inputs */}
            <div className="space-y-8 md:space-y-10">
              {[
                { label: "Current Age", val: age, setter: setAge, unit: "Years" },
                { label: "Height Projection", val: height, setter: setHeight, unit: "CM" },
                { label: "Current Mass", val: weight, setter: setWeight, unit: "KG" },
              ].map((item, idx) => (
                <div key={idx}>
                  <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3 ml-1">{item.label}</h2>
                  <div className="flex items-center justify-between bg-black border border-gray-900 p-1.5 md:p-2 rounded-xl md:rounded-2xl">
                    <button 
                      className="p-3 md:p-4 bg-gray-900 rounded-lg md:rounded-xl text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-90" 
                      onClick={() => item.setter(item.val - 1)}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">
                      {item.val} <span className="text-[9px] md:text-[10px] not-italic text-gray-600">{item.unit}</span>
                    </span>
                    <button 
                      className="p-3 md:p-4 bg-gray-900 rounded-lg md:rounded-xl text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-90" 
                      onClick={() => item.setter(item.val + 1)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Activity Level */}
          <div>
            <div className="flex items-center gap-3 mb-6">
                <Activity size={16} className="text-[#CCFF00]" />
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 italic">Kinetic Gradient</h2>
            </div>
            <div className="space-y-3 md:space-y-4">
              {["Little or No Activity", "Lightly Active", "Moderately Active", "Very Active"].map((level) => (
                <button
                  key={level}
                  className={`w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all active:scale-[0.98] group ${
                    activity === level 
                        ? "bg-[#CCFF00]/5 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.1)]" 
                        : "bg-black border-gray-900 hover:border-gray-700"
                  }`}
                  onClick={() => setActivity(level)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={`font-black uppercase tracking-tight text-[11px] md:text-sm ${activity === level ? "text-[#CCFF00]" : "text-gray-500 group-hover:text-white"}`}>{level}</h3>
                    {activity === level && <ChevronRight size={16} className="text-[#CCFF00]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Weight Section */}
        <div className="mt-12 md:mt-16 pt-10 md:pt-16 border-t border-gray-900">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                    <Target size={16} className="text-[#CCFF00]" />
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 italic">Objective Mass</h2>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                    <div className="flex items-center bg-black border border-gray-900 p-1.5 md:p-2 rounded-xl md:rounded-2xl w-full max-w-sm">
                        <button 
                          className="p-3 md:p-4 bg-gray-900 rounded-lg md:rounded-xl text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-90" 
                          onClick={() => setTargetWeight(targetWeight - 1)}
                        >
                          <Minus size={18} />
                        </button>
                        <span className="flex-1 text-center text-xl md:text-3xl font-black italic tracking-tighter uppercase">
                          {targetWeight} <span className="text-[9px] md:text-[10px] not-italic text-gray-600">KG</span>
                        </span>
                        <button 
                          className="p-3 md:p-4 bg-gray-900 rounded-lg md:rounded-xl text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-90" 
                          onClick={() => setTargetWeight(targetWeight + 1)}
                        >
                          <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 border-l-2 border-[#CCFF00]/20 pl-4">
                        <p className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest italic leading-none">Delta Projection</p>
                        <p className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                          {Math.abs(weight - targetWeight)} KG 
                          <span className="text-[9px] md:text-[10px] text-gray-600 ml-2 not-italic font-bold">
                            {weight >= targetWeight ? "Reduction" : "Gain"}
                          </span>
                        </p>
                    </div>
                </div>
                <p className="text-[8px] md:text-[9px] mt-6 font-bold text-gray-700 uppercase tracking-[0.15em] leading-relaxed max-w-xl">
                    * Ideal mass range for your height profile is calibrated between 64 KG - 79 KG based on global baseline data.
                </p>
            </div>

            <button
                disabled={loading || !sex || !activity}
                className={`group w-full xl:w-auto flex items-center justify-center gap-3 px-10 md:px-16 py-5 md:py-6 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.3em] transition-all ${
                loading || !sex || !activity
                    ? "bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800" 
                    : "bg-[#CCFF00] text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] active:scale-95"
                }`}
                onClick={handleSubmit}
            >
                {loading ? "Syncing..." : "Finalize Profile"}
                {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-10 md:mt-12 text-gray-800 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] px-4 leading-relaxed">
        End of Configuration Protocol // FitSync System v2.6.0
      </p>
    </div>
  );
};

export default UserInfo;