interface ThemePickerProps {
  currentTheme: string;
  currentBorder: string;
  onUpdate: (updates: { theme_color?: string; border_style?: string }) => void;
}

export function ThemePicker({ currentTheme, currentBorder, onUpdate }: ThemePickerProps) {
  
  const colors = [
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Stone', value: 'stone', class: 'bg-stone-500' },
  ];

  const borders = [
    { name: 'Soft', value: 'rounded-2xl' },
    { name: 'Round', value: 'rounded-full' },
    { name: 'Square', value: 'rounded-none' },
    { name: 'Hard', value: 'rounded-lg' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Color Section */}
      <div>
        <label className="text-xs font-bold text-stone-400 uppercase mb-3 block">Accent Color</label>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdate({ theme_color: color.value })}
              className={`w-10 h-10 rounded-full ${color.class} transition-transform hover:scale-110 ${
                currentTheme === color.value ? 'ring-4 ring-offset-2 ring-stone-300 dark:ring-stone-600 scale-110' : ''
              }`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Border Section */}
      <div>
        <label className="text-xs font-bold text-stone-400 uppercase mb-3 block">Border Style</label>
        <div className="grid grid-cols-4 gap-2">
          {borders.map((border) => (
            <button
              key={border.value}
              onClick={() => onUpdate({ border_style: border.value })}
              className={`py-2 text-xs font-bold border-2 transition-all ${
                currentBorder === border.value 
                  ? 'border-black dark:border-white text-black dark:text-white bg-stone-100 dark:bg-stone-800' 
                  : 'border-stone-200 dark:border-stone-800 text-stone-400'
              } ${border.value}`}
            >
              {border.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}