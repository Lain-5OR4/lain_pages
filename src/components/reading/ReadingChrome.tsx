import { BookOpen, Library, List, Search, Shuffle } from "lucide-react";
import {
  READING_FILTERS,
  type ReadingFilter,
  type ReadingView,
  type summarizeBooks,
} from "./model";
import { STATUS_LABEL } from "./theme";

type Summary = ReturnType<typeof summarizeBooks>;

export function ReadingHeader({ summary, year }: { summary: Summary; year: number }) {
  return (
    <header className="reading-header">
      <div className="reading-heading">
        <p className="reading-eyebrow">
          <span /> MY LITTLE LIBRARY
        </p>
        <h1>
          読書記録
          <span className="reading-heading-star" aria-hidden="true">
            ✳
          </span>
        </h1>
      </div>
      <div className="reading-library-card">
        <div className="reading-card-caption">
          <BookOpen size={15} aria-hidden="true" /> READER’S CARD{" "}
          <span aria-hidden="true">No. 001</span>
        </div>
        <dl className="reading-stats">
          <div>
            <dt>本棚の蔵書</dt>
            <dd>
              {summary.counts.all}
              <small>冊</small>
            </dd>
          </div>
          <div>
            <dt>{year}年の読了</dt>
            <dd>
              {summary.finishedThisYear}
              <small>冊</small>
            </dd>
          </div>
          <div>
            <dt>読了本の平均</dt>
            <dd>
              {summary.average}
              <small> / 5</small>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

interface ToolbarProps {
  filter: ReadingFilter;
  onFilter: (filter: ReadingFilter) => void;
  query: string;
  onQuery: (query: string) => void;
  view: ReadingView;
  onView: (view: ReadingView) => void;
  counts: Summary["counts"];
}

export function ReadingToolbar({
  filter,
  onFilter,
  query,
  onQuery,
  view,
  onView,
  counts,
}: ToolbarProps) {
  return (
    <div className="reading-toolbar">
      <fieldset className="reading-filters" aria-label="読書状況で絞り込み">
        {READING_FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            className="reading-filter"
            data-status={id}
            aria-pressed={filter === id}
            onClick={() => onFilter(id)}
          >
            {id === "all" ? "すべて" : STATUS_LABEL[id]}
            <span>{counts[id]}</span>
          </button>
        ))}
      </fieldset>
      <div className="reading-tools">
        <label className="reading-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="タイトル・著者で検索"
            placeholder="タイトル・著者で探す"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>
        <fieldset className="reading-view" aria-label="表示方法">
          <button type="button" aria-pressed={view === "shelf"} onClick={() => onView("shelf")}>
            <Library size={16} aria-hidden="true" />棚
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => onView("list")}>
            <List size={16} aria-hidden="true" />
            一覧
          </button>
        </fieldset>
      </div>
    </div>
  );
}

export function ReadingShelfCaption({ count, onRandom }: { count: number; onRandom: () => void }) {
  return (
    <div className="reading-shelf-caption">
      <output>
        <span className="reading-section-number">01</span> 本棚をのぞく{" "}
        <span className="reading-result-count">/ {count}冊</span>
      </output>
      <button type="button" className="reading-random" disabled={count === 0} onClick={onRandom}>
        <Shuffle size={15} aria-hidden="true" />
        偶然の一冊
      </button>
    </div>
  );
}
