'use client';

import { Controller } from 'react-hook-form';
import { Input } from './custom-input';
import { Plus, PlusCircle, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomProperties({ control, errors }: any) {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel('');
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue('');
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label
                  htmlFor=""
                  className="block font-semibold text-neutral-200 mb-1"
                >
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-neutral-700 p-3 rounded-lg bg-neutral-950"
                    >
                      <div className="flex item-center justify-between">
                        <span className="text-white font-medium text-sm">
                          {property.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>

                      {/* Add Values */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type="text"
                          className="border outline-none border-neutral-700 bg-neutral-800 px-2 py-1  text-sm rounded-sm text-white w-full"
                          placeholder="Enter value..."
                          value={newValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewValue(e.currentTarget.value)
                          }
                        />
                        <button
                          type="button"
                          className="px-2 py-1 bg-emerald-500 text-white rounded-sm text-sm"
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>

                      {/* Show Values */}
                      <div className="flex flex-wrap gap-2 mt-2 ">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-neutral-700 text-white rounded-md"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add new Property */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Enter property Label (e.g., Material, Warranty)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-2 py-1.5 bg-emerald-500 text-white rounded-sm flex items-center text-xs"
                      onClick={addProperty}
                    >
                      <PlusCircle size={12} />&nbsp;Add
                    </button>
                  </div>
                </div>

                {errors.customProperties && (
                  <p className="text-red-500">
                    {' '}
                    {errors.customProperties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
