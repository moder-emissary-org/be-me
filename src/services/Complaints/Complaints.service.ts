import { COMPLAINT_CATEGORIES } from "@/models/Complaint.models.js";
import type {
  ComplaintCategory,
  ComplaintStatus,
} from "@/models/Complaint.models.js";
import {
  ADMIN_REMARK_MAX,
  canTransitionStatus,
  parseAdminRemark,
  parseAdminSettableStatus,
} from "./policies/complaintStatus.policy.js";
import type { UpdateComplaintStatusInput, UpdateComplaintStatusRepositoryInput } from "./Types/Complaints.types.js";
import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import {
  complaints_Repository
} from "@/repository/ComplaintsRepository/Complaints.repository.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import { Types } from "mongoose";

//---------------------------------------------------------------------//
//                            create service                           //
//---------------------------------------------------------------------//

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
  const {
    clerkUserId,
    title: rawTitle,
    description: rawDescription,
    category: rawCategory,
  } = input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });

  const role = actor.authority.role;
  const apartmentScope = actor.scope.apartment;

  const canCreateComplaint =
    (role === "resident" && apartmentScope !== null) ||
    (role === "admin" && apartmentScope !== null);

  if (!canCreateComplaint) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only residents or admins assigned to an apartment may create complaints",
      { clerkUserId, role },
    );
  }

  const societyId = actor.scope.society.id;
  const apartmentId = apartmentScope!.id;

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const description =
    typeof rawDescription === "string" ? rawDescription.trim() : "";
  const category = typeof rawCategory === "string" ? rawCategory.trim() : "";

  if (!title || title.length > TITLE_MAX) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      `Title is required and must be at most ${TITLE_MAX} characters`,
      { titleLength: title.length },
    );
  }

  if (!description || description.length > DESCRIPTION_MAX) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      `Description is required and must be at most ${DESCRIPTION_MAX} characters`,
      { descriptionLength: description.length },
    );
  }

  if (!isComplaintCategory(category)) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Invalid complaint category",
      { category },
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

//---------------------------------------------------------------------//
//                    update complaint status service                  //
//---------------------------------------------------------------------//

export type { UpdateComplaintStatusInput } from "./Types/Complaints.types.js";

export const updateComplaintStatus_Service = async (
  input: UpdateComplaintStatusInput,
) => {
  const {
    clerkUserId,
    complaintId: rawComplaintId,
    status: rawStatus,
    adminRemark: rawAdminRemark,
  } = input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });

  if (actor.authority.role !== "admin") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only admins may update complaint lifecycle status",
      { clerkUserId, role: actor.authority.role },
    );
  }

  if (!actor.user.isActive) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Inactive admin cannot update complaint status",
      { clerkUserId },
    );
  }

  if (!Types.ObjectId.isValid(rawComplaintId)) {
    throw new ServiceError("SERVICE_INPUT_INVALID", "Invalid complaint ID", {
      complaintId: rawComplaintId,
    });
  }

  const complaintId = new Types.ObjectId(rawComplaintId);

  const complaint = await complaints_Repository.findById(complaintId);

  if (!complaint) {
    throw new ServiceError("COMPLAINT_NOT_FOUND", "Complaint not found", {
      complaintId: rawComplaintId,
    });
  }

  if (!complaint.societyId.equals(actor.scope.society.id)) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Complaint does not belong to this admin's society",
      { complaintId: rawComplaintId, societyId: actor.scope.society.id },
    );
  }

  const status = parseAdminSettableStatus(rawStatus);
  if (!status) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "Status must be one of: in_progress, resolved, rejected",
      { status: rawStatus },
    );
  }

  const currentStatus = complaint.status as ComplaintStatus;

  if (!canTransitionStatus(currentStatus, status)) {
    throw new ServiceError(
      "INVALID_COMPLAINT_STATUS_TRANSITION",
      "Complaint status transition is not allowed",
      {
        complaintId: rawComplaintId,
        currentStatus,
        requestedStatus: status,
      },
    );
  }

  const parsedRemark = parseAdminRemark(rawAdminRemark);
  if ("code" in parsedRemark) {
    if (parsedRemark.code === "ADMIN_REMARK_EMPTY") {
      throw new ServiceError(
        "SERVICE_INPUT_INVALID",
        "Admin remark cannot be empty when provided",
        { complaintId: rawComplaintId },
      );
    }
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      `Admin remark must be at most ${ADMIN_REMARK_MAX} characters`,
      { remarkLength: parsedRemark.remarkLength },
    );
  }

  const { adminRemark } = parsedRemark;

  const repoPayload: UpdateComplaintStatusRepositoryInput = {
    complaintId,
    status,
    ...(adminRemark !== undefined ? { adminRemark } : {}),
  };

  if (status === "resolved") {
    repoPayload.resolvedBy = new Types.ObjectId(actor.user.id);
    repoPayload.resolvedAt = new Date();
  }

  const updatedComplaint =
    await complaints_Repository.updateStatus(repoPayload);

  if (!updatedComplaint) {
    throw new ServiceError(
      "OPERATION_FAILED",
      "Failed to update complaint status",
      { complaintId: rawComplaintId },
    );
  }

  const result = {
    id: updatedComplaint._id.toString(),
    status: updatedComplaint.status,
    adminRemark: updatedComplaint.adminRemark ?? null,
    resolvedBy: updatedComplaint.resolvedBy,
    resolvedAt: updatedComplaint.resolvedAt ?? null,
  };

  return result;
};

