"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Wrench,
  Building2,
  Settings,
  Cloud,
  Cpu,
  FlaskConical,
  Sparkles,
  FileText,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

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

const ProcurementPathways: React.FC<{ data: ProcurementData }> = ({ data }) => {
  // Initialize with rows that have expandedByDefault = true
  const initialExpanded = new Set(
    data.rows.filter((row) => row.expandedByDefault).map((row) => row.id)
  );
  const [expandedRows, setExpandedRows] =
    useState<Set<string>>(initialExpanded);
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(
    new Set<string>()
  );

  // Map category IDs to icons
  const getCategoryIcon = (categoryId: string): LucideIcon => {
    switch (categoryId) {
      case "off-the-shelf":
        return ShoppingCart;
      case "customize":
        return Wrench;
      case "build":
        return Building2;
      default:
        return FileText;
    }
  };

  // Map row titles to icons
  const getRowIcon = (rowId: string): LucideIcon => {
    switch (rowId) {
      case "type-of-ai":
        return Sparkles;
      case "customization-level":
        return Settings;
      case "purchase-type":
        return FileText;
      case "commercial-model":
        return DollarSign;
      case "commercial-risks":
        return AlertTriangle;
      case "procurement-methods":
        return ClipboardList;
      default:
        return FileText;
    }
  };

  // Map item icons
  const getItemIcon = (iconName?: string): LucideIcon | null => {
    if (!iconName) return null;
    const iconMap: Record<string, LucideIcon> = {
      "shopping-cart": ShoppingCart,
      settings: Settings,
      cloud: Cloud,
      cpu: Cpu,
      flask: FlaskConical,
    };
    return iconMap[iconName] || null;
  };

  const toggleTextExpansion = (textId: string) => {
    setExpandedTexts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(textId)) {
        newSet.delete(textId);
      } else {
        newSet.add(textId);
      }
      return newSet;
    });
  };

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

  const getCategoryColor = (categoryId: string): string => {
    const category = data.categories.find((cat) => cat.id === categoryId);
    return category?.color || "#E5E7EB";
  };

  // Helper function to parse markdown bold (**text**) and convert to React elements
  const parseBoldText = (text: string): React.ReactNode => {
    if (!text) return "";
    
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    let hasBold = false;

    while ((match = regex.exec(text)) !== null) {
      hasBold = true;
      // Add text before the bold
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(
        <strong key={match.index} className="font-bold">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // If no bold text found, return original text
    return hasBold ? <>{parts}</> : text;
  };

  const renderCategoryHeader = (category: Category) => {
    const CategoryIcon = getCategoryIcon(category.id);
    const maxLength = 150; // Character limit before showing "ver más"

    if (!category.subcategories) {
      const description = category.description || "";
      const textId = `category-${category.id}`;
      const isExpanded = expandedTexts.has(textId);
      const needsTruncation = description.length > maxLength;
      const displayText = needsTruncation && !isExpanded
        ? description.substring(0, maxLength) + "..."
        : description;

      return (
        <div className="flex flex-col h-full">
          <div
            className="p-2 md:p-3 font-bold text-sm md:text-base text-center flex items-center justify-center gap-2"
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">{category.name}</span>
          </div>
          <div
            className="p-3 md:p-4 flex-1"
            style={{ backgroundColor: category.color }}
          >
            <p
              className="text-xs leading-relaxed break-words !m-0"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {displayText ? parseBoldText(displayText) : ""}
            </p>
            {needsTruncation && (
              <button
                onClick={() => toggleTextExpansion(textId)}
                className="mt-2 text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </button>
            )}
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
          {category.subcategories.map((sub, idx) => {
            const description = sub.description || "";
            const textId = `subcategory-${sub.id}`;
            const isExpanded = expandedTexts.has(textId);
            const needsTruncation = description.length > maxLength;
            const displayText = needsTruncation && !isExpanded
              ? description.substring(0, maxLength) + "..."
              : description;

            return (
              <div
                key={sub.id}
                className={`flex-1 p-3 md:p-4 ${
                  idx > 0
                    ? "border-t-2 md:border-t-0 md:border-l-2 border-white"
                    : ""
                }`}
                style={{ backgroundColor: category.color, opacity: 0.9 }}
              >
                <p
                  className="text-xs leading-relaxed break-words !m-0"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  {displayText ? parseBoldText(displayText) : ""}
                </p>
                {needsTruncation && (
                  <button
                    onClick={() => toggleTextExpansion(textId)}
                    className="mt-2 text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getBackgroundColor = (categoryId: string): string => {
    if (categoryId === "off-the-shelf") return "#FEFCE8";
    if (categoryId === "customize") return "#F0FDF4";
    if (categoryId === "build") return "#ECFEFF";
    return "#F9FAFB";
  };

  const renderExpandableRow = (row: Row) => {
    const isExpanded = expandedRows.has(row.id);
    const RowIcon = getRowIcon(row.id);
    const maxLength = 120; // Character limit before showing "ver más"

    return (
      <div key={row.id} className="border-t-2 border-gray-200">
        <button
          onClick={() => toggleRow(row.id)}
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
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="flex flex-col md:flex-row border-t border-gray-200">
            {row.items.map((item, idx) => {
              const bgColor = getBackgroundColor(item.category_id);
              const ItemIcon = getItemIcon(item.icon);
              const content = item.content || "";
              const textId = `item-${row.id}-${idx}`;
              const isTextExpanded = expandedTexts.has(textId);
              const needsTruncation = content.length > maxLength;
              const displayText = needsTruncation && !isTextExpanded
                ? content.substring(0, maxLength) + "..."
                : content;

              return (
                <div
                  key={idx}
                  className="flex-1 p-2.5 md:p-3 border-b-2 md:border-b-0 md:border-l-2 border-white min-h-[50px] md:min-h-[60px] flex items-start gap-2"
                  style={{ backgroundColor: bgColor }}
                >
                  {ItemIcon && (
                    <ItemIcon className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="w-full min-w-0">
                    <p
                      className="text-xs leading-relaxed break-words m-0"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {displayText ? parseBoldText(displayText) : ""}
                    </p>
                    {needsTruncation && (
                      <button
                        onClick={() => toggleTextExpansion(textId)}
                        className="mt-2 text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
                      >
                        {isTextExpanded ? "Ver menos" : "Ver más"}
                      </button>
                    )}
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
    <div className="w-full max-w-7xl mx-auto bg-white px-4 md:px-6 lg:px-8 py-4 md:py-6">
      {/* Title */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-bold">{data.title}</h1>
      </div>

      {/* Main Category Headers */}
      <div
        className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3 md:mb-4"
        style={{ minHeight: "auto" }}
      >
        {data.categories.map((category) => (
          <div
            key={category.id}
            className={`${
              category.subcategories ? "w-full md:flex-[2]" : "w-full md:flex-1"
            } rounded-t-lg overflow-hidden shadow-md`}
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
