import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");
  const syntheticId = searchParams.get("syntheticId");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const asset = searchParams.get("asset");

  // Log the callback for debugging
  console.log("Manteca callback received:", {
    status,
    userId,
    syntheticId,
    orderId,
    amount,
    asset,
  });

  // Determine success or failure
  const isSuccess = status === "completed" || (!status && syntheticId);
  const isFailed = status === "failed" || status === "cancelled";

  // Redirect back to the app with results
  const redirectUrl = new URL("/", request.url);

  if (isSuccess) {
    redirectUrl.searchParams.set("manteca_status", "success");
    redirectUrl.searchParams.set(
      "manteca_message",
      "Compra completada exitosamente",
    );
    if (amount && asset) {
      redirectUrl.searchParams.set("manteca_amount", amount);
      redirectUrl.searchParams.set("manteca_asset", asset);
    }
  } else if (isFailed) {
    redirectUrl.searchParams.set("manteca_status", "failed");
    redirectUrl.searchParams.set(
      "manteca_message",
      "La compra fue cancelada o falló",
    );
  } else {
    redirectUrl.searchParams.set("manteca_status", "unknown");
    redirectUrl.searchParams.set("manteca_message", "Estado desconocido");
  }

  // Redirect to homepage with status
  return NextResponse.redirect(redirectUrl);
}
