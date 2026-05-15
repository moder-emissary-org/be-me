import { COMPLAINT_CATEGORIES } from "@/models/Complaint.models.js";
import type { ComplaintCategory } from "@/models/Complaint.models.js";
import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { complaints_Repository } from "@/repository/ComplaintsRepository/Complaints.repository.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import { Types } from "mongoose";

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 5000;

export type CreateComplaintInput = {
  clerkUserId: string;
  title: string;
  description: string;
  category: string;
};

function isComplaintCategory(value: string): value is ComplaintCategory {
  return (COMPLAINT_CATEGORIES as readonly string[]).includes(value);
}

export const createComplaint_Service = async (input: CreateComplaintInput) => {
  const { clerkUserId, title: rawTitle, description: rawDescription, category: rawCategory } =
    input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });

  const role = actor.authority.role;
  const apartmentScope = actor.scope.apartment;

  console.log("authority check details: ", {role, apartmentScope});

  const canCreateComplaint =
    (role === "resident" && apartmentScope !== null) ||
    (role === "admin" && apartmentScope !== null);

  if (!canCreateComplaint) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only residents or admins assigned to an apartment may create complaints",
      { clerkUserId, role }
    );
  }

  const societyId = actor.scope.society.id;
  const apartmentId = apartmentScope!.id;

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const category = typeof rawCategory === "string" ? rawCategory.trim() : "";

  if (!title || title.length > TITLE_MAX) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      `Title is required and must be at most ${TITLE_MAX} characters`,
      { titleLength: title.length }
    );
  }

  if (!description || description.length > DESCRIPTION_MAX) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      `Description is required and must be at most ${DESCRIPTION_MAX} characters`,
      { descriptionLength: description.length }
    );
  }

  if (!isComplaintCategory(category)) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Invalid complaint category",
      { category }
    );
  }

  const complaint = await complaints_Repository.create({
    title,
    description,
    category,
    status: "open",
    societyId,
    apartmentId,
    createdBy: new Types.ObjectId(actor.user.id),
    resolvedBy: null,
    resolvedAt: null,
    adminRemark: null,
  });

  return {
    id: complaint._id.toString(),
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
  };
};
