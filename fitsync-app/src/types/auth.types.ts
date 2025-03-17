export interface ILoginData {
    email: string;
    password: string;
  }

export  interface ILogin {
    _id: string;
    name: string;
    email: string;
    token: string;
    isGoogleLogin?: boolean;
  }
  
export  interface IforgotPasswordData {
    email : string
  }
 export interface IresetPasswordData{
    password:string;
  }

 export interface IOtp{
    otp:string;
    emailId:string;
  }
 export interface IResendOtpData {
    emailId: string;
  }

 export interface IGoogleLogin {
    _id: string;
    name: string;
    email: string;
    isGoogleLogin: boolean;
  }

  export  interface IforgotPasswordData {
    email : string
  }
 export interface IresetPasswordData{
    password:string;
  }