//---------------------------------------------------------------------//
//                         Input Validators                            //
//---------------------------------------------------------------------//

// title parse 

export const NOTICE_TITLE_MAX = 120;

export type NoticeTitleValidationError =
  | { code: "NOTICE_TITLE_REQUIRED" }
  | { code: "NOTICE_TITLE_INVALID_TYPE" }
  | { code: "NOTICE_TITLE_EMPTY" }
  | { code: "NOTICE_TITLE_TOO_LONG"; length: number };

export function parseNoticeTitle(
   rawNoticeTitle: unknown
): string | NoticeTitleValidationError {

   if (rawNoticeTitle === undefined) {
      return { code: "NOTICE_TITLE_REQUIRED" };
   }

   if (typeof rawNoticeTitle !== "string") {
      return { code: "NOTICE_TITLE_INVALID_TYPE" };
   }

   const title = rawNoticeTitle.trim();

   if (title.length === 0) {
      return { code: "NOTICE_TITLE_EMPTY" };
   }

   if (title.length > NOTICE_TITLE_MAX) {
      return {
         code: "NOTICE_TITLE_TOO_LONG",
         length: title.length,
      };
   }

   return title;
}

// notice parse 

export const NOTICE_CONTENT_MAX = 500;

export type NoticeContentValidationError =
  | { code: "NOTICE_CONTENT_REQUIRED" }
  | { code: "NOTICE_CONTENT_INVALID_TYPE" }
  | { code: "NOTICE_CONTENT_EMPTY" }
  | { code: "NOTICE_CONTENT_TOO_LONG"; length: number };

export function parseNoticeContent(
  rawNoticeContent: unknown
): string | NoticeContentValidationError {

  if (rawNoticeContent === undefined) {
    return { code: "NOTICE_CONTENT_REQUIRED" };
  }

  if (typeof rawNoticeContent !== "string") {
    return { code: "NOTICE_CONTENT_INVALID_TYPE" };
  }

  const content = rawNoticeContent.trim();

  if (content.length === 0) {
    return { code: "NOTICE_CONTENT_EMPTY" };
  }

  if (content.length > NOTICE_CONTENT_MAX) {
    return {
      code: "NOTICE_CONTENT_TOO_LONG",
      length: content.length,
    };
  }

  return content;
}