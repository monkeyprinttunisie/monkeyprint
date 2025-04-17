import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("[Server] Mockup API called");

  try {
    // Parse request body
    const body = await req.json();
    const { designUrl } = body;

    if (!designUrl) {
      console.error("[Server] Missing designUrl in request");
      return NextResponse.json(
        { error: "Design URL is required" },
        { status: 400 }
      );
    }

    console.log("[Server] Design URL:", designUrl.substring(0, 50) + "...");

    // Verify design URL is accessible
    try {
      const designCheck = await fetch(designUrl, { method: "HEAD" });
      console.log("[Server] Design URL check status:", designCheck.status);

      if (!designCheck.ok) {
        return NextResponse.json(
          { error: `Design URL not accessible (${designCheck.status})` },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("[Server] Failed to check design URL:", error);
      return NextResponse.json(
        { error: "Failed to access design URL" },
        { status: 400 }
      );
    }

    // DynamicMockups API configuration
    const mockupUuid = "750498a2-b511-4fcf-a689-51bf0f5465f9";
    const smartObjectUuid = "00318d79-0d42-455a-b3f1-d747a9c76968";
    const apiKey =
      "87c8e240-e5f7-400a-b9df-cbfb2524a70b:954b6c3c919068c33a336ae14848e48a5db2bfd7f41df9dbed31c5d47d2a6286";

    // Prepare request to DynamicMockups
    const requestBody = {
      mockup_uuid: mockupUuid,
      smart_objects: [
        {
          uuid: smartObjectUuid,
          asset: {
            url: designUrl,
          },
        },
      ],
    };

    console.log(
      "[Server] Calling DynamicMockups API with:",
      JSON.stringify(requestBody)
    );

    // Make request to DynamicMockups API
    const response = await fetch(
      "https://app.dynamicmockups.com/api/v1/renders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Get response as text for detailed logging
    const responseText = await response.text();
    console.log("[Server] DynamicMockups response status:", response.status);
    console.log("[Server] DynamicMockups response body:", responseText);

    // Parse response as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.error("[Server] Failed to parse DynamicMockups response:", error);
      return NextResponse.json(
        { error: "Invalid response from DynamicMockups API" },
        { status: 500 }
      );
    }

    // Handle error response
    if (!response.ok) {
      console.error("[Server] DynamicMockups API error:", result);
      return NextResponse.json(
        { error: result.message || "Error from DynamicMockups API" },
        { status: 500 }
      );
    }

    // Handle job-based (asynchronous) rendering
    if (result.job_id) {
      console.log("[Server] Async job started, ID:", result.job_id);

      // Poll for completion
      const maxAttempts = 30;
      let attempts = 0;
      let jobResult = null;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(
          `[Server] Checking job status, attempt ${attempts}/${maxAttempts}`
        );

        // Wait before checking
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check job status
        const statusResponse = await fetch(
          `https://app.dynamicmockups.com/api/v1/renders/${result.job_id}`,
          {
            headers: {
              Accept: "application/json",
              "x-api-key": apiKey,
            },
          }
        );

        const statusText = await statusResponse.text();
        console.log(`[Server] Job status response:`, statusText);

        if (!statusResponse.ok) {
          console.error(`[Server] Error checking job status:`, statusText);
          continue;
        }

        try {
          jobResult = JSON.parse(statusText);
        } catch (error) {
          console.error("[Server] Failed to parse job status response:", error);
          continue;
        }

        // Check if job is complete
        if (jobResult.status === "completed") {
          console.log("[Server] Job completed successfully");
          break;
        }

        // Check if job failed
        if (jobResult.status === "failed") {
          return NextResponse.json(
            {
              error: `Mockup generation failed: ${jobResult.message || "Unknown error"}`,
            },
            { status: 500 }
          );
        }
      }

      // Update result with job result if available
      if (jobResult) {
        result = jobResult;
      } else {
        return NextResponse.json(
          { error: "Timed out waiting for mockup generation" },
          { status: 504 }
        );
      }
    }

    // Extract render URL - check multiple possible locations
    let renderUrl = null;

    if (result.render_url) renderUrl = result.render_url;
    else if (result.data?.render_url) renderUrl = result.data.render_url;
    else if (result.url) renderUrl = result.url;
    else if (result.data?.url) renderUrl = result.data.url;
    else if (result.mockup?.url) renderUrl = result.mockup.url;
    else if (result.data?.mockup?.url) renderUrl = result.data.mockup.url;

    console.log("[Server] Found render URL:", renderUrl);

    // If no render URL found, try to find any URL in the response
    if (!renderUrl) {
      const responseStr = JSON.stringify(result);
      const urlMatch = responseStr.match(
        /"(https:\/\/[^"]+\.(png|jpg|jpeg))"/i
      );

      if (urlMatch && urlMatch[1]) {
        renderUrl = urlMatch[1];
        console.log("[Server] Found URL through regex search:", renderUrl);
      }
    }

    // If still no render URL, return error
    if (!renderUrl) {
      console.error("[Server] No render URL found in response:", result);
      return NextResponse.json(
        { error: "No render URL found in DynamicMockups response" },
        { status: 500 }
      );
    }

    // Return the render URL
    return NextResponse.json({ renderUrl });
  } catch (error) {
    console.error("[Server] Unexpected error in mockup API:", error);
    return NextResponse.json(
      {
        error:
          "Server error: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
