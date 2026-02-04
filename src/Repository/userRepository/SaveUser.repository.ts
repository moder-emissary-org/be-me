import { User } from "@/models/User.models.js";

export const SaveUser_Repository = async (userData: any) => {

  const user = await User.create(
    userData
  );

  console.log("Saved user repository layer hit: ", user);
  
  return user;
}