"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: { theme?: string },
        ) => Promise<HTMLElement>;
      };
    };
  }
}

/**
 * Component that loads the Twitter widget script and processes embedded tweets.
 * Automatically matches the current theme (light/dark).
 */
export function TwitterEmbed() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const updateTweetThemes = () => {
      // Update data-theme attribute on all twitter-tweet blockquotes
      const tweets = document.querySelectorAll("blockquote.twitter-tweet");
      tweets.forEach((tweet) => {
        tweet.setAttribute(
          "data-theme",
          resolvedTheme === "dark" ? "dark" : "light",
        );
      });

      // Reload Twitter widgets to apply the new theme
      if (window.twttr?.widgets) {
        window.twttr.widgets.load();
      }
    };

    // Check if Twitter script is already loaded
    if (window.twttr) {
      updateTweetThemes();
      return;
    }

    // Load Twitter widget script
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = updateTweetThemes;
    document.body.appendChild(script);
  }, [resolvedTheme]);

  return null;
}
