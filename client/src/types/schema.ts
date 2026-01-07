import { z } from "zod";

export interface User {
    id: number;
    username: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    barNumber: string | null;
    practiceAreas: string | null;
    createdAt: string;
}

export const insertUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().optional().nullable(),
    email: z.string().email("Invalid email address").optional().nullable(),
    phone: z.string().optional().nullable(),
    barNumber: z.string().optional().nullable(),
    practiceAreas: z.string().optional().nullable(),
});

export interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
    cases?: Array<{ id: number; title: string; caseNumber: string | null }>;
    createdAt: string;
}

export const insertClientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
    phone: z.string().optional().nullable().or(z.literal("")),
    address: z.string().optional().nullable().or(z.literal("")),
    status: z.string().default("active"),
});

export interface CaseDocument {
    id: number;
    case: number;
    file: string;
    title: string;
    uploadedAt: string;
}

export interface CaseType {
    id: number;
    name: string;
    code: string | null;
}

export interface Case {
    id: number;
    title: string;
    caseNumber: string | null;
    caseType: number | null;
    type_details?: CaseType;
    status: string;
    priority: string;
    description: string | null;
    clientId: number | null;
    nic: string | null;
    createdAt: string;
    updatedAt: string;
    documents?: CaseDocument[];
    reminders?: Array<{ id: number; title: string; dueDate: string }>;
}

export const insertCaseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    caseNumber: z.string().optional().nullable().or(z.literal("")),
    nic: z.string().optional().nullable().or(z.literal("")),
    caseType: z.number().min(1, "Case type is required"),
    status: z.string().default("active"),
    priority: z.string().default("medium"),
    description: z.string().optional().nullable().or(z.literal("")),
    clientId: z.number().optional().nullable(),
});

export interface Reminder {
    id: number;
    title: string;
    description: string | null;
    dueDate: string | Date;
    location: string | null;
    type: string;
    priority: string;
    completed: boolean;
    caseId: number | null;
    createdAt: string;
}

export const insertReminderSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable().or(z.literal("")),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ required_error: "Due date is required" })),
    location: z.string().optional().nullable().or(z.literal("")),
    type: z.string().default("general"),
    priority: z.string().default("medium"),
    completed: z.boolean().default(false),
    caseId: z.number().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export interface CaseWithClient extends Case {
    client?: Client;
}

export interface ReminderWithCase extends Reminder {
    case?: Case;
}

export interface DashboardStats {
    totalCases: number;
    activeCases: number;
    totalClients: number;
    pendingReminders: number;
}
