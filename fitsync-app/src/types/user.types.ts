
export interface IRegisterData {
    name: string;
    email: string;
    password: string;
  }
  
 export interface IRegisterResponse {
    _id: string;
    name: string;
    email: string;
    otp: string;
  }

 export interface IUserFitnessData {
    sex: "Male" | "Female" | null;
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
    activity: string | null;
  }

export interface IProfileEditData {
  userData: {
    name?: string;
    email?: string;
    phone?: string;
  };
  fitnessData: {
    sex?: "Male" | "Female" | null;
    age?: number;
    height?: number;
    weight?: number;
    targetWeight?: number;
    activity?: "Little or No Activity" | "Lightly Active" | "Moderately Active" | "Very Active";
  };
}