import type { Types } from "mongoose"
import { resolveCurrentUser_Service } from "./resolveCurrentUserService.service.js"
import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";

interface createUserInput {
  email: string,
  role: string,
  apartmentId: Types.ObjectId,
  ClerkUserId: string
}

export const createUser_Service = async (input: createUserInput) => {
  const CurrentUser = await resolveCurrentUser_Service({clerkUserId: input.ClerkUserId}); 
  if (CurrentUser.authority.role !== "admin"){
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "User is not admin!"
    )
  }
  
  if (input.role !== "resident" && input.role !== "guard"){
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Role must be either 'resident' or 'guard'"
    )
  }

  // TODO: Validate Apartment (if resident), ApartmentService here is READ-ONLY, Check Internal Uniqueness, Identity Provisioning, Transaction Boundary, inside transaction: UserRepository.create({...}) || all from chatgpt chat - after steps of societyBootstarp. 
}