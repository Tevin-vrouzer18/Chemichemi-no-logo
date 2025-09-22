import Dexie, { Table } from 'dexie';

// Types for the database
export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
  createdAt: Date;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
  loyaltyPoints: number;
  totalVisits: number;
  createdAt: Date;
}

export interface Vehicle {
  id?: number;
  customerId: number;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
}

export interface Service {
  id?: number;
  name: string;
  description: string;
  price: number; // in KES
  duration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
}

export interface Appointment {
  id?: number;
  customerId: number;
  serviceId: number;
  vehicleId: number;
  dateTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number; // in KES
  notes?: string;
  createdAt: Date;
}

export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number; // in KES
  isActive: boolean;
  createdAt: Date;
}

export interface Expense {
  id?: number;
  category: string;
  description: string;
  amount: number; // in KES
  date: Date;
  employeeId?: number;
  receipt?: string;
  createdAt: Date;
}

export interface InventoryItem {
  id?: number;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  costPerUnit: number; // in KES
  supplier?: string;
  lastRestocked: Date;
}

export interface Payment {
  id?: number;
  appointmentId: number;
  amount: number; // in KES
  method: 'cash' | 'card' | 'mobile' | 'bank';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  date: Date;
}

export interface Feedback {
  id?: number;
  customerId: number;
  appointmentId: number;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface DailyMetrics {
  id?: number;
  date: Date;
  revenue: number; // in KES
  expenses: number; // in KES
  washCount: number;
  customerCount: number;
  averageRating: number;
  netProfit: number; // calculated
}

// Database class
export class ChemichemieDB extends Dexie {
  users!: Table<User>;
  customers!: Table<Customer>;
  vehicles!: Table<Vehicle>;
  services!: Table<Service>;
  appointments!: Table<Appointment>;
  employees!: Table<Employee>;
  expenses!: Table<Expense>;
  inventory!: Table<InventoryItem>;
  payments!: Table<Payment>;
  feedback!: Table<Feedback>;
  dailyMetrics!: Table<DailyMetrics>;

  constructor() {
    super('ChemichemieDB');
    
    this.version(1).stores({
      users: '++id, email, role',
      customers: '++id, email, phone, name',
      vehicles: '++id, customerId, plateNumber',
      services: '++id, name, isActive',
      appointments: '++id, customerId, serviceId, dateTime, status',
      employees: '++id, email, isActive',
      expenses: '++id, category, date',
      inventory: '++id, name, category',
      payments: '++id, appointmentId, status, date',
      feedback: '++id, customerId, appointmentId, date',
      dailyMetrics: '++id, date'
    });
  }

  // Helper methods
  async getCurrentUser(): Promise<User | undefined> {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return undefined;
    return await this.users.get(parseInt(userId));
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.users.where('email').equals(email).first();
    if (user && user.password === password) {
      localStorage.setItem('currentUserId', user.id!.toString());
      return user;
    }
    return null;
  }

  async register(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      createdAt: new Date()
    };
    const id = await this.users.add(newUser);
    return { ...newUser, id };
  }

  logout() {
    localStorage.removeItem('currentUserId');
  }

  // Calculate daily metrics
  async calculateDailyMetrics(date: Date): Promise<DailyMetrics> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get appointments for the day
    const appointments = await this.appointments
      .where('dateTime')
      .between(startOfDay, endOfDay)
      .and(appointment => appointment.status === 'completed')
      .toArray();

    // Get expenses for the day
    const expenses = await this.expenses
      .where('date')
      .between(startOfDay, endOfDay)
      .toArray();

    // Get payments for the day
    const payments = await this.payments
      .where('date')
      .between(startOfDay, endOfDay)
      .and(payment => payment.status === 'completed')
      .toArray();

    // Get feedback for the day
    const feedbackList = await this.feedback
      .where('date')
      .between(startOfDay, endOfDay)
      .toArray();

    const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const washCount = appointments.length;
    const customerCount = new Set(appointments.map(apt => apt.customerId)).size;
    const averageRating = feedbackList.length > 0 
      ? feedbackList.reduce((sum, fb) => sum + fb.rating, 0) / feedbackList.length 
      : 0;
    const netProfit = revenue - totalExpenses;

    return {
      date,
      revenue,
      expenses: totalExpenses,
      washCount,
      customerCount,
      averageRating,
      netProfit
    };
  }

  // Get business growth data
  async getGrowthData(days: number = 30): Promise<DailyMetrics[]> {
    const data: DailyMetrics[] = [];
    const endDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const metrics = await this.calculateDailyMetrics(date);
      data.push(metrics);
    }
    
    return data;
  }
}

// Export database instance
export const db = new ChemichemieDB();

// Seed initial data
export async function seedData() {
  // Add default admin user if no users exist
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.add({
      email: 'admin@chemichemi.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    });
  }

  // Add default services if none exist
  const serviceCount = await db.services.count();
  if (serviceCount === 0) {
    const defaultServices = [
      { name: 'Basic Wash', description: 'Exterior wash only', price: 500, duration: 30, isActive: true, createdAt: new Date() },
      { name: 'Standard Wash', description: 'Exterior wash + interior cleaning', price: 800, duration: 45, isActive: true, createdAt: new Date() },
      { name: 'Premium Wash', description: 'Full service with wax', price: 1200, duration: 60, isActive: true, createdAt: new Date() },
      { name: 'Deluxe Wash', description: 'Premium + tire shine + air freshener', price: 1500, duration: 75, isActive: true, createdAt: new Date() }
    ];
    await db.services.bulkAdd(defaultServices);
  }

  // Add sample inventory items
  const inventoryCount = await db.inventory.count();
  if (inventoryCount === 0) {
    const defaultInventory = [
      { name: 'Car Soap', category: 'Cleaning', currentStock: 50, minimumStock: 10, unit: 'bottles', costPerUnit: 200, supplier: 'CleanCorp', lastRestocked: new Date() },
      { name: 'Car Wax', category: 'Detailing', currentStock: 25, minimumStock: 5, unit: 'bottles', costPerUnit: 350, supplier: 'WaxPro', lastRestocked: new Date() },
      { name: 'Microfiber Cloths', category: 'Tools', currentStock: 100, minimumStock: 20, unit: 'pieces', costPerUnit: 50, supplier: 'ToolMart', lastRestocked: new Date() },
      { name: 'Tire Shine', category: 'Detailing', currentStock: 15, minimumStock: 5, unit: 'bottles', costPerUnit: 300, supplier: 'ShineBrite', lastRestocked: new Date() }
    ];
    await db.inventory.bulkAdd(defaultInventory);
  }
}