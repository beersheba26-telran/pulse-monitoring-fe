import { afterEach, describe, expect, it, vi } from "vitest";

type MockNotificationDto = {
	id: string;
	patientId: string;
	message: string;
	timestamp: string;
	type: string;
	severity: string;
	status: string;
};

type MockPatientDto = {
	id: string;
	name: string;
	age: number;
	lastHeartRateValues: number[];
	weight: number;
	height: number;
	doctor_ids?: string[];
};

type MockActionDto = {
	action: string;
	report: string;
	doctor_name: string;
	timestamp: string;
};

function mockAxiosModule(client: Record<string, unknown>) {
	return {
		default: {
			create: vi.fn(() => client),
			isAxiosError: (error: unknown) =>
				typeof error === "object" && error !== null && "isAxiosError" in error,
		},
	};
}

afterEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	vi.doUnmock("axios");
});

describe("NotificationsServiceImpl", () => {
	it("returns patient notifications from the backend patient route", async () => {
		const getMock = vi.fn().mockResolvedValue({
			data: [
				{
					id: "1",
					patientId: "13",
					message: "ABnormal JUMP previous value 84 -> current value 107",
					timestamp: "2026-06-09T10:57:08.787Z",
					type: "JUMP_RATE",
					severity: "MINOR",
					status: "CREATED",
				},
			] as MockNotificationDto[],
		});

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getNotificationsPatient("13");

		expect(getMock).toHaveBeenCalledWith("/notifications/patient/13", {
			signal: undefined,
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.timestamp).toBeInstanceOf(Date);
		expect(result[0]?.timestamp.toISOString()).toBe("2026-06-09T10:57:08.787Z");
	});

	it("returns doctor notifications from the backend doctor route", async () => {
		const getMock = vi.fn().mockResolvedValue({
			data: [
				{
					id: "1",
					patientId: "13",
					message: "ABnormal JUMP previous value 84 -> current value 107",
					timestamp: "2026-06-09T10:57:08.787Z",
					type: "JUMP_RATE",
					severity: "MINOR",
					status: "CREATED",
				},
			] as MockNotificationDto[],
		});

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getNotificationsDoctor("1");

		expect(getMock).toHaveBeenCalledWith("/notifications/doctor/1", {
			signal: undefined,
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.patientId).toBe("13");
		expect(result[0]?.timestamp).toBeInstanceOf(Date);
	});

	it("returns patient by patient id", async () => {
		const patient: MockPatientDto = {
			id: "13",
			name: "Ava Lee",
			age: 62,
			lastHeartRateValues: [76, 81, 61, 105, 87],
			weight: 110,
			height: 165,
		};

		const getMock = vi.fn().mockResolvedValueOnce({ data: patient });

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getPatientByPatientId("13");

		expect(getMock).toHaveBeenCalledWith("/patient/13", {
			signal: undefined,
		});
		expect(result).toEqual(patient);
	});

	it("returns null when patient id is not found", async () => {
		const notFoundError = {
			isAxiosError: true,
			response: {
				status: 404,
			},
		};

		const getMock = vi.fn().mockRejectedValueOnce(notFoundError);

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getPatientByPatientId("999");

		expect(result).toBeNull();
	});

	it("returns patient by notification id", async () => {
		const patient: MockPatientDto = {
			id: "13",
			name: "Ava Lee",
			age: 62,
			lastHeartRateValues: [76, 81, 61, 105, 87],
			weight: 110,
			height: 165,
		};

		const getMock = vi.fn().mockResolvedValueOnce({ data: patient });

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getPatientByNotificationId("1");

		expect(getMock).toHaveBeenCalledWith("/patient/notifications/1", {
			signal: undefined,
		});
		expect(result).toEqual(patient);
	});

	it("returns null when notification id is not found", async () => {
		const notFoundError = {
			isAxiosError: true,
			response: {
				status: 404,
			},
		};

		const getMock = vi.fn().mockRejectedValueOnce(notFoundError);

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getPatientByNotificationId("999");

		expect(result).toBeNull();
	});

	it("returns notification history from the backend history route", async () => {
		const getMock = vi.fn().mockResolvedValueOnce({
			data: [
				{
					action: "ACKNOWLEDGED",
					report: "Reviewed",
					doctor_name: "Dr. Ethan Cole",
					timestamp: "2026-06-10T08:00:00.000Z",
				},
				{
					action: "RESOLVED",
					report: "Handled",
					doctor_name: "Dr. Maya Brooks",
					timestamp: "2026-06-10T09:00:00.000Z",
				},
			] as MockActionDto[],
		});

		vi.doMock("axios", () => mockAxiosModule({ get: getMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		const result = await service.getNotificationHistoryByNotificationId("1");

		expect(getMock).toHaveBeenCalledWith("/notifications/history/1", {
			signal: undefined,
		});
		expect(result).toEqual([
			{
				action: "RESOLVED",
				report: "Handled",
				doctor_name: "Dr. Maya Brooks",
				timestamp: new Date("2026-06-10T09:00:00.000Z"),
			},
			{
				action: "ACKNOWLEDGED",
				report: "Reviewed",
				doctor_name: "Dr. Ethan Cole",
				timestamp: new Date("2026-06-10T08:00:00.000Z"),
			},
		]);
	});

	it("posts an action to the backend history route", async () => {
		const postMock = vi.fn().mockResolvedValueOnce({ data: {} });

		vi.doMock("axios", () => mockAxiosModule({ post: postMock }));

		const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

		const service = new NotificationsServiceImpl();
		await service.addActionToNotification("15", {
			action: "ACKNOWLEDGED",
			report: "Seen by doctor",
			timestamp: new Date("2026-06-10T09:30:00.000Z"),
			doctor_name: "Dr. Ethan Cole",
		});

		expect(postMock).toHaveBeenCalledWith(
			"/notifications/history/15",
			{
				action: "ACKNOWLEDGED",
				report: "Seen by doctor",
				timestamp: "2026-06-10T09:30:00.000Z",
				doctor_name: "Dr. Ethan Cole",
			},
			undefined,
		);
	});
});
