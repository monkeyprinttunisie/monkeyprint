import { NextRequest, NextResponse } from "next/server";

// Define mockup UUIDs by target category
const MOCKUPS = {
  // Mockups for both Male and Female
  maleAndFemale: [
    {
      //ok
      mockupUuid: "55c77d31-3bab-40c5-a237-52b5a496679d",
      smartObjectUuid: "eb214d2f-08fa-4dec-b101-8a4e913d1b9a",
    },
    {
      mockupUuid: "615b1f9a-471a-48e0-b9ee-36ae1454c2dc",
      smartObjectUuid: "2fece0c8-bf09-4510-875c-953e6de3729f",
    },
  ],

  // Mockups for Male only
  male: [
    {
      //ok
      mockupUuid: "1058c574-9a2c-408c-bfa6-1156b25d480d",
      smartObjectUuid: "f5aa819c-1d59-4a4a-926e-e05366f16f0d",
    },
    {
      //ok
      mockupUuid: "cb1f4ac4-a99f-4041-9e73-ca8d499f7739",
      smartObjectUuid: "d2aacff6-dbfd-4165-b2ba-5ff5c203c7ed",
    },
    {
      //very good
      mockupUuid: "5368192d-6525-48c4-a528-fd6f588e6956",
      smartObjectUuid: "9dcadae9-c192-446d-a91f-2dea2475b332",
    },
    {
      //ok
      mockupUuid: "75867c72-e7e3-487b-bad5-a2cd5a12ff77",
      smartObjectUuid: "ced3b1fd-6bbf-4a1b-87e9-12250dfe8d29",
    },
  ],

  // Mockups for Female only
  female: [
    {
      //ok
      mockupUuid: "eac8b4a7-ab45-45e0-a80b-a12d0a25f6d5",
      smartObjectUuid: "bdb0e98d-6795-4e48-8a04-00b890c155a0",
    },
    {
      //ok
      mockupUuid: "503a43d3-a763-420b-9480-f546b10cb0a3",
      smartObjectUuid: "df95819d-d5ea-4cce-a18c-b1e38bcf1ba9",
    },
    {
      //ok
      mockupUuid: "916eddc7-d7b2-477b-99b0-c6bee86148df",
      smartObjectUuid: "67d430a3-2a71-4b41-9aa3-c0915059ef79",
    },
    {
      //ok
      mockupUuid: "754441d1-d790-4c99-8501-8803ba6a7f84",
      smartObjectUuid: "f10f3bae-8421-44dd-b7f6-2aec65d3e0d1",
    },
    {
      //ok-small
      mockupUuid: "d2c35966-c989-47d5-b58a-2209f5e4d47e",
      smartObjectUuid: "bcd8b9b1-2337-40fd-bd1c-2ccbffa256e5",
    },
    {
      //ok
      mockupUuid: "034eea37-5b08-4da4-9ed8-859b73942c80",
      smartObjectUuid: "803ce756-5590-4985-b6f5-0ffad797ceea",
    },
    {
      //ok
      mockupUuid: "9bdc5631-065f-4b55-a860-44f31e44a888",
      smartObjectUuid: "e0fa5070-812c-4791-ba6b-18199fcc86be",
    },
    {
      //good
      mockupUuid: "7ca1f77c-3383-43f0-a6a6-b0723d66451d",
      smartObjectUuid: "5a406322-f89b-4666-9948-675ed6b5f12d",
    },
  ],

  // Mockups for Kids
  kids: [
    {
      //ok
      mockupUuid: "2eaeccac-71b7-4caf-99e2-ed148e3bd686",
      smartObjectUuid: "7e040a57-31b6-4985-8ba3-c1a75afd153c",
    },
    {
      //ok
      mockupUuid: "a8cf8c57-77f7-4b11-bb1b-7fed3fb70cb4",
      smartObjectUuid: "10d20e5e-b2b1-40ac-baad-7f6d4d54d235",
    },
    {
      //ok
      mockupUuid: "21130d23-5463-463c-9536-b65eef580323",
      smartObjectUuid: "9707e0b9-e1dc-4b4c-a73c-4de14d9c3365",
    },
    {
      //ok
      mockupUuid: "ef1d888f-9e80-48bd-b097-960e9405f373",
      smartObjectUuid: "904dc5af-953b-4ec2-8de2-d5c9c02ebbb7",
    },
    {
      //ok
      mockupUuid: "63a93f38-f4d4-481b-88d8-f0dd910d2ed7",
      smartObjectUuid: "3758e279-59c1-44ae-85bd-1572815bbb90",
    },
  ],
};

// Helper function to select a random mockup based on target categories
function selectMockupByTargetCategories(targetCategories: string[]): {
  mockupUuid: string;
  smartObjectUuid: string;
} {
  console.log("[Server] Target category names:", targetCategories);

  // Convert all incoming names to lowercase for case-insensitive matching
  const lowerCaseCategories = targetCategories.map((cat) => cat.toLowerCase());

  // Simple direct matching
  const hasMale = lowerCaseCategories.some(
    (cat) => cat === "male" || cat === "men" || cat === "man"
  );

  const hasFemale = lowerCaseCategories.some(
    (cat) => cat === "female" || cat === "women" || cat === "woman"
  );

  const hasKids = lowerCaseCategories.some(
    (cat) =>
      cat === "kids" ||
      cat === "kid" ||
      cat === "children" ||
      cat === "child" ||
      cat === "youth"
  );

  console.log("[Server] Category detection:", { hasMale, hasFemale, hasKids });

  let selectedMockups;

  if (hasMale && hasFemale) {
    console.log("[Server] Using mockups for both male and female");
    selectedMockups = MOCKUPS.maleAndFemale;
  } else if (hasMale) {
    console.log("[Server] Using mockups for male");
    selectedMockups = MOCKUPS.male;
  } else if (hasFemale) {
    console.log("[Server] Using mockups for female");
    selectedMockups = MOCKUPS.female;
  } else if (hasKids) {
    console.log("[Server] Using mockups for kids");
    selectedMockups = MOCKUPS.kids;
  } else {
    // Default fallback if we can't determine category
    console.log(
      "[Server] No specific category matched, defaulting to maleAndFemale"
    );
    selectedMockups = MOCKUPS.maleAndFemale;
  }

  // Select a random mockup
  const randomIndex = Math.floor(Math.random() * selectedMockups.length);
  return selectedMockups[randomIndex];
}

export async function POST(req: NextRequest) {
  console.log("[Server] Mockup API called");

  try {
    // Parse request body
    const body = await req.json();
    const { designUrl, targetCategories = [] } = body;

    if (!designUrl) {
      console.error("[Server] Missing designUrl in request");
      return NextResponse.json(
        { error: "Design URL is required" },
        { status: 400 }
      );
    }

    console.log("[Server] Design URL:", designUrl.substring(0, 50) + "...");
    console.log("[Server] Target Categories:", targetCategories);

    // Select mockup based on target categories
    const { mockupUuid, smartObjectUuid } =
      selectMockupByTargetCategories(targetCategories);
    console.log("[Server] Selected mockup:", { mockupUuid, smartObjectUuid });

    // If no mockup could be selected, use the default one
    const apiKey =
      "943f0bc3-4915-4ba0-8b7f-da12dfae57de:6bb8a4cff5fc7b344c2b3a39be99cc320d398e096ba2be53d131950e93c00813";

    // Prepare request to DynamicMockups
    const requestBody = {
      mockup_uuid: mockupUuid,
      smart_objects: [
        {
          uuid: smartObjectUuid,
          asset: {
            url: designUrl,
            fit: "contain",
          },
          color: "#444ABF",
        },
      ],
      options: {
        quality: "high",
      },
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
