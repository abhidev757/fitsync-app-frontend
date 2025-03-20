
export interface IRegisterData {
    name: string;
    email: string;
    password: string;
    specializations: string
    certificateUrl: string
  }
  
 export interface IRegisterResponse {
    _id: string;
    name: string;
    email: string;
    otp: string;
  }

 export interface ITrainerProfileEditData {
  userData:{
    name?: string;
    email?: string;
    phone?: string;
    sex?: "Male" | "Female" | null;
    yearsOfExperience: number
    specialization: string
  }
 }