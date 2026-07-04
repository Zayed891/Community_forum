import { handleSaveAction } from "@/lib/handle-save-action";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  return handleSaveAction(request, (await params).postId, "save");
}
