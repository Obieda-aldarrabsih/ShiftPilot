import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { Task } from '../types';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const mockTasks: Task[] = [
  {
    id: 'task-1',
    referenceCode: 'SP-9041',
    customerName: 'Sami Al-Hassan',
    customerPhone: '+962 7 9801 2345',
    address: 'Sweifieh, Ali Nasouh St., Bldg 14',
    taskType: 'Express Delivery',
    notes: 'Fragile electronics. Handle with care.',
    status: 'UNASSIGNED',
    slaDeadline: new Date(Date.now() + 45 * 60000).toISOString(),
    atRisk: false,
    breached: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedAgentId: null,
    assignedAgentName: null
  },
  {
    id: 'task-2',
    referenceCode: 'SP-9042',
    customerName: 'Istishari Hospital Labs',
    customerPhone: '+962 7 9555 4321',
    address: 'Wadi Saqra, Medical Arts Building',
    taskType: 'Medical Urgent',
    notes: 'Cooler box temperature sensitive.',
    status: 'UNASSIGNED',
    slaDeadline: new Date(Date.now() + 20 * 60000).toISOString(),
    atRisk: true,
    breached: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedAgentId: null,
    assignedAgentName: null
  },
  {
    id: 'task-3',
    referenceCode: 'SP-9039',
    customerName: 'Ahmad & Brothers Co.',
    customerPhone: '+962 7 9123 7890',
    address: 'Sahab Industrial Estate, Block 4',
    taskType: 'Hardware Dispatch',
    notes: 'Heavy parcel. Contact receiver upon arrival.',
    status: 'ACCEPTED',
    slaDeadline: new Date(Date.now() + 75 * 60000).toISOString(),
    atRisk: false,
    breached: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedAgentId: 'agent_01',
    assignedAgentName: 'Omar Khaled'
  },
  {
    id: 'task-4',
    referenceCode: 'SP-9038',
    customerName: 'Lina Qaisi - VIP Client',
    customerPhone: '+962 7 9777 8899',
    address: 'Abdoun, Damascus St., Villa 12',
    taskType: 'Contract Clearance',
    notes: 'Signature verification required.',
    status: 'EN_ROUTE',
    slaDeadline: new Date(Date.now() + 35 * 60000).toISOString(),
    atRisk: false,
    breached: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedAgentId: 'agent_02',
    assignedAgentName: 'Zaid Nabulsi'
  },
  {
    id: 'task-5',
    referenceCode: 'SP-9035',
    customerName: 'Prime Mall Retail Store',
    customerPhone: '+962 6 580 9000',
    address: '7th Circle, Zahran St.',
    taskType: 'Store Restock',
    notes: 'Loading bay B.',
    status: 'ARRIVED',
    slaDeadline: new Date(Date.now() + 50 * 60000).toISOString(),
    atRisk: false,
    breached: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    assignedAgentId: 'agent_01',
    assignedAgentName: 'Omar Khaled'
  },
  {
    id: 'task-6',
    referenceCode: 'SP-9030',
    customerName: 'Amman Tech Hub',
    customerPhone: '+962 7 9600 1122',
    address: 'King Hussein Business Park',
    taskType: 'Server Parts Delivery',
    notes: 'Completed ahead of SLA.',
    status: 'COMPLETED',
    slaDeadline: new Date(Date.now() - 30 * 60000).toISOString(),
    atRisk: false,
    breached: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    assignedAgentId: 'agent_03',
    assignedAgentName: 'Tariq Mansoor'
  }
];

// Offline fallback for demo / UI showcase
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || '';

    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      if (url.includes('/tasks/analytics')) {
        return {
          data: {
            totalTasks: 48,
            completedTasks: 35,
            activeTasks: 9,
            unassignedTasks: 4,
            tasksByStatus: {
              'UNASSIGNED': 4,
              'ACCEPTED': 3,
              'EN_ROUTE': 4,
              'ARRIVED': 2,
              'COMPLETED': 35
            },
            completionRate: 94.2
          }
        };
      }

      if (url.includes('/tasks/agent/')) {
        return {
          data: mockTasks.filter(t => t.assignedAgentId === 'agent_01' || t.status === 'ACCEPTED' || t.status === 'ARRIVED')
        };
      }

      if (url.includes('/tasks')) {
        return {
          data: mockTasks
        };
      }
    }

    return Promise.reject(error);
  }
);
