import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertPatientSchema, insertMedicationSchema, insertTreatmentHistorySchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'medisync-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        passwordHash,
      });

      req.session.userId = user.id;
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/alerts", requireAuth, async (req, res) => {
    try {
      const [lowStock, expiringSoon] = await Promise.all([
        storage.getLowStockMedications(req.session.userId!),
        storage.getExpiringSoonMedications(req.session.userId!),
      ]);
      
      res.json({
        lowStock,
        expiringSoon,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getPatients(req.session.userId!);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id, req.session.userId!);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse({
        ...req.body,
        userId: req.session.userId!,
      });
      
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patientData = insertPatientSchema.partial().parse(req.body);
      
      const patient = await storage.updatePatient(id, req.session.userId!, patientData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatient(id, req.session.userId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Medication routes
  app.get("/api/medications", requireAuth, async (req, res) => {
    try {
      const medications = await storage.getMedications(req.session.userId!);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/medications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.getMedication(id, req.session.userId!);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/medications", requireAuth, async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse({
        ...req.body,
        userId: req.session.userId!,
      });
      
      const medication = await storage.createMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/medications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medicationData = insertMedicationSchema.partial().parse(req.body);
      
      const medication = await storage.updateMedication(id, req.session.userId!, medicationData);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/medications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMedication(id, req.session.userId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json({ message: "Medication deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard analytics routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.userId!);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/alerts", requireAuth, async (req, res) => {
    try {
      const [lowStock, expiringSoon] = await Promise.all([
        storage.getLowStockMedications(req.session.userId!),
        storage.getExpiringSoonMedications(req.session.userId!)
      ]);
      
      res.json({ lowStock, expiringSoon });
    } catch (error) {
      console.error("Error fetching dashboard alerts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Treatment History routes
  app.get("/api/patients/:patientId/treatments", requireAuth, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId, req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const treatments = await storage.getTreatmentHistory(patientId, req.session.userId!);
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching treatment history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients/:patientId/treatments", requireAuth, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId, req.session.userId!);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const validatedData = insertTreatmentHistorySchema.parse({
        ...req.body,
        patientId,
        userId: req.session.userId!
      });

      const treatment = await storage.createTreatmentHistory(validatedData);
      res.status(201).json(treatment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating treatment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/treatments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid treatment ID" });
      }

      const treatment = await storage.getTreatmentHistoryRecord(id, req.session.userId!);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }

      res.json(treatment);
    } catch (error) {
      console.error("Error fetching treatment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/treatments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid treatment ID" });
      }

      const treatment = await storage.updateTreatmentHistory(id, req.session.userId!, req.body);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }

      res.json(treatment);
    } catch (error) {
      console.error("Error updating treatment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/treatments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid treatment ID" });
      }

      const deleted = await storage.deleteTreatmentHistory(id, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ message: "Treatment not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting treatment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/treatments/upload-photos", requireAuth, async (req, res) => {
    try {
      const photoCount = req.body.photoCount || 1;
      const mockUrls = Array.from({ length: photoCount }, (_, i) => 
        `https://via.placeholder.com/400x300/0066cc/ffffff?text=Treatment+Photo+${i + 1}`
      );
      
      res.json({ photoUrls: mockUrls });
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
