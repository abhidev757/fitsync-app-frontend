export const loginTrainer = async (data: ILoginData) => {
  const response = await axiosInstance.post("/trainer/trainerAuth", data);
  console.log("Response Dataaaaa:",response.data);
  return response.data;
};