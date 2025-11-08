import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userExternalId,
      userEmail,
      returnUrl,
      walletAddress,
      widgetType = "chained",
    } = body;

    if (!userExternalId || !returnUrl || !walletAddress) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userExternalId, returnUrl, walletAddress",
        },
        { status: 400 },
      );
    }

    let widgetUrl;

    if (widgetType === "chained") {
      // Generate chained widget: Onboarding → Operation
      // This will automatically skip onboarding if user exists and go straight to operation
      const onboardingResponse = await fetch(
        `${process.env.MANTECA_BASE_URL}/widgets/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "md-api-key": process.env.MANTECA_API_KEY!,
          },
          body: JSON.stringify({
            userExternalId: userExternalId,
            options: {
              email: userEmail,
              exchange: "ARGENTINA", // For ARS operations
              returnUrl: `${
                process.env.NEXT_PUBLIC_BASE_URL
              }/api/manteca/widget-chain?userExternalId=${userExternalId}&walletAddress=${walletAddress}&finalReturnUrl=${encodeURIComponent(
                returnUrl,
              )}`,
              failureUrl: returnUrl,
            },
          }),
        },
      );

      if (!onboardingResponse.ok) {
        const errorText = await onboardingResponse.text();
        console.error("Manteca Onboarding Widget API error:", errorText);
        return NextResponse.json(
          { error: "Failed to generate onboarding widget URL" },
          { status: onboardingResponse.status },
        );
      }

      const onboardingData = await onboardingResponse.json();
      widgetUrl = onboardingData.url;
    } else if (widgetType === "operation-only") {
      // Generate operation widget only (for existing users)
      const operationResponse = await fetch(
        `${process.env.MANTECA_BASE_URL}/widgets/operation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "md-api-key": process.env.MANTECA_API_KEY!,
          },
          body: JSON.stringify({
            userExternalId: userExternalId,
            options: {
              returnUrl,
              failureUrl: returnUrl,
              operation: {
                type: "RAMP_OPERATION",
                side: "BUY",
                asset: "USDT",
                against: "ARS",
                minAmount: "100",
                maxAmount: "500000",
                withdrawNetwork: "BSC", // BNB Smart Chain for USDT delivery
                withdrawAddress: walletAddress,
              },
            },
          }),
        },
      );

      if (!operationResponse.ok) {
        const errorText = await operationResponse.text();
        console.error("Manteca Operation Widget API error:", errorText);
        return NextResponse.json(
          { error: "Failed to generate operation widget URL" },
          { status: operationResponse.status },
        );
      }

      const operationData = await operationResponse.json();
      widgetUrl = operationData.url;
    }

    return NextResponse.json({ widgetUrl });
  } catch (error) {
    console.error("Widget generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
