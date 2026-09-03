'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  required?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ (1★)',
  2: 'Tệ (2★)',
  3: 'Bình thường (3★)',
  4: 'Ngon / Tốt (4★)',
  5: 'Xuất sắc (5★)',
};

export default function StarRating({
  label,
  value,
  onChange,
  required = false,
}: StarRatingProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const activeVal = hoverVal !== null ? hoverVal : value;

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-slate-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-xs font-semibold text-vku-orange">
          {activeVal > 0 ? RATING_LABELS[activeVal] : 'Chưa đánh giá'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeVal;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverVal(star)}
              onMouseLeave={() => setHoverVal(null)}
              className="p-1 transition-transform active:scale-90 focus:outline-none"
              aria-label={`${label} ${star} sao`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : 'text-slate-300 hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