//---------------------------------------------------------------------//
//                       list complaints service                       //
//---------------------------------------------------------------------//

export type listComplaintsServiceInput = {
  clerkUserId: string;
  rawCursor: string | undefined;
};

export const getComplaints_Service = async (
  input: listComplaintsServiceInput,
) => {
  const { clerkUserId, rawCursor } = input;
  const cursor =
    typeof rawCursor === "string" && rawCursor.trim() !== ""
      ? rawCursor.trim()
      : undefined;

  const actor = await resolveCurrentUser_Service({ clerkUserId });

  if (actor.authority.role !== "admin") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only admins may access society complaints",
      { clerkUserId, role: actor.authority.role },
    );
  }

  if (!actor.user.isActive) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Inactive admin cannot access society complaints",
      { clerkUserId },
    );
  }

  const societyId = actor.scope.society.id;

  const complaints = await complaints_Repository.findComplaintsBySocietyId(
    societyId,
    cursor,
  );

  return complaints;
};

//---------------------------------------------------------------------//
//                       getComplaintsByApartment service              //
//---------------------------------------------------------------------//

export type getComplaintsByApartmentInput = {
  clerkUserId: string;
  rawCursor: string | undefined;
};

export const getComplaintsByApartment_Service = async (
  input: getComplaintsByApartmentInput,
) => {
  const { clerkUserId, rawCursor } = input;
  const actor = await resolveCurrentUser_Service({ clerkUserId });

  const role = actor.authority.role;
  const apartmentScope = actor.scope.apartment;

  if (!apartmentScope) {
    throw new ServiceError(
      "APARTMENT_SCOPE_INVALID",
      "Apartment scope invalid, the actor might not have apartment.",
      { role, apartmentScope },
    );
  }

  const canGetComplaints =
    (role === "resident" && apartmentScope !== null && actor.user.isActive) ||
    (role === "admin" && apartmentScope !== null && actor.user.isActive);

  if (!canGetComplaints) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only residents or admins assigned to an apartment may view complaints",
      { clerkUserId, role },
    );
  }

  const cursor =
    typeof rawCursor === "string" && rawCursor.trim() !== ""
      ? rawCursor.trim()
      : undefined;
  const apartmentId = apartmentScope.id;

  const complaints = await complaints_Repository.findComplaintsByApartmentId(
    apartmentId,
    cursor,
  );
  return complaints;
};
