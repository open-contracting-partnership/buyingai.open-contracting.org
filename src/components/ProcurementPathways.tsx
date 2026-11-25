"use client";

import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Cloud,
  Cpu,
  DollarSign,
  FileText,
  FlaskConical,
  type LucideIcon,
  Settings,
  ShoppingCart,
  Sparkles,
  Wrench,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { renderBold } from "@/lib/react-text";

// Types
interface RowItem {
  category_id: string;
  subcategory_id?: string;
  content: string;
  icon?: string;
}

interface Row {
  id: string;
  title: string;
  expandedByDefault: boolean;
  items: RowItem[];
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  subcategories?: Subcategory[];
}

interface ProcurementData {
  title: string;
  categories: Category[];
  rows: Row[];
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "off-the-shelf": ShoppingCart,
  customize: Wrench,
  build: Building2,
};

const ROW_ICONS: Record<string, LucideIcon> = {
  "type-of-ai": Sparkles,
  "customization-level": Settings,
  "purchase-type": FileText,
  "commercial-model": DollarSign,
  "commercial-risks": AlertTriangle,
  "procurement-methods": ClipboardList,
};

const ITEM_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  settings: Settings,
  cloud: Cloud,
  cpu: Cpu,
  flask: FlaskConical,
};

const ITEM_BACKGROUND_COLORS: Record<string, string> = {
  "off-the-shelf": "#FEFCE8",
  customize: "#F0FDF4",
  build: "#ECFEFF",
};

// The text, truncated to maxLength characters with a "See more" toggle, unless `expanded`.
function TruncatedText({
  text,
  maxLength,
  expanded,
  className,
}: {
  text: string;
  maxLength: number;
  expanded: boolean;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const truncatable = text.length > maxLength && !expanded;
  return (
    <>
      <p className={className} style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
        {renderBold(truncatable && !open ? `${text.substring(0, maxLength)}...` : text, "font-bold")}
      </p>
      {truncatable && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-2 text-xs font-semibold text-black underline"
        >
          {open ? "See less" : "See more"}
        </button>
      )}
    </>
  );
}

// `expanded` shows all rows and full texts, without toggles, for print.
const ProcurementPathways: React.FC<{
  data: ProcurementData;
  expanded?: boolean;
}> = ({ data, expanded = false }) => {
  // Initialize with rows that have expandedByDefault = true
  const initialExpanded = new Set(data.rows.filter((row) => row.expandedByDefault).map((row) => row.id));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(initialExpanded);

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const renderCategoryHeader = (category: Category) => {
    const CategoryIcon = CATEGORY_ICONS[category.id] ?? FileText;
    const maxLength = 150; // Character limit before showing "See more"
    const textClassName = "text-xs leading-relaxed break-words !m-0 !text-black";

    if (!category.subcategories) {
      return (
        <div className="flex flex-col h-full">
          <div
            className="p-2 md:p-3 font-bold text-sm md:text-base text-center flex items-center justify-center gap-2"
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">{category.name}</span>
          </div>
          <div className="p-3 md:p-4 flex-1" style={{ backgroundColor: category.color }}>
            <TruncatedText
              text={category.description || ""}
              maxLength={maxLength}
              expanded={expanded}
              className={textClassName}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div
          className="p-2 md:p-3 font-bold text-base md:text-lg text-center flex items-center justify-center gap-2"
          style={{ backgroundColor: category.color }}
        >
          <CategoryIcon className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <span className="break-words">{category.name}</span>
        </div>
        <div className="flex flex-col md:flex-row flex-1">
          {category.subcategories.map((sub, idx) => (
            <div
              key={sub.id}
              className={`flex-1 p-3 md:p-4 ${idx > 0 ? "border-t-2 md:border-t-0 md:border-l-2 border-white" : ""}`}
              style={{ backgroundColor: category.color }}
            >
              <TruncatedText
                text={sub.description || ""}
                maxLength={maxLength}
                expanded={expanded}
                className={textClassName}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExpandableRow = (row: Row) => {
    const isExpanded = expanded || expandedRows.has(row.id);
    const RowIcon = ROW_ICONS[row.id] ?? FileText;
    const RowHeader = expanded ? "div" : "button";

    return (
      <div key={row.id} className="border-t-2 border-gray-200 break-inside-avoid">
        <RowHeader
          onClick={expanded ? undefined : () => toggleRow(row.id)}
          className="w-full flex items-center justify-between p-2.5 md:p-3 hover:bg-gray-50 transition-colors gap-2"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <RowIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
            <span
              className="font-semibold text-left text-xs md:text-sm break-words"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {row.title}
            </span>
          </div>
          {expanded ? null : isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          )}
        </RowHeader>

        {isExpanded && (
          <div className="flex flex-col md:flex-row border-t border-gray-200">
            {row.items.map((item) => {
              const ItemIcon = item.icon ? ITEM_ICONS[item.icon] : undefined;
              return (
                <div
                  key={`${item.category_id}/${item.subcategory_id ?? ""}`}
                  className="flex-1 p-2.5 md:p-3 border-b-2 md:border-b-0 md:border-l-2 border-white min-h-[50px] md:min-h-[60px] flex items-start gap-2"
                  style={{ backgroundColor: ITEM_BACKGROUND_COLORS[item.category_id] ?? "#F9FAFB" }}
                >
                  {ItemIcon && <ItemIcon className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />}
                  <div className="w-full min-w-0">
                    <TruncatedText
                      text={item.content || ""}
                      maxLength={120}
                      expanded={expanded}
                      className="text-xs leading-relaxed break-words m-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white text-black px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
      {/* Title */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold !mt-0">{data.title}</h2>
      </div>

      {/* Main Category Headers */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3 md:mb-4" style={{ minHeight: "auto" }}>
        {data.categories.map((category) => (
          <div
            key={category.id}
            className={`${
              category.subcategories ? "w-full md:flex-[2]" : "w-full md:flex-1"
            } rounded-t-lg overflow-hidden shadow-md break-inside-avoid`}
          >
            {renderCategoryHeader(category)}
          </div>
        ))}
      </div>

      {/* Expandable Rows */}
      <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
        {data.rows.map((row) => renderExpandableRow(row))}
      </div>
    </div>
  );
};

export default ProcurementPathways;
