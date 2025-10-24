import { Cliente } from "@/hooks/useClientes";
import { Venda } from "@/hooks/useVendas";

// Dados de demonstração caso a API retorne vazio
export const mockClientes: Cliente[] = [
  { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(11) 98765-4321" },
  { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(11) 98765-1234" },
  { id: 3, nome: "Pedro Oliveira", email: "pedro@email.com", telefone: "(21) 98765-5678" },
  { id: 4, nome: "Ana Costa", email: "ana@email.com", telefone: "(31) 98765-9012" },
  { id: 5, nome: "Carlos Souza", email: "carlos@email.com", telefone: "(41) 98765-3456" },
  { id: 6, nome: "Beatriz Lima", email: "beatriz@email.com", telefone: "(51) 98765-7890" },
  { id: 7, nome: "Rafael Alves", email: "rafael@email.com", telefone: "(61) 98765-2345" },
  { id: 8, nome: "Juliana Rocha", email: "juliana@email.com", telefone: "(71) 98765-6789" },
];

export const mockVendas: Venda[] = [
  { id: 1, cliente_id: 1, valor: 1500.00, data: "2025-01-15", status: "completed", categoria: "Eletrônicos", produto: "Notebook" },
  { id: 2, cliente_id: 2, valor: 850.00, data: "2025-01-18", status: "completed", categoria: "Moda", produto: "Tênis" },
  { id: 3, cliente_id: 3, valor: 2300.00, data: "2025-02-05", status: "pending", categoria: "Eletrônicos", produto: "Smartphone" },
  { id: 4, cliente_id: 1, valor: 450.00, data: "2025-02-10", status: "completed", categoria: "Casa", produto: "Cadeira Gamer" },
  { id: 5, cliente_id: 4, valor: 3200.00, data: "2025-02-20", status: "processing", categoria: "Eletrônicos", produto: "TV 55\"" },
  { id: 6, cliente_id: 5, valor: 670.00, data: "2025-03-01", status: "completed", categoria: "Moda", produto: "Jaqueta" },
  { id: 7, cliente_id: 2, valor: 1890.00, data: "2025-03-08", status: "completed", categoria: "Esportes", produto: "Bicicleta" },
  { id: 8, cliente_id: 6, valor: 540.00, data: "2025-03-15", status: "completed", categoria: "Livros", produto: "Coleção Técnica" },
  { id: 9, cliente_id: 7, valor: 2100.00, data: "2025-04-02", status: "completed", categoria: "Eletrônicos", produto: "Tablet" },
  { id: 10, cliente_id: 3, valor: 780.00, data: "2025-04-10", status: "pending", categoria: "Casa", produto: "Aspirador" },
  { id: 11, cliente_id: 8, valor: 4200.00, data: "2025-04-18", status: "completed", categoria: "Eletrônicos", produto: "MacBook" },
  { id: 12, cliente_id: 4, valor: 920.00, data: "2025-05-05", status: "completed", categoria: "Moda", produto: "Relógio" },
  { id: 13, cliente_id: 5, valor: 1560.00, data: "2025-05-12", status: "processing", categoria: "Esportes", produto: "Esteira" },
  { id: 14, cliente_id: 1, valor: 3800.00, data: "2025-05-20", status: "completed", categoria: "Eletrônicos", produto: "PC Gamer" },
  { id: 15, cliente_id: 6, valor: 650.00, data: "2025-06-01", status: "completed", categoria: "Casa", produto: "Ventilador" },
  { id: 16, cliente_id: 2, valor: 2400.00, data: "2025-06-08", status: "completed", categoria: "Eletrônicos", produto: "Console" },
  { id: 17, cliente_id: 7, valor: 890.00, data: "2025-06-15", status: "pending", categoria: "Livros", produto: "E-reader" },
  { id: 18, cliente_id: 3, valor: 1200.00, data: "2025-06-22", status: "completed", categoria: "Moda", produto: "Bolsa" },
  { id: 19, cliente_id: 8, valor: 5500.00, data: "2025-07-05", status: "completed", categoria: "Eletrônicos", produto: "iMac" },
  { id: 20, cliente_id: 4, valor: 720.00, data: "2025-07-12", status: "completed", categoria: "Esportes", produto: "Kit Musculação" },
  { id: 21, cliente_id: 5, valor: 2900.00, data: "2025-08-01", status: "processing", categoria: "Eletrônicos", produto: "Câmera" },
  { id: 22, cliente_id: 1, valor: 980.00, data: "2025-08-10", status: "completed", categoria: "Casa", produto: "Cafeteira" },
  { id: 23, cliente_id: 6, valor: 1450.00, data: "2025-09-05", status: "completed", categoria: "Moda", produto: "Terno" },
  { id: 24, cliente_id: 2, valor: 3100.00, data: "2025-09-15", status: "completed", categoria: "Eletrônicos", produto: "Drone" },
  { id: 25, cliente_id: 7, valor: 840.00, data: "2025-10-01", status: "pending", categoria: "Livros", produto: "Box Coleção" },
  { id: 26, cliente_id: 3, valor: 2600.00, data: "2025-10-10", status: "completed", categoria: "Eletrônicos", produto: "Headset" },
  { id: 27, cliente_id: 8, valor: 1100.00, data: "2025-10-18", status: "completed", categoria: "Esportes", produto: "Smartwatch" },
];
