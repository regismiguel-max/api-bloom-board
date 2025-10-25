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
    if (intensity > 0.8) return "hsl(210, 90%, 45%)";
    if (intensity > 0.6) return "hsl(210, 85%, 55%)";
    if (intensity > 0.4) return "hsl(210, 80%, 65%)";
    if (intensity > 0.2) return "hsl(210, 75%, 75%)";
    return "hsl(210, 70%, 85%)";
  };

  const hoveredData = hoveredState ? {
    uf: hoveredState,
    count: ufMap.get(hoveredState) || 0
  } : null;

  // Coordenadas geográficas simplificadas dos estados brasileiros
  const estados = [
    { uf: "RR", path: "M 180 40 L 220 30 L 240 60 L 230 100 L 200 110 L 175 95 L 170 70 Z", cx: 205, cy: 70 },
    { uf: "AP", path: "M 250 50 L 285 45 L 295 75 L 285 105 L 260 100 L 245 80 Z", cx: 270, cy: 75 },
    { uf: "AM", path: "M 80 130 L 180 120 L 200 140 L 210 180 L 195 240 L 170 270 L 130 285 L 90 275 L 70 240 L 65 180 Z", cx: 135, cy: 205 },
    { uf: "PA", path: "M 210 130 L 290 115 L 310 140 L 320 180 L 315 220 L 285 245 L 250 250 L 210 240 L 200 200 L 205 160 Z", cx: 260, cy: 185 },
    { uf: "MA", path: "M 320 170 L 365 160 L 385 185 L 385 220 L 370 245 L 340 250 L 320 235 Z", cx: 355, cy: 205 },
    { uf: "PI", path: "M 340 245 L 370 240 L 385 260 L 385 295 L 365 310 L 345 305 L 335 275 Z", cx: 360, cy: 275 },
    { uf: "CE", path: "M 385 190 L 420 185 L 435 205 L 435 230 L 420 245 L 390 240 Z", cx: 412, cy: 217 },
    { uf: "RN", path: "M 420 235 L 445 230 L 455 245 L 450 260 L 425 258 Z", cx: 437, cy: 247 },
    { uf: "PB", path: "M 425 258 L 450 255 L 455 270 L 445 280 L 425 278 Z", cx: 440, cy: 268 },
    { uf: "PE", path: "M 385 250 L 425 245 L 440 265 L 440 290 L 420 305 L 390 300 L 380 275 Z", cx: 410, cy: 278 },
    { uf: "AL", path: "M 420 300 L 440 295 L 445 315 L 435 330 L 418 328 Z", cx: 432, cy: 315 },
    { uf: "SE", path: "M 418 323 L 435 320 L 440 335 L 430 345 L 415 343 Z", cx: 427, cy: 333 },
    { uf: "BA", path: "M 345 305 L 390 295 L 420 310 L 430 340 L 425 375 L 400 405 L 370 415 L 340 410 L 320 385 L 315 345 L 325 320 Z", cx: 370, cy: 355 },
    { uf: "TO", path: "M 315 250 L 345 245 L 355 275 L 355 320 L 340 350 L 320 355 L 305 330 L 300 280 Z", cx: 327, cy: 300 },
    { uf: "MT", path: "M 200 250 L 285 240 L 310 260 L 315 310 L 305 350 L 280 370 L 245 375 L 210 365 L 190 330 L 185 280 Z", cx: 255, cy: 305 },
    { uf: "RO", path: "M 135 285 L 175 275 L 195 295 L 195 330 L 175 350 L 145 355 L 125 340 L 120 310 Z", cx: 155, cy: 318 },
    { uf: "AC", path: "M 65 270 L 95 265 L 110 285 L 110 310 L 90 325 L 65 320 L 55 295 Z", cx: 82, cy: 295 },
    { uf: "GO", path: "M 305 350 L 340 345 L 355 365 L 355 395 L 340 410 L 315 410 L 295 395 L 290 370 Z", cx: 322, cy: 378 },
    { uf: "DF", path: "M 338 367 L 345 365 L 348 372 L 345 378 L 338 376 Z", cx: 342, cy: 371 },
    { uf: "MS", path: "M 245 375 L 290 370 L 305 390 L 305 425 L 285 445 L 255 450 L 230 440 L 220 410 L 225 390 Z", cx: 262, cy: 412 },
    { uf: "MG", path: "M 315 405 L 370 410 L 400 425 L 410 455 L 400 480 L 370 485 L 335 480 L 310 465 L 305 435 Z", cx: 355, cy: 447 },
    { uf: "ES", path: "M 400 475 L 415 470 L 425 485 L 420 500 L 405 505 L 395 495 Z", cx: 410, cy: 487 },
    { uf: "RJ", path: "M 370 485 L 405 480 L 415 495 L 410 515 L 390 520 L 365 510 L 360 495 Z", cx: 387, cy: 500 },
    { uf: "SP", path: "M 305 460 L 365 455 L 390 470 L 390 500 L 370 515 L 340 520 L 310 510 L 295 485 Z", cx: 342, cy: 487 },
    { uf: "PR", path: "M 285 505 L 340 500 L 365 515 L 365 540 L 340 550 L 305 545 L 280 530 Z", cx: 320, cy: 527 },
    { uf: "SC", path: "M 305 545 L 350 540 L 370 555 L 365 575 L 340 580 L 310 572 L 300 560 Z", cx: 335, cy: 562 },
    { uf: "RS", path: "M 280 575 L 320 570 L 340 585 L 340 615 L 320 635 L 285 640 L 260 625 L 255 595 Z", cx: 300, cy: 607 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Distribuição de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg viewBox="0 0 500 680" className="w-full h-auto max-w-lg mx-auto" style={{ maxHeight: '600px' }}>
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
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 70%, 85%)" }} />
              <span className="text-xs">Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 75%, 75%)" }} />
              <span className="text-xs">Média-Baixa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 80%, 65%)" }} />
              <span className="text-xs">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 85%, 55%)" }} />
              <span className="text-xs">Média-Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(210, 90%, 45%)" }} />
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
