export type PatientData = {
    id: string;
    name: string;
    age: number;
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
export type ActionData = {
    action: string;
    timestamp: Date;
}
export type NotificationHistory = {
    notificationId: string;
    actions: ActionData[]
}