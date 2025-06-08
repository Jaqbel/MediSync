import { users, patients, medications, treatmentHistory, type User, type InsertUser, type Patient, type InsertPatient, type Medication, type InsertMedication, type TreatmentHistory, type InsertTreatmentHistory } from "@shared/schema";
import { eq, and, desc, lt, lte } from "drizzle-orm";

// Temporary in-memory storage for demo purposes
class MemoryStorage {
  public users: User[] = [];
  public patients: Patient[] = [];
  public medications: Medication[] = [];
  public treatmentHistory: TreatmentHistory[] = [];
  public nextUserId = 1;
  public nextPatientId = 1;
  public nextMedicationId = 1;
  public nextTreatmentHistoryId = 1;

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Add demo users
    this.users.push(
      {
        id: 1,
        username: 'demo_doctor',
        email: 'demo@medisync.com',
        passwordHash: '$2b$10$sAJd1LxCiLVd1u4ex0gR3e/SXyuCaU1DEa6qA0yX3WHU29FAsUHxW', // demo123
        name: 'Dr. Demo User',
        createdAt: new Date(),
      },
      {
        id: 2,
        username: 'admin_user',
        email: 'admin@medisync.com',
        passwordHash: '$2b$10$sAJd1LxCiLVd1u4ex0gR3e/SXyuCaU1DEa6qA0yX3WHU29FAsUHxW', // demo123
        name: 'Dr. Sarah Admin',
        createdAt: new Date(),
      }
    );

    // Add demo patients
    this.patients.push(
      {
        id: 1,
        userId: 1,
        name: 'John Smith',
        phone: '+1-555-0123',
        email: 'john.smith@email.com',
        dateOfBirth: '1980-05-15',
        medicalHistory: 'Hypertension, controlled with medication. No known allergies.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        name: 'Sarah Johnson',
        phone: '+1-555-0124',
        email: 'sarah.j@email.com',
        dateOfBirth: '1975-03-22',
        medicalHistory: 'Type 2 diabetes, well-managed. Regular checkups required.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        name: 'Michael Brown',
        phone: '+1-555-0125',
        email: 'mbrown@email.com',
        dateOfBirth: '1990-11-08',
        medicalHistory: 'Asthma, uses inhaler as needed. Allergic to penicillin.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        userId: 1,
        name: 'Emily Davis',
        phone: '+1-555-0126',
        email: 'emily.davis@email.com',
        dateOfBirth: '1985-07-30',
        medicalHistory: 'Recent surgery recovery. Follow-up in 2 weeks.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    // Add demo medications
    this.medications.push(
      {
        id: 1,
        userId: 1,
        name: 'Lisinopril 10mg',
        brand: 'Prinivil',
        category: 'heart-medication',
        quantity: 120,
        minStock: 20,
        expirationDate: '2025-08-15',
        notes: 'ACE inhibitor for hypertension',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        name: 'Metformin 500mg',
        brand: 'Glucophage',
        category: 'diabetes',
        quantity: 90,
        minStock: 15,
        expirationDate: '2025-06-20',
        notes: 'For type 2 diabetes management',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        name: 'Albuterol Inhaler',
        brand: 'ProAir HFA',
        category: 'respiratory',
        quantity: 5,
        minStock: 2,
        expirationDate: '2025-01-10',
        notes: 'Rescue inhaler for asthma - expiring soon',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        userId: 1,
        name: 'Amoxicillin 500mg',
        brand: 'Amoxil',
        category: 'antibiotics',
        quantity: 8,
        minStock: 10,
        expirationDate: '2025-05-30',
        notes: 'Broad-spectrum antibiotic - low stock',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        userId: 1,
        name: 'Ibuprofen 200mg',
        brand: 'Advil',
        category: 'pain-relief',
        quantity: 150,
        minStock: 25,
        expirationDate: '2026-03-15',
        notes: 'Over-the-counter pain reliever',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    this.nextUserId = 3;
    this.nextPatientId = 5;
    this.nextMedicationId = 6;
    this.nextTreatmentHistoryId = 1;
  }
}

const memoryDb = new MemoryStorage();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patient methods
  getPatients(userId: number): Promise<Patient[]>;
  getPatient(id: number, userId: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, userId: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number, userId: number): Promise<boolean>;

  // Medication methods
  getMedications(userId: number): Promise<Medication[]>;
  getMedication(id: number, userId: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, userId: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number, userId: number): Promise<boolean>;

  // Treatment History methods
  getTreatmentHistory(patientId: number, userId: number): Promise<TreatmentHistory[]>;
  getTreatmentHistoryRecord(id: number, userId: number): Promise<TreatmentHistory | undefined>;
  createTreatmentHistory(treatment: InsertTreatmentHistory): Promise<TreatmentHistory>;
  updateTreatmentHistory(id: number, userId: number, treatment: Partial<InsertTreatmentHistory>): Promise<TreatmentHistory | undefined>;
  deleteTreatmentHistory(id: number, userId: number): Promise<boolean>;

  // Dashboard analytics
  getDashboardStats(userId: number): Promise<{
    totalPatients: number;
    totalMedications: number;
    lowStockCount: number;
    expiringSoonCount: number;
  }>;
  
  getLowStockMedications(userId: number): Promise<Medication[]>;
  getExpiringSoonMedications(userId: number, days?: number): Promise<Medication[]>;
}

export class MemoryDatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return memoryDb.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return memoryDb.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    const newUser: User = {
      id: memoryDb.nextUserId++,
      ...user,
      createdAt: new Date(),
    };
    memoryDb.users.push(newUser);
    return newUser;
  }

  async getPatients(userId: number): Promise<Patient[]> {
    return memoryDb.patients
      .filter(patient => patient.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPatient(id: number, userId: number): Promise<Patient | undefined> {
    return memoryDb.patients.find(patient => patient.id === id && patient.userId === userId);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const newPatient: Patient = {
      id: memoryDb.nextPatientId++,
      ...patient,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryDb.patients.push(newPatient);
    return newPatient;
  }

  async updatePatient(id: number, userId: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const index = memoryDb.patients.findIndex(p => p.id === id && p.userId === userId);
    if (index === -1) return undefined;
    
    memoryDb.patients[index] = {
      ...memoryDb.patients[index],
      ...patient,
      updatedAt: new Date(),
    };
    return memoryDb.patients[index];
  }

  async deletePatient(id: number, userId: number): Promise<boolean> {
    const index = memoryDb.patients.findIndex(p => p.id === id && p.userId === userId);
    if (index === -1) return false;
    
    memoryDb.patients.splice(index, 1);
    return true;
  }

  async getMedications(userId: number): Promise<Medication[]> {
    return memoryDb.medications
      .filter(medication => medication.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMedication(id: number, userId: number): Promise<Medication | undefined> {
    return memoryDb.medications.find(medication => medication.id === id && medication.userId === userId);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const newMedication: Medication = {
      id: memoryDb.nextMedicationId++,
      ...medication,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryDb.medications.push(newMedication);
    return newMedication;
  }

  async updateMedication(id: number, userId: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const index = memoryDb.medications.findIndex(m => m.id === id && m.userId === userId);
    if (index === -1) return undefined;
    
    memoryDb.medications[index] = {
      ...memoryDb.medications[index],
      ...medication,
      updatedAt: new Date(),
    };
    return memoryDb.medications[index];
  }

  async deleteMedication(id: number, userId: number): Promise<boolean> {
    const index = memoryDb.medications.findIndex(m => m.id === id && m.userId === userId);
    if (index === -1) return false;
    
    memoryDb.medications.splice(index, 1);
    return true;
  }

  async getDashboardStats(userId: number): Promise<{
    totalPatients: number;
    totalMedications: number;
    lowStockCount: number;
    expiringSoonCount: number;
  }> {
    const patientCount = memoryDb.patients.filter(p => p.userId === userId);
    const medicationCount = memoryDb.medications.filter(m => m.userId === userId);
    
    const lowStockMeds = await this.getLowStockMedications(userId);
    const expiringSoonMeds = await this.getExpiringSoonMedications(userId);

    return {
      totalPatients: patientCount.length,
      totalMedications: medicationCount.length,
      lowStockCount: lowStockMeds.length,
      expiringSoonCount: expiringSoonMeds.length,
    };
  }

  async getLowStockMedications(userId: number): Promise<Medication[]> {
    return memoryDb.medications.filter(medication => 
      medication.userId === userId && medication.quantity <= medication.minStock
    );
  }

  async getExpiringSoonMedications(userId: number, days: number = 30): Promise<Medication[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureString = futureDate.toISOString().split('T')[0];
    
    return memoryDb.medications.filter(medication => 
      medication.userId === userId && medication.expirationDate < futureString
    );
  }

  // Treatment History methods
  async getTreatmentHistory(patientId: number, userId: number): Promise<TreatmentHistory[]> {
    return memoryDb.treatmentHistory
      .filter(treatment => treatment.patientId === patientId && treatment.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTreatmentHistoryRecord(id: number, userId: number): Promise<TreatmentHistory | undefined> {
    return memoryDb.treatmentHistory.find(treatment => treatment.id === id && treatment.userId === userId);
  }

  async createTreatmentHistory(treatment: InsertTreatmentHistory): Promise<TreatmentHistory> {
    const newTreatment: TreatmentHistory = {
      ...treatment,
      id: memoryDb.nextTreatmentHistoryId++,
      date: typeof treatment.date === 'string' ? new Date(treatment.date) : treatment.date,
      photoUrls: treatment.photoUrls || [],
      notes: treatment.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryDb.treatmentHistory.push(newTreatment);
    return newTreatment;
  }

  async updateTreatmentHistory(id: number, userId: number, treatment: Partial<InsertTreatmentHistory>): Promise<TreatmentHistory | undefined> {
    const index = memoryDb.treatmentHistory.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return undefined;

    const existing = memoryDb.treatmentHistory[index];
    const updated = {
      ...existing,
      ...treatment,
      date: treatment.date ? (typeof treatment.date === 'string' ? new Date(treatment.date) : treatment.date) : existing.date,
      updatedAt: new Date(),
    };

    memoryDb.treatmentHistory[index] = updated;
    return updated;
  }

  async deleteTreatmentHistory(id: number, userId: number): Promise<boolean> {
    const index = memoryDb.treatmentHistory.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) return false;

    memoryDb.treatmentHistory.splice(index, 1);
    return true;
  }
}

export const storage = new MemoryDatabaseStorage();
