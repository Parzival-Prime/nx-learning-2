'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  '#FB2C36',
  '#00FFFF',
  '#FFEB3B',
  '#05FA80',
  '#FF5722',
  '#7CFC00',
  '#FF2056',
  '#8207DB',
];

export default function ColorSelector({ control, errors }: any) {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#FF2056');

  return (
    <div className="mt-2">
      <label htmlFor="" className="block font-semibold text-neutral-200 mb-1">
        Color
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#ffffff', '#ffff00'].includes(color);
              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color],
                    )
                  }
                  className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${isSelected ? 'scale-110 border-white' : 'border-transparent'} ${isLightColor ? 'border-neutral-700' : ''}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full  border-2 border-neutral-600 bg-neutral-800 hover:bg-neutral-700 transition"
              onClick={()=>setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>

            {/* Color Picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  name="color"
                  id=""
                  value={newColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none cursor-pointer "
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-neutral-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
