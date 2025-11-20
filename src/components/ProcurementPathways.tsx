"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Types
interface RowItem {
  category_id: string;
  subcategory_id?: string;
  content: string;
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

  const renderCategoryHeader = (category: Category) => {
    if (!category.subcategories) {
      return (
        <div
          className="p-3 md:p-4 h-full flex flex-col justify-start"
          style={{ backgroundColor: category.color }}
        >
          <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-center md:text-left break-words">
            {category.name}
          </h3>
          <p
            className="text-xs leading-relaxed break-words"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            {category.description}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div
          className="p-2 md:p-3 font-bold text-base md:text-lg text-center break-words"
          style={{ backgroundColor: category.color }}
        >
          {category.name}
        </div>
        <div className="flex flex-col md:flex-row flex-1">
          {category.subcategories.map((sub, idx) => (
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
                className="text-xs leading-relaxed break-words"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {sub.description}
              </p>
            </div>
          ))}
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

    return (
      <div key={row.id} className="border-t-2 border-gray-200">
        <button
          onClick={() => toggleRow(row.id)}
          className="w-full flex items-center justify-between p-2.5 md:p-3 hover:bg-gray-50 transition-colors"
        >
          <span
            className="font-semibold text-left text-xs md:text-sm pr-2 break-words"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            {row.title}
          </span>
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

              return (
                <div
                  key={idx}
                  className="flex-1 p-2.5 md:p-3 border-b-2 md:border-b-0 md:border-l-2 border-white min-h-[50px] md:min-h-[60px] flex items-start"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="w-full">
                    <p
                      className="text-xs leading-relaxed break-words"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {item.content}
                    </p>
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
    <div className="w-full max-w-7xl mx-auto bg-white px-4 md:px-6 lg:px-8">
      {/* Title */}
      <div className="p-3 md:p-4 inline-block mb-3 md:mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{data.title}</h1>
      </div>

      {/* Main Category Headers */}
      <div
        className="flex flex-col md:flex-row gap-2 mb-2"
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
