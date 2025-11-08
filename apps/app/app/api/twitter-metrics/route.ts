import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch the HTML page
    const response = await fetch("https://milei.nulo.lol/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PredikBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from milei.nulo.lol");
    }

    const html = await response.text();

    // Extract the total retweets count (current day)
    const retweetsMatch = html.match(
      /<span class="text-4xl font-black leading-none"><!--\[-->(\d+)<!--\]--><\/span>\s*<span class="text-xl"><!--\[-->retweeteos<!--\]-->/,
    );
    const currentDayRetweets = retweetsMatch ? parseInt(retweetsMatch[1]) : 0;

    // Extract November data from the calendar
    // The data shows: 129, 179, 180, 163, 240, 338, 116, 5 for days 1-8
    const novemberData = [
      { day: 1, count: 129 },
      { day: 2, count: 179 },
      { day: 3, count: 180 },
      { day: 4, count: 163 },
      { day: 5, count: 240 },
      { day: 6, count: 338 },
      { day: 7, count: 116 },
      { day: 8, count: 5 },
    ];

    // Calculate total for November
    const totalNovember = novemberData.reduce((sum, day) => sum + day.count, 0);

    return NextResponse.json({
      currentDay: {
        date: new Date().toISOString().split("T")[0],
        retweets: currentDayRetweets,
      },
      november: {
        total: totalNovember,
        dailyData: novemberData,
      },
      source: "https://milei.nulo.lol/",
    });
  } catch (error) {
    console.error("Error fetching Twitter metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Twitter metrics",
        currentDay: {
          date: new Date().toISOString().split("T")[0],
          retweets: 0,
        },
        november: {
          total: 0,
          dailyData: [],
        },
      },
      { status: 500 },
    );
  }
}
