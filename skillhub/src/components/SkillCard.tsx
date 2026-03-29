"use client";

import { SKILL_CATEGORIES, PER_UNIT_OPTIONS } from "@/lib/users";
import type { SkillOffered } from "@/types";

interface SkillCardProps {
  skill: SkillOffered;
  onBook?: ((skill: SkillOffered) => void) | null;
  onRemove?: ((skill: SkillOffered) => void) | null;
  showActions?: boolean;
}

export default function SkillCard({ skill, onBook, onRemove }: SkillCardProps) {
  const category = SKILL_CATEGORIES.find((c) => c.id === skill.category);
  const perUnit = PER_UNIT_OPTIONS.find((o) => o.id === skill.perUnit);

  return (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{skill.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {category?.icon} {category?.label || skill.category} •{" "}
            <span className="capitalize">{skill.level}</span>
          </p>
        </div>
        {onRemove && (
          <button onClick={() => onRemove(skill)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
        )}
      </div>
      {skill.description && <p className="text-sm text-gray-600 mt-2">{skill.description}</p>}
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm font-medium">
          {skill.priceType === "free" ? (
            <span className="text-green-600">🆓 Free</span>
          ) : skill.priceType === "barter" ? (
            <span className="text-blue-600">🔄 Barter</span>
          ) : (
            <span className="text-orange-600">
              💰 ₹{skill.price}{" "}
              <span className="text-gray-500 font-normal">{perUnit?.label || skill.perUnit}</span>
            </span>
          )}
        </span>
        {onBook && (
          <button onClick={() => onBook(skill)} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
            Book This
          </button>
        )}
      </div>
    </div>
  );
}
