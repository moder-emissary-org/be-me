import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { saveUser_Repository } from "@/repository/UserRepository/SaveUser.repository.js";
import type { Types } from "mongoose";

export type RegisterUserInput = {
  clerkUserId: string;
  role: 'resident' | 'guard';
  societyId: Types.ObjectId;
  apartmentId?: Types.ObjectId | null;
  email: string;
  fullName: string;
  isActive: boolean;
};
 
export async function bootstrapUser_Service(input: RegisterUserInput) {
  const missingFields: string[] = [];

  if (!input.clerkUserId) missingFields.push('clerkUserId');
  if (!input.societyId) missingFields.push('societyId');
  if (!input.role) missingFields.push('role');
  if (!input.email) missingFields.push('email');
  if (!input.fullName) missingFields.push('fullName');
  if (input.role === 'resident' && !input.apartmentId) missingFields.push('apartmentId'); 
  // apartmentId is required only for residents

  if (missingFields.length > 0) {
    throw new ServiceError(
      'SERVICE_INPUT_INVALID',
      'Required fields missing',
      { missingFields },
    );
  };

  // test of saving a normal user in db using repository layer.
  const user = await saveUser_Repository.createNormalUser({
    clerkUserId: input.clerkUserId,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    societyId: input.societyId,
    apartmentId: typeof input.apartmentId === "undefined" ? null : input.apartmentId,
    isActive: input.isActive,
  });
  return user;
}