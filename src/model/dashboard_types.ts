export type DoctorData = {
    id: string;
    name: string;
    patient_ids: string[];
}
export type PatientData = {
    id: string;
    name: string;
    age: number;
    doctor_ids: string[];
    lastHeartRateValues: number[];
    weight: number;
    height: number;
}
export type NotificationData = {
    id: string;
    patientId: string;
    message: string;
    timestamp: Date;
    type: string;
    severity: string;
    status: string;
}
export const actionOptions = ["ACKNOWLEDGED", "RESOLVED", "ESCALATED", "IGNORED", "IN_CONSULTING"] as const;
export type ActionOption = (typeof actionOptions)[number];

export type ActionData = {
    action: ActionOption;
    timestamp: Date;
    report: string;
    doctor_id: string
}
export type NotificationHistory = {
    notificationId: string;
    actions: ActionData[]
}