import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../constants";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface SyncedCaptionProps {
  /** Word-level timestamps from ElevenLabs */
  words: WordTiming[];
  /** Max chars per line before wrapping to show only a "window" */
  maxCharsPerLine?: number;
  /** Max lines visible at once */
  maxLines?: number;
  /** Font size */
  fontSize?: number;
}

/**
 * Karaoke-style synced captions.
 * Shows the current phrase with the active word highlighted.
 * Positioned at the bottom of the frame.
 */
export const SyncedCaption: React.FC<SyncedCaptionProps> = ({
  words,
  maxCharsPerLine = 30,
  maxLines = 2,
  fontSize = 44,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  if (words.length === 0) return null;

  // Split words into display groups (sentence-like chunks)
  const groups = buildGroups(words, maxCharsPerLine, maxLines);

  // Find the active group based on current time
  const activeGroup = groups.find(
    (g) => currentTime >= g.startTime - 0.1 && currentTime <= g.endTime + 0.3
  );

  if (!activeGroup) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          padding: "16px 28px",
          maxWidth: 960,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {activeGroup.words.map((w, i) => {
          const isActive = currentTime >= w.start && currentTime <= w.end + 0.15;
          const isPast = currentTime > w.end + 0.15;

          return (
            <span
              key={`${activeGroup.startTime}-${i}`}
              style={{
                fontFamily: FONT,
                fontSize,
                fontWeight: isActive ? 900 : 600,
                color: isActive ? C.green : isPast ? C.white : "rgba(255,255,255,0.5)",
                transition: "color 0.1s, font-weight 0.1s",
                marginRight: 8,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

interface WordGroup {
  words: WordTiming[];
  startTime: number;
  endTime: number;
}

/**
 * Groups words into display chunks that fit within maxLines × maxCharsPerLine.
 */
function buildGroups(
  words: WordTiming[],
  maxCharsPerLine: number,
  maxLines: number
): WordGroup[] {
  const maxChars = maxCharsPerLine * maxLines;
  const groups: WordGroup[] = [];
  let current: WordTiming[] = [];
  let charCount = 0;

  for (const w of words) {
    const wordLen = w.word.length + 1; // +1 for space
    if (charCount + wordLen > maxChars && current.length > 0) {
      groups.push({
        words: current,
        startTime: current[0].start,
        endTime: current[current.length - 1].end,
      });
      current = [];
      charCount = 0;
    }
    current.push(w);
    charCount += wordLen;
  }

  if (current.length > 0) {
    groups.push({
      words: current,
      startTime: current[0].start,
      endTime: current[current.length - 1].end,
    });
  }

  return groups;
}
