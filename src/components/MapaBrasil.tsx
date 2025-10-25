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

  // Coordenadas simplificadas dos estados brasileiros para o SVG
  const estados = [
    { uf: "AC", path: "M 50 250 L 80 250 L 80 280 L 50 280 Z", cx: 65, cy: 265 },
    { uf: "AL", path: "M 420 320 L 440 320 L 440 340 L 420 340 Z", cx: 430, cy: 330 },
    { uf: "AP", path: "M 280 50 L 310 50 L 310 80 L 280 80 Z", cx: 295, cy: 65 },
    { uf: "AM", path: "M 80 150 L 180 150 L 180 280 L 80 280 Z", cx: 130, cy: 215 },
    { uf: "BA", path: "M 350 270 L 430 270 L 430 370 L 350 370 Z", cx: 390, cy: 320 },
    { uf: "CE", path: "M 380 200 L 420 200 L 420 240 L 380 240 Z", cx: 400, cy: 220 },
    { uf: "DF", path: "M 340 330 L 350 330 L 350 340 L 340 340 Z", cx: 345, cy: 335 },
    { uf: "ES", path: "M 380 390 L 400 390 L 400 410 L 380 410 Z", cx: 390, cy: 400 },
    { uf: "GO", path: "M 310 320 L 360 320 L 360 380 L 310 380 Z", cx: 335, cy: 350 },
    { uf: "MA", path: "M 320 180 L 380 180 L 380 250 L 320 250 Z", cx: 350, cy: 215 },
    { uf: "MT", path: "M 230 250 L 310 250 L 310 350 L 230 350 Z", cx: 270, cy: 300 },
    { uf: "MS", path: "M 240 360 L 310 360 L 310 430 L 240 430 Z", cx: 275, cy: 395 },
    { uf: "MG", path: "M 330 360 L 390 360 L 390 420 L 330 420 Z", cx: 360, cy: 390 },
    { uf: "PA", path: "M 200 120 L 320 120 L 320 230 L 200 230 Z", cx: 260, cy: 175 },
    { uf: "PB", path: "M 420 240 L 445 240 L 445 260 L 420 260 Z", cx: 432, cy: 250 },
    { uf: "PR", path: "M 280 430 L 340 430 L 340 470 L 280 470 Z", cx: 310, cy: 450 },
    { uf: "PE", path: "M 380 250 L 420 250 L 420 290 L 380 290 Z", cx: 400, cy: 270 },
    { uf: "PI", path: "M 340 210 L 380 210 L 380 270 L 340 270 Z", cx: 360, cy: 240 },
    { uf: "RJ", path: "M 390 410 L 420 410 L 420 440 L 390 440 Z", cx: 405, cy: 425 },
    { uf: "RN", path: "M 410 220 L 440 220 L 440 240 L 410 240 Z", cx: 425, cy: 230 },
    { uf: "RS", path: "M 260 480 L 320 480 L 320 530 L 260 530 Z", cx: 290, cy: 505 },
    { uf: "RO", path: "M 150 280 L 200 280 L 200 340 L 150 340 Z", cx: 175, cy: 310 },
    { uf: "RR", path: "M 150 30 L 200 30 L 200 120 L 150 120 Z", cx: 175, cy: 75 },
    { uf: "SC", path: "M 290 470 L 350 470 L 350 500 L 290 500 Z", cx: 320, cy: 485 },
    { uf: "SP", path: "M 320 420 L 380 420 L 380 470 L 320 470 Z", cx: 350, cy: 445 },
    { uf: "SE", path: "M 410 290 L 430 290 L 430 310 L 410 310 Z", cx: 420, cy: 300 },
    { uf: "TO", path: "M 300 250 L 340 250 L 340 320 L 300 320 Z", cx: 320, cy: 285 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Distribuição de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox="0 0 500 560" className="w-full h-auto">
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
