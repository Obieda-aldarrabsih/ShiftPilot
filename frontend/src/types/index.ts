export interface Task {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  address: string;
  taskType: string;
  notes: string;
  status: 'UNASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'DECLINED' | 'CANCELLED';
  slaDeadline: string;
  atRisk: boolean;
  breached: boolean;
  createdAt: string;
  completedAt: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
}

export interface Agent {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  onShift: boolean;
  currentLoad: number;
}
