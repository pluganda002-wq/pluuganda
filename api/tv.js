import { getTvProgramsResponse } from "../server/lib/tvPrograms.js";
import { getTvCommentsResponse, postTvCommentResponse } from "../server/lib/tvComments.js";

/** Combined PLU TV API (programs + comments) — single serverless function. */
export async function GET(request) {
  const programId = new URL(request.url).searchParams.get("programId")?.trim();
  if (programId) {
    return getTvCommentsResponse(programId);
  }
  return getTvProgramsResponse();
}

export async function POST(request) {
  return postTvCommentResponse(request);
}