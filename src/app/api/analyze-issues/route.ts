// app/api/analyze-issues/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the interface for categorized issues
interface CategorizedIssue {
  category: string;
  count: number;
  description: string;
  status: string;
  id: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { userId, incidents } = await req.json();
    
    if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
      return NextResponse.json({ 
        categorizedIssues: [] 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI assistant for a telecom customer service platform. Analyze the following support incidents for a customer and categorize them based on similarity.

      Customer incidents: ${JSON.stringify(incidents)}

      Instructions:
      1. Group these incidents into up to 5 categories based on similarity of issue type
      2. For each category:
         - Provide a concise category name (e.g., "Billing", "Network", "Hardware")
         - Count how many incidents fall into this category
         - Select the most representative/recent incident details for this category
      3. Sort the categories by count in descending order (highest count first)

      Return ONLY a valid JSON array with exactly this structure:
      [
        {
          "category": "Category Name",
          "count": number_of_incidents,
          "description": "Representative issue description",
          "status": "Issue status",
          "id": "ID of the representative issue"
        },
        ...
      ]

      IMPORTANT: 
      - Respond with the raw JSON array only. No markdown formatting, code blocks, backticks, or explanations.
      - Sort the array by count in descending order so categories with the most incidents appear first.
    `;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    // Clean up the response to handle potential code block formatting
    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Parse the JSON response
    try {
      let categorizedIssues = JSON.parse(cleanedResponse) as CategorizedIssue[];
      
      // Double-check the sorting on our end (in case Gemini doesn't sort correctly)
      categorizedIssues = categorizedIssues.sort(
        (a: CategorizedIssue, b: CategorizedIssue) => b.count - a.count
      );
      
      return NextResponse.json({ categorizedIssues });
    } catch (error) {
      console.error("Failed to parse Gemini response:", responseText);
      console.error("Cleaned response:", cleanedResponse);
      return NextResponse.json({ 
        error: "Failed to parse categorization results", 
        categorizedIssues: [] 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ 
      error: "Something went wrong", 
      categorizedIssues: [] 
    }, { status: 500 });
  }
}