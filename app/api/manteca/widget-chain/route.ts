import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userExternalId = searchParams.get("userExternalId");
    const walletAddress = searchParams.get("walletAddress");
    const finalReturnUrl = searchParams.get("finalReturnUrl");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    // Log the onboarding completion
    console.log("Onboarding widget completed", {
      userExternalId,
      userId,
      status,
      walletAddress,
    });

    // Check if onboarding was successful
    if (status !== "COMPLETED" && status !== "ALREADY_EXISTS") {
      // Onboarding failed, redirect back with error
      const errorUrl = new URL(finalReturnUrl || "/");
      errorUrl.searchParams.set("manteca_status", "onboarding_failed");
      errorUrl.searchParams.set("manteca_error", status || "unknown");
      return NextResponse.redirect(errorUrl);
    }

    // Generate operation widget URL for the now-onboarded user
    const operationResponse = await fetch(
      `${process.env.MANTECA_BASE_URL}/widgets/operation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "md-api-key": process.env.MANTECA_API_KEY!,
        },
        body: JSON.stringify({
          externalId: userExternalId,
          returnUrl: finalReturnUrl,
          failureUrl: finalReturnUrl,
          operation: {
            type: "RAMP_OPERATION",
            side: "BUY",
            asset: "USDT",
            against: "ARS",
            minAmount: "100",
            maxAmount: "500000",
            withdrawNetwork: "BSC", // BNB Smart Chain for Dynamic compatibility
            withdrawAddress: walletAddress,
          },
        }),
      },
    );

    if (!operationResponse.ok) {
      const errorText = await operationResponse.text();
      console.error(
        "Failed to generate operation widget after onboarding:",
        errorText,
      );

      const errorUrl = new URL(finalReturnUrl || "/");
      errorUrl.searchParams.set("manteca_status", "operation_widget_failed");
      return NextResponse.redirect(errorUrl);
    }

    const operationData = await operationResponse.json();

    // Redirect user to the operation widget
    return NextResponse.redirect(operationData.url);
  } catch (error) {
    console.error("Widget chain error:", error);

    const finalReturnUrl = request.nextUrl.searchParams.get("finalReturnUrl");
    const errorUrl = new URL(finalReturnUrl || "/");
    errorUrl.searchParams.set("manteca_status", "chain_error");
    return NextResponse.redirect(errorUrl);
  }
}
