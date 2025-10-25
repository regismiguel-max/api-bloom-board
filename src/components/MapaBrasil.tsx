import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MapaBrasilProps {
  distribuicao: Array<{ uf: string; count: number }>;
}

export const MapaBrasil = ({ distribuicao }: MapaBrasilProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Criar mapa de UF para contagem
  const ufMap = useMemo(() => {
    const map = new Map<string, number>();
    distribuicao.forEach(item => map.set(item.uf, item.count));
    return map;
  }, [distribuicao]);

  // Calcular escala de cores
  const maxCount = useMemo(() => {
    return Math.max(...distribuicao.map(d => d.count), 1);
  }, [distribuicao]);

  const getColor = (uf: string) => {
    const count = ufMap.get(uf) || 0;
    if (count === 0) return "hsl(var(--muted))";
    
    const intensity = count / maxCount;
    // Gradient de cores do mais claro ao mais escuro
    if (intensity > 0.8) return "hsl(var(--primary))";
    if (intensity > 0.6) return "hsl(210, 100%, 50%)";
    if (intensity > 0.4) return "hsl(210, 100%, 60%)";
    if (intensity > 0.2) return "hsl(210, 100%, 70%)";
    return "hsl(210, 100%, 85%)";
  };

  const hoveredData = hoveredState ? {
    uf: hoveredState,
    count: ufMap.get(hoveredState) || 0
  } : null;

  // Coordenadas mais realistas dos estados brasileiros para o SVG
  const estados = [
    { uf: "AC", path: "M 70 290 L 90 290 L 90 315 L 70 315 Z", cx: 80, cy: 302 },
    { uf: "AL", path: "M 405 315 L 420 315 L 420 332 L 405 332 Z", cx: 412, cy: 323 },
    { uf: "AP", path: "M 270 95 L 295 95 L 295 125 L 270 125 Z", cx: 282, cy: 110 },
    { uf: "AM", path: "M 95 200 L 180 200 L 180 310 L 95 310 Z", cx: 137, cy: 255 },
    { uf: "BA", path: "M 345 310 L 410 310 L 410 375 L 345 375 Z", cx: 377, cy: 342 },
    { uf: "CE", path: "M 350 230 L 390 230 L 390 260 L 350 260 Z", cx: 370, cy: 245 },
    { uf: "DF", path: "M 330 355 L 340 355 L 340 365 L 330 365 Z", cx: 335, cy: 360 },
    { uf: "ES", path: "M 375 410 L 395 410 L 395 425 L 375 425 Z", cx: 385, cy: 417 },
    { uf: "GO", path: "M 310 340 L 355 340 L 355 390 L 310 390 Z", cx: 332, cy: 365 },
    { uf: "MA", path: "M 310 200 L 355 200 L 355 260 L 310 260 Z", cx: 332, cy: 230 },
    { uf: "MT", path: "M 235 270 L 310 270 L 310 355 L 235 355 Z", cx: 272, cy: 312 },
    { uf: "MS", path: "M 245 370 L 310 370 L 310 425 L 245 425 Z", cx: 277, cy: 397 },
    { uf: "MG", path: "M 320 380 L 380 380 L 380 430 L 320 430 Z", cx: 350, cy: 405 },
    { uf: "PA", path: "M 200 170 L 310 170 L 310 265 L 200 265 Z", cx: 255, cy: 217 },
    { uf: "PB", path: "M 395 260 L 415 260 L 415 275 L 395 275 Z", cx: 405, cy: 267 },
    { uf: "PR", path: "M 285 430 L 335 430 L 335 460 L 285 460 Z", cx: 310, cy: 445 },
    { uf: "PE", path: "M 365 275 L 405 275 L 405 310 L 365 310 Z", cx: 385, cy: 292 },
    { uf: "PI", path: "M 330 240 L 365 240 L 365 295 L 330 295 Z", cx: 347, cy: 267 },
    { uf: "RJ", path: "M 365 430 L 390 430 L 390 450 L 365 450 Z", cx: 377, cy: 440 },
    { uf: "RN", path: "M 390 240 L 415 240 L 415 258 L 390 258 Z", cx: 402, cy: 249 },
    { uf: "RS", path: "M 270 475 L 315 475 L 315 520 L 270 520 Z", cx: 292, cy: 497 },
    { uf: "RO", path: "M 165 315 L 205 315 L 205 355 L 165 355 Z", cx: 185, cy: 335 },
    { uf: "RR", path: "M 160 90 L 205 90 L 205 165 L 160 165 Z", cx: 182, cy: 127 },
    { uf: "SC", path: "M 300 460 L 350 460 L 350 490 L 300 490 Z", cx: 325, cy: 475 },
    { uf: "SP", path: "M 320 420 L 370 420 L 370 460 L 320 460 Z", cx: 345, cy: 440 },
    { uf: "SE", path: "M 400 305 L 418 305 L 418 320 L 400 320 Z", cx: 409, cy: 312 },
    { uf: "TO", path: "M 305 280 L 335 280 L 335 340 L 305 340 Z", cx: 320, cy: 310 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Distribuição de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox="0 0 480 560" className="w-full h-auto max-w-md mx-auto">
            {/* Estados */}
            {estados.map((estado) => (
              <g key={estado.uf}>
                <path
                  d={estado.path}
                  fill={getColor(estado.uf)}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer hover:opacity-80"
                  onMouseEnter={() => setHoveredState(estado.uf)}
                  onMouseLeave={() => setHoveredState(null)}
                />
                <text
                  x={estado.cx}
                  y={estado.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold pointer-events-none"
                  fill="hsl(var(--background))"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {estado.uf}
                </text>
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredData && (
            <div className="absolute top-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-10">
              <p className="font-bold text-lg">{hoveredData.uf}</p>
              <p className="text-sm text-muted-foreground">
                {hoveredData.count} {hoveredData.count === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          )}

          {/* Legenda */}
          <div className="mt-4 flex flex-wrap items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 100%, 85%)" }} />
              <span className="text-xs">Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 100%, 70%)" }} />
              <span className="text-xs">Média-Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 100%, 60%)" }} />
              <span className="text-xs">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 100%, 50%)" }} />
              <span className="text-xs">Média-Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <span className="text-xs">Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(var(--muted))" }} />
              <span className="text-xs">Sem dados</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
