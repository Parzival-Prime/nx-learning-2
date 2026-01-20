import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function SizeSelector({ control, errors }: any) {
  return (
    <div className="mt-2">
      <label className="block font-semibold text-neutral-200 mb-1">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size],
                    )
                  }
                  className={`px-3 py-1 rounded-lg font-amarna transition-colors text-sm ${
                    isSelected
                      ? 'bg-neutral-700 text-white border border-neutral-500'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.sizes && (
        <p className='text-red-500 text-sm mb-1'>{errors.sizes.message as string}</p>
      )}
    </div>
  );
}
