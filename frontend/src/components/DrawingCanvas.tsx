import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface PixelExtractionOptions {
  /** Target width for downsampling (default: 128 for CNN, 28 for k-NN) */
  targetWidth?: number;
  /** Target height for downsampling (default: 128 for CNN, 28 for k-NN) */
  targetHeight?: number;
  /** If true, returns a 1D flattened array (length = width * height). Default: false (2D array [height][width]). */
  flatten?: boolean;
  /** If true, returns floats between 0.0 and 1.0 instead of integers between 0 and 255. Default: false. */
  normalize?: boolean;
}

export interface DrawingCanvasHandle {
  clear: () => void;
  /** Returns the full-resolution ImageData object (RGBA) from the canvas. */
  getRawImageData: () => ImageData | null;
  /** 
   * Downsamples the drawing to target dimensions (default 128x128 to match CNN models) and converts it 
   * to grayscale pixel values (0 = background, 255 / 1.0 = stroke intensity).
   */
  getPixelValues: (options?: PixelExtractionOptions) => number[][] | number[] | null;
  /** Returns the canvas contents as a Base64 PNG Data URL string. */
  getImageDataUrl: () => string | null;
}

interface DrawingCanvasProps {
  tool: "pencil" | "eraser";
  color: string;
  brushSize: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ tool, color, brushSize }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      getRawImageData: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) return null;
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      },
      getPixelValues: (options?: PixelExtractionOptions) => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return null;

        const targetWidth = options?.targetWidth ?? 128;
        const targetHeight = options?.targetHeight ?? 128;
        const flatten = options?.flatten ?? false;
        const normalize = options?.normalize ?? false;

        // Offscreen canvas for downsampling
        const offscreen = document.createElement("canvas");
        offscreen.width = targetWidth;
        offscreen.height = targetHeight;
        const offCtx = offscreen.getContext("2d");
        if (!offCtx) return null;

        // Draw main canvas onto offscreen canvas
        offCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
        const { data } = offCtx.getImageData(0, 0, targetWidth, targetHeight);

        const matrix: number[][] = [];
        const flatArray: number[] = [];

        for (let y = 0; y < targetHeight; y++) {
          const row: number[] = [];
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3] / 255;

            // Compute stroke intensity: 0 = empty canvas, 255 = dark stroke
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            const strokeIntensity = (255 - luminance) * a;
            const val = normalize ? strokeIntensity / 255 : Math.round(strokeIntensity);

            if (flatten) {
              flatArray.push(val);
            } else {
              row.push(val);
            }
          }
          if (!flatten) {
            matrix.push(row);
          }
        }

        return flatten ? flatArray : matrix;
      },
      getImageDataUrl: () => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return null;
        return canvas.toDataURL("image/png");
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        const ctx = canvas.getContext("2d");
        const prev = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        if (ctx && prev) ctx.putImageData(prev, 0, 0);
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const draw = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      canvasRef.current?.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      const point = getPoint(e);
      lastPoint.current = point;
      draw(point, point);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !lastPoint.current) return;
      const point = getPoint(e);
      draw(lastPoint.current, point);
      lastPoint.current = point;
    };

    const handlePointerUp = () => {
      isDrawing.current = false;
      lastPoint.current = null;
    };

    return (
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-border"
        style={{
          backgroundColor: "#faf5e9",
          backgroundImage:
            "linear-gradient(to right, #e8dcc4 1px, transparent 1px), linear-gradient(to bottom, #e8dcc4 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    );
  },
);

export default DrawingCanvas;
