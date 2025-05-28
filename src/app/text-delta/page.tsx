"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

type DiffMode = "unified" | "github";
type DiffLevel = "line" | "character";

interface DiffLine {
  type: "context" | "added" | "removed" | "header";
  content: string;
  lineNumber?: { old?: number; new?: number };
  charDiffs?: Array<{
    type: "context" | "added" | "removed";
    text: string;
  }>;
}

export default function TextDiffPage() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffMode, setDiffMode] = useState<DiffMode>("github");
  const [diffLevel, setDiffLevel] = useState<DiffLevel>("line");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);

  const calculateCharDiff = (str1: string, str2: string) => {
    const result: Array<{ type: "context" | "added" | "removed"; text: string }> = [];

    // LCS (Longest Common Subsequence) based diff algorithm
    const lcs = (s1: string, s2: string): string[][] => {
      const m = s1.length;
      const n = s2.length;
      const dp: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (s1[i - 1] === s2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Backtrack to find the actual diff
      const diff: string[][] = [];
      let i = m;
      let j = n;

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
          diff.unshift(["context", s1[i - 1]]);
          i--;
          j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          diff.unshift(["added", s2[j - 1]]);
          j--;
        } else if (i > 0) {
          diff.unshift(["removed", s1[i - 1]]);
          i--;
        }
      }

      return diff;
    };

    const diffArray = lcs(str1, str2);

    // Merge consecutive chars of same type for better readability
    let currentType = "";
    let currentText = "";

    for (const [type, char] of diffArray) {
      if (type === currentType) {
        currentText += char;
      } else {
        if (currentText) {
          result.push({
            type: currentType as "context" | "added" | "removed",
            text: currentText,
          });
        }
        currentType = type;
        currentText = char;
      }
    }

    if (currentText) {
      result.push({
        type: currentType as "context" | "added" | "removed",
        text: currentText,
      });
    }

    return result;
  };

  const calculateDiff = () => {
    const leftLines = leftText.split("\n");
    const rightLines = rightText.split("\n");
    const diff: DiffLine[] = [];

    const maxLines = Math.max(leftLines.length, rightLines.length);
    let oldLineNum = 1;
    let newLineNum = 1;

    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || "";
      const rightLine = rightLines[i] || "";

      if (leftLine === rightLine) {
        diff.push({
          type: "context",
          content: leftLine,
          lineNumber: { old: oldLineNum++, new: newLineNum++ },
        });
      } else {
        if (leftLines[i] !== undefined && rightLines[i] !== undefined) {
          if (diffLevel === "character") {
            const charDiffs = calculateCharDiff(leftLine, rightLine);
            diff.push({
              type: "context",
              content: rightLine,
              lineNumber: { old: oldLineNum++, new: newLineNum++ },
              charDiffs: charDiffs,
            });
          } else {
            diff.push({
              type: "removed",
              content: leftLine,
              lineNumber: { old: oldLineNum++ },
            });
            diff.push({
              type: "added",
              content: rightLine,
              lineNumber: { new: newLineNum++ },
            });
          }
        } else {
          if (leftLines[i] !== undefined) {
            diff.push({
              type: "removed",
              content: leftLine,
              lineNumber: { old: oldLineNum++ },
            });
          }
          if (rightLines[i] !== undefined) {
            diff.push({
              type: "added",
              content: rightLine,
              lineNumber: { new: newLineNum++ },
            });
          }
        }
      }
    }

    setDiffResult(diff);
  };

  const renderCharDiffs = (
    charDiffs: Array<{ type: "context" | "added" | "removed"; text: string }>,
  ) => {
    return charDiffs.map((char, index) => (
      <span
        key={`char-${index}-${char.type}-${char.text}`}
        className={`${
          char.type === "added"
            ? "bg-green-200 text-green-800"
            : char.type === "removed"
              ? "bg-red-200 text-red-800"
              : ""
        }`}
      >
        {char.text}
      </span>
    ));
  };

  const renderUnifiedDiff = () => {
    return (
      <div className="font-mono text-sm bg-white border rounded overflow-auto">
        {diffResult.map((line, index) => (
          <div
            key={`unified-line-${index}-${line.type}-${line.content.slice(0, 10)}`}
            className={`px-4 py-1 ${
              line.type === "added"
                ? "bg-green-50 text-green-800 border-l-4 border-green-400"
                : line.type === "removed"
                  ? "bg-red-50 text-red-800 border-l-4 border-red-400"
                  : "text-gray-700"
            }`}
          >
            <span className="text-gray-400 mr-2 select-none">
              {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
            </span>
            {line.charDiffs && diffLevel === "character"
              ? renderCharDiffs(line.charDiffs)
              : line.content}
          </div>
        ))}
      </div>
    );
  };

  const renderGitHubDiff = () => {
    return (
      <div className="border border-gray-300 rounded overflow-hidden bg-white">
        <table className="w-full font-mono text-sm">
          <tbody>
            {diffResult.map((line, index) => (
              <tr
                key={`github-line-${index}-${line.type}-${line.content.slice(0, 10)}`}
                className={`${
                  line.type === "added"
                    ? "bg-green-50"
                    : line.type === "removed"
                      ? "bg-red-50"
                      : "bg-white"
                }`}
              >
                <td className="w-12 px-3 py-2 text-gray-500 text-right border-r border-gray-200 select-none bg-gray-50">
                  {line.lineNumber?.old || ""}
                </td>
                <td className="w-12 px-3 py-2 text-gray-500 text-right border-r border-gray-200 select-none bg-gray-50">
                  {line.lineNumber?.new || ""}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block w-4 mr-2 font-bold ${
                      line.type === "added"
                        ? "text-green-600"
                        : line.type === "removed"
                          ? "text-red-600"
                          : ""
                    }`}
                  >
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : ""}
                  </span>
                  <span
                    className={`${
                      line.type === "added"
                        ? "text-green-800"
                        : line.type === "removed"
                          ? "text-red-800"
                          : "text-gray-800"
                    }`}
                  >
                    {line.charDiffs && diffLevel === "character"
                      ? renderCharDiffs(line.charDiffs)
                      : line.content}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/assets/textdelta.png" alt="TextDelta" className="h-16" />
          </div>
          <p className="text-gray-600 text-lg">
            Compare text differences with advanced highlighting
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Original Text</h3>
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className="w-full h-64 bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter original text here..."
              />
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Modified Text</h3>
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className="w-full h-64 bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter modified text here..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
          <Button
            onClick={calculateDiff}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
          >
            Compare Texts
          </Button>

          <div className="flex gap-2">
            <Button
              variant={diffMode === "github" ? "default" : "outline"}
              onClick={() => setDiffMode("github")}
              className={
                diffMode === "github"
                  ? "bg-gray-800 hover:bg-gray-900 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            >
              GitHub Style
            </Button>
            <Button
              variant={diffMode === "unified" ? "default" : "outline"}
              onClick={() => setDiffMode("unified")}
              className={
                diffMode === "unified"
                  ? "bg-gray-800 hover:bg-gray-900 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            >
              Unified Diff
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={diffLevel === "line" ? "default" : "outline"}
              onClick={() => setDiffLevel("line")}
              className={
                diffLevel === "line"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }
            >
              Line Level
            </Button>
            <Button
              variant={diffLevel === "character" ? "default" : "outline"}
              onClick={() => setDiffLevel("character")}
              className={
                diffLevel === "character"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }
            >
              Character Level
            </Button>
          </div>
        </div>

        {diffResult.length > 0 && (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Diff Result ({diffMode === "github" ? "GitHub Style" : "Unified Diff"}) -{" "}
                {diffLevel === "character" ? "Character Level" : "Line Level"}
              </h3>
              {diffMode === "github" ? renderGitHubDiff() : renderUnifiedDiff()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
