import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js";
import { SaveUser_Repository } from "@/Repository/userRepository/SaveUser.repository.js";

export type RegisterUserInput = {
  clerkUserId: string;
  role: string;
  societyId: string;
  apartmentId?: string;
  email: string;
  fullName: string;
};

export async function RegisterUser_Service(input: RegisterUserInput) {
  const missingFields: string[] = [];

  if (!input.clerkUserId) missingFields.push('clerkUserId');
  if (!input.societyId) missingFields.push('societyId');
  if (!input.role) missingFields.push('role');
  if (!input.email) missingFields.push('email');
  if (!input.fullName) missingFields.push('fullName');
  // apartmentId is required only for residents
  if (input.role === 'resident' && !input.apartmentId) missingFields.push('apartmentId');

  if (missingFields.length > 0) {
    throw new ServiceError(
      'SERVICE_INPUT_INVALID',
      'Required fields missing',
      { missingFields },
    );
  };

  // test of saving a user in db using repository layer.
  const user = await SaveUser_Repository({
    clerkUserId: input.clerkUserId,
    role: input.role,
    societyId: input.societyId,
    apartmentId: input.apartmentId,
    email: input.email,
    fullName: input.fullName,
  });

  console.log("register user service hit:", user);

  // RETURN DOMAIN RESULT
  return user;
}