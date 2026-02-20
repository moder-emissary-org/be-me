import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js";
import { SaveUser_Repository } from "@/Repository/userRepository/SaveUser.repository.js";

export type RegisterUserInput = {
  clerkUserId: string;
  role: string;
  societyId: string;
  apartmentId?: string;
  email: string;
  fullName: string;
  isActive: boolean;
};

export async function RegisterUser_Service(input: RegisterUserInput) {

  console.log("RegisterUser_Service called with input:", input);

  const missingFields: string[] = [];

  if (!input.clerkUserId) missingFields.push('clerkUserId');
  if (!input.societyId) missingFields.push('societyId');
  if (!input.role) missingFields.push('role');
  if (!input.email) missingFields.push('email');
  if (!input.fullName) missingFields.push('fullName');
  if (input.role === 'resident' && !input.apartmentId) missingFields.push('apartmentId'); // apartmentId is required only for residents

  if (missingFields.length > 0) {
    throw new ServiceError(
      'SERVICE_INPUT_INVALID',
      'Required fields missing',
      { missingFields },
    );
  };

  // Role check 
  /** 
  if (input.role === 'admin') {
    throw new ServiceError(
      'ROLE_CONSTRAINT_VIOLATION',
      'Only Admins can create the other users',
      {missingFields}
    ) 
  }
  */

  // test of saving a user in db using repository layer.
  const user = await SaveUser_Repository({
    clerkUserId: input.clerkUserId,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    societyId: input.societyId,
    apartmentId: input.apartmentId,
    isActive: input.isActive,
  });

  console.log("register user service end with:", user);

  // RETURN DOMAIN RESULT
  return user;
}