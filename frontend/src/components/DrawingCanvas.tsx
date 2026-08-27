import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface DrawingCanvasHandle {
  clear: () => void;
  getPNG: () => Promise<Blob | null>;
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
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      },

      getPNG: () => {
        const canvas = canvasRef.current;

        if (!canvas) {
          return Promise.resolve(null);
        }

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/png");
        });
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
