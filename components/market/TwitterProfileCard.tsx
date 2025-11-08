"use client";

import { useState } from "react";
import Image from "next/image";
import { TwitterIcon } from "lucide-react";
import CountUp from "react-countup";
import { haptics } from "@/lib/haptics";

interface TwitterProfileCardProps {
  displayName: string;
  username: string;
  bio?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  tweetCount: number;
  novemberTweets?: number;
  followers?: number;
  following?: number;
  verified?: boolean;
  twitterUrl?: string;
}

// Format number like Twitter does (6.4M, 198, 8.5K)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function TwitterProfileCard({
  displayName,
  username,
  bio,
  profileImageUrl = "/profiles/default-avatar.png",
  bannerImageUrl,
  tweetCount,
  novemberTweets = 0,
  followers = 0,
  following = 0,
  verified = false,
  twitterUrl,
}: TwitterProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    haptics.selection();
    if (twitterUrl) {
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    } else {
      setIsFollowing(!isFollowing);
    }
  };

  return (
    <div className="w-full h-fit border-b border-border">
      {/* Banner and Profile Container - 200px height like Twitter */}
      <div className="w-full relative" style={{ height: "200px" }}>
        {/* Banner Image - 200px */}
        <div
          className="w-full bg-gradient-to-br from-electric-purple/20 to-blue-500/20 relative overflow-hidden"
          style={{ height: "200px" }}
        >
          {bannerImageUrl && (
            <img
              src={bannerImageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Picture - 133x133, overlaps banner */}
        <div
          className="absolute left-4 rounded-full border-4 border-background bg-background overflow-hidden"
          style={{ width: "133px", height: "133px", bottom: "-66px" }}
        >
          <img
            src={profileImageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Follow Button - Right side, aligned with bottom of profile pic */}
        <div className="absolute right-4" style={{ bottom: "-50px" }}>
          <div
            className={`px-4 rounded-full font-bold hover:cursor-pointer transition-all ${
              isFollowing
                ? "border border-muted-foreground text-foreground hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
            style={{
              fontSize: "15px",
              height: "36px",
              display: "flex",
              alignItems: "center",
            }}
            onClick={handleFollowClick}
          >
            {isFollowing ? "Siguiendo" : "Seguir"}
          </div>
        </div>
      </div>

      {/* Profile Info Section - Starts after profile pic overlap */}
      <div
        className="w-full h-full px-4 flex flex-col lg:flex-row"
        style={{ marginTop: "70px" }}
      >
        {/* LEFT: Profile Info - 70% width on desktop, full width on mobile */}
        <div className="w-full lg:w-[70%] flex flex-col lg:pr-8">
          {/* Name & Username */}
          <div className="w-full mb-2 flex flex-col">
            <div className="font-bold text-xl w-fit flex items-center gap-1">
              <span>{displayName}</span>
              {verified && (
                <svg
                  viewBox="0 0 22 22"
                  aria-label="Verified"
                  className="w-5 h-5 text-gray-500 fill-current"
                >
                  <g>
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                  </g>
                </svg>
              )}
            </div>
            <div className="text-muted-foreground w-fit">
              <p>@{username}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="flex w-full h-fit gap-3 flex-col mb-3">
            {bio && <div className="text-foreground">{bio}</div>}

            {/* Location and Join Date */}
            <div
              className="flex items-center gap-3 text-muted-foreground"
              style={{ fontSize: "15px" }}
            >
              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="currentColor"
                >
                  <g>
                    <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path>
                  </g>
                </svg>
                <span>Buenos Aires, Argentina</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="currentColor"
                >
                  <g>
                    <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path>
                  </g>
                </svg>
                <span>Se unió en octubre de 2015</span>
              </div>
            </div>

            {/* Followers and Following */}
            <div className="h-fit w-full flex items-center gap-4 text-sm">
              {/* Following */}
              <div className="flex text-muted-foreground hover:underline cursor-pointer">
                <p>
                  <span className="font-bold text-foreground">
                    {formatNumber(following)}
                  </span>{" "}
                  Siguiendo
                </p>
              </div>

              {/* Followers */}
              <div className="flex text-muted-foreground hover:underline cursor-pointer">
                <p>
                  <span className="font-bold text-foreground">
                    {formatNumber(followers)}
                  </span>{" "}
                  Seguidores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Tweet Counter - 30% width on desktop, banner style on mobile */}
        <div className="w-full lg:w-[30%] flex flex-col lg:items-center lg:justify-center lg:pl-8 mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0">
          {/* Desktop: Vertical Stack */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                En vivo
              </span>
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">
              <CountUp end={novemberTweets} duration={2} />
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Tweets durante
              <br />
              noviembre
            </div>
          </div>

          {/* Mobile: Horizontal Banner */}
          <div className="flex lg:hidden items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  En vivo
                </span>
                <span className="text-sm text-muted-foreground">
                  Tweets durante noviembre
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              <CountUp end={novemberTweets} duration={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
