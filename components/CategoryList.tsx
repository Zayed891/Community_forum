"use client";

import { useTranslations } from "@/lib/i18n/context";
import { useFeed } from "@/lib/hooks";
import { relativeTime } from "@/lib/relative-time";
import type { Course } from "@/lib/types";

type Props = {
  courses: Course[];
  onSelect: (courseId: number) => void;
};

const PALETTE = [
  { bg: "bg-green-100", fg: "text-green-700", Icon: BookIcon },
  { bg: "bg-purple-100", fg: "text-purple-700", Icon: MegaphoneIcon },
  { bg: "bg-amber-100", fg: "text-amber-700", Icon: BulbIcon },
  { bg: "bg-sky-100", fg: "text-sky-700", Icon: ChatIcon },
  { bg: "bg-pink-100", fg: "text-pink-700", Icon: QuestionIcon },
];

export function CategoryList({ courses, onSelect }: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6 border-b border-gray-200 text-sm font-medium">
        <span className="border-b-2 border-brand px-1 pb-3 text-brand-dark">
          {t("categoryTabs.categories")}
        </span>
        <span className="pb-3 text-gray-400">{t("categoryTabs.latest")}</span>
        <span className="pb-3 text-gray-400">{t("categoryTabs.top")}</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {courses.map((course, index) => (
          <CategoryRow
            key={course.id}
            course={course}
            style={PALETTE[index % PALETTE.length]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  course,
  style,
  onSelect,
}: {
  course: Course;
  style: (typeof PALETTE)[number];
  onSelect: (courseId: number) => void;
}) {
  const { t } = useTranslations();
  const feed = useFeed(course.id);
  const latest = feed.data?.pages[0]?.posts.slice(0, 3) ?? [];
  const Icon = style.Icon;

  return (
    <div className="flex items-start gap-4 border-b border-gray-100 px-4 py-5 last:border-0 sm:items-center">
      <button
        onClick={() => onSelect(course.id)}
        className="flex flex-1 cursor-pointer items-start gap-4 text-start"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
          <Icon className={`h-5 w-5 ${style.fg}`} />
        </span>
        <span>
          <span className="block font-semibold text-gray-900">{course.name}</span>
          <span className="mt-1 block text-sm text-gray-500">
            {t("category.description", { name: course.name })}
          </span>
        </span>
      </button>

      <ul className="hidden w-72 shrink-0 flex-col gap-2 sm:flex">
        {latest.map((post) => (
          <li key={post.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-gray-800">{post.title}</span>
            <span className="shrink-0 text-xs text-gray-400">{relativeTime(post.createdAt)}</span>
          </li>
        ))}
        {latest.length === 0 && !feed.isLoading && (
          <li className="text-sm text-gray-400">{t("category.empty")}</li>
        )}
      </ul>
    </div>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 11v2a1 1 0 0 0 1 1h1l2 6h2l-1.5-6H12l6 4V6l-6 4H4a1 1 0 0 0-1 1Z" />
      <path d="M15 8.5v7" />
    </svg>
  );
}

function BulbIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.4 1 1.1 1 1.8V17h6v-.5c0-.7.4-1.4 1-1.8A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
