import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import type {
  CreateNoticeServiceInput,
  getNoticesServicesInput,
} from "./Types/Notices.types.js";
import {
  NOTICE_CONTENT_MAX,
  NOTICE_TITLE_MAX,
  parseNoticeContent,
  parseNoticeTitle,
} from "./Policies/Notices.policies.js";
import { noticesRepository } from "@/repository/NoticesRepository/Notice.repository.js";
import { Types } from "mongoose";

//---------------------------------------------------------------------//
//                     create Notice service                           //
//---------------------------------------------------------------------//

export const createNotice_Service = async (input: CreateNoticeServiceInput) => {
  const {
    clerkUserId,
    title: rawNoticeTitle,
    content: rawNoticeContent,
  } = input;
  const actor = await resolveCurrentUser_Service({ clerkUserId });
  if (!actor.user.isActive) {
    throw new ServiceError(
      "USER_INACTIVE",
      "Inactive user cannot fetch visitors",
      { clerkUserId },
    );
  }
  if (actor.authority.role !== "admin") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only admins can access create notice service.",
      { clerkUserId },
    );
  }

  const societyId = actor.scope.society.id;
  const createdBy = new Types.ObjectId(actor.user.id);

  const parsedTitle = parseNoticeTitle(rawNoticeTitle);
  if (typeof parsedTitle !== "string") {
    switch (parsedTitle.code) {
      case "NOTICE_TITLE_REQUIRED":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice title is required",
        );

      case "NOTICE_TITLE_EMPTY":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice title cannot be empty",
        );

      case "NOTICE_TITLE_TOO_LONG":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          `Notice title must be at most ${NOTICE_TITLE_MAX} characters`,
          { noticeContentLength: parsedTitle.length },
        );

      case "NOTICE_TITLE_INVALID_TYPE":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice title must be a string",
        );

      default: {
        const exhaustiveCheck: never = parsedTitle;
        throw new Error(`Unhandled validation error: ${exhaustiveCheck}`);
      }
    }
  }

  const parsedContent = parseNoticeContent(rawNoticeContent);
  if (typeof parsedContent !== "string") {
    switch (parsedContent.code) {
      case "NOTICE_CONTENT_REQUIRED":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice content is required",
        );

      case "NOTICE_CONTENT_EMPTY":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice content cannot be empty",
        );

      case "NOTICE_CONTENT_TOO_LONG":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          `Notice content must be at most ${NOTICE_CONTENT_MAX} characters`,
          { noticeContentLength: parsedContent.length },
        );

      case "NOTICE_CONTENT_INVALID_TYPE":
        throw new ServiceError(
          "SERVICE_INPUT_INVALID",
          "Notice content must be a string",
        );

      default: {
        const exhaustiveCheck: never = parsedContent;
        throw new Error(`Unhandled validation error: ${exhaustiveCheck}`);
      }
    }
  }

  const repoPayload = {
    title: parsedTitle,
    content: parsedContent,
    createdBy,
    societyId,
    isArchived: false,
  };

  const createdNotice = await noticesRepository.create(repoPayload);

  if (!createdNotice) {
    throw new ServiceError("OPERATION_FAILED", "Failed to create notice", {
      societyId: societyId,
      clerkUserId,
    });
  }

  return createdNotice;
};

//---------------------------------------------------------------------//
//                       get Notices service                           //
//---------------------------------------------------------------------//

export const getNotices_Service = async (input: getNoticesServicesInput) => {
  const { clerkUserId, cursor: rawCursor } = input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });
  if (!actor.user.isActive || actor.authority.role !== "admin") {
    const errCode = !actor.user.isActive
      ? "USER_INACTIVE"
      : "OPERATION_NOT_ALLOWED";
    const errMessage = !actor.user.isActive
      ? "Inactive user cannot fetch visitors"
      : "Only admins can access create notice service.";
    throw new ServiceError(errCode, errMessage, { clerkUserId });
  }

  const cursor =
    typeof rawCursor === "string" && rawCursor.trim() !== ""
      ? rawCursor.trim()
      : undefined;

  const societyId = actor.scope.society.id;

  const Notices = await noticesRepository.getNoticesBySocietyId(
    societyId,
    cursor,
  );

  return Notices;
};
