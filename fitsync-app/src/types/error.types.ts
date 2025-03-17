export interface IApiError {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      errors?:string;
    };
    error?: string;
  }
  