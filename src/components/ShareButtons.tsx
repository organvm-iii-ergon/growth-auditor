"use client";

import { useState, useCallback } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  score?: number;
}

export default function ShareButtons({ url, title, score }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const tweetText = score
    ? `Just scored ${score}/100 on my cosmic growth audit! \u{1F31F} Check it out:`
    : "Check out this cosmic growth audit:";

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1rem",
    background: "var(--glass-bg, rgba(255, 255, 255, 0.05))",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.1))",
    borderRadius: "100px",
    color: "var(--foreground, #fff)",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  };

  return (
    <div
      data-testid="share-buttons"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        justifyContent: "center",
      }}
    >
      <button
        onClick={handleCopy}
        style={buttonStyle}
        aria-label={copied ? "Copied!" : "Copy link"}
        data-testid="copy-link-button"
      >
        <span aria-hidden="true">{copied ? "\u{1F4CB}" : "\u{1F517}"}</span>
        {copied ? "Copied!" : "Copy Link"}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
        aria-label={`Share on Twitter: ${title}`}
        data-testid="twitter-share-button"
      >
        <span aria-hidden="true">{"\u{1D54F}"}</span>
        Share
      </a>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
        aria-label={`Share on LinkedIn: ${title}`}
        data-testid="linkedin-share-button"
      >
        <span aria-hidden="true">in</span>
        Share
      </a>
    </div>
  );
}
