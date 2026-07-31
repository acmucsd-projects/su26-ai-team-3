const BRUSH_SIZES = [3, 6, 11, 18];

const COLOR_ROWS = [
  ["#1a1a1a", "#4a3226", "#7a5230", "#c9a26a", "#d94f3d", "#e8823c", "#e8c93c", "#4a9b5e"],
  ["#4a86c9", "#8a4fc9", "#3fae8a", "#d9691f", "#ffffff", "#cbb896", "#9a9488", "#2f4a63"],
];

interface ToolbarProps {
  tool: "pencil" | "eraser";
  onToolChange: (tool: "pencil" | "eraser") => void;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

export default function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border px-6 py-3">
      <div className="flex gap-1.5">
        <button
          onClick={() => onToolChange("pencil")}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg ${
            tool === "pencil" ? "border-ink-soft bg-paper-dark" : "border-transparent"
          }`}
          aria-label="Pencil"
        >
          ✏️
        </button>
        <button
          onClick={() => onToolChange("eraser")}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg ${
            tool === "eraser" ? "border-ink-soft bg-paper-dark" : "border-transparent"
          }`}
          aria-label="Eraser"
        >
          🧹
        </button>
      </div>

      <div className="h-8 w-px bg-border" />

      <div className="flex items-center gap-2.5">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onBrushSizeChange(size)}
            className="flex h-10 w-6 items-center justify-center"
            aria-label={`Brush size ${size}`}
          >
            <span
              className="rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: brushSize === size ? "#4a3f30" : "#4a3f30",
                outline: brushSize === size ? "2px solid #4a3f30" : "none",
                outlineOffset: 2,
              }}
            />
          </button>
        ))}
      </div>

      <div className="h-8 w-px bg-border" />

      <div className="flex flex-col gap-1.5">
        {COLOR_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className="h-5 w-5 rounded-sm"
                style={{
                  backgroundColor: c,
                  border: c === "#ffffff" ? "1px solid #cdbb9c" : "none",
                  outline: color === c ? "2px solid #4a3f30" : "none",
                  outlineOffset: 1,
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="h-8 w-px bg-border" />

      <button
        onClick={onClear}
        className="rounded-lg border-2 border-dashed border-red-300 px-4 py-2 text-red-500"
      >
        clear
      </button>
    </div>
  );
}
