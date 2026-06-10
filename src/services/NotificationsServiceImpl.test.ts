import { describe, expect, it, vi } from "vitest";

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
};

type MockDoctorDto = {
  id: string;
  patient_ids: string[];
};

describe("NotificationsServiceImpl", () => {
  it("returns notifications only for a specific patient", async () => {
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

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getNotificationsPatient("13");

    expect(getMock).toHaveBeenCalledWith("/notifications", {
      signal: undefined,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeDefined();
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[0].timestamp.toISOString()).toBe("2026-06-09T10:57:08.787Z");

    vi.resetModules();
  });

  it("returns doctor notifications filtered by doctor patient ids", async () => {
    const doctor: MockDoctorDto = {
      id: "1",
      patient_ids: ["13", "14"],
    };

    const notifications: MockNotificationDto[] = [
      {
        id: "1",
        patientId: "13",
        message: "ABnormal JUMP previous value 84 -> current value 107",
        timestamp: "2026-06-09T10:57:08.787Z",
        type: "JUMP_RATE",
        severity: "MINOR",
        status: "CREATED",
      },
      {
        id: "2",
        patientId: "99",
        message: "ABnormal JUMP previous value 70 -> current value 95",
        timestamp: "2026-06-09T10:56:08.787Z",
        type: "JUMP_RATE",
        severity: "MAJOR",
        status: "CREATED",
      },
    ];

    const getMock = vi
      .fn()
      .mockResolvedValueOnce({ data: doctor })
      .mockResolvedValueOnce({ data: notifications });

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
        isAxiosError: (error: unknown) =>
          typeof error === "object" && error !== null && "isAxiosError" in error,
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getNotificationsDoctor("1");

    expect(getMock).toHaveBeenNthCalledWith(1, "/doctors/1", {
      signal: undefined,
    });
    expect(getMock).toHaveBeenNthCalledWith(2, "/notifications", {
      signal: undefined,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.patientId).toBe("13");
    expect(result[0]?.timestamp).toBeInstanceOf(Date);

    vi.resetModules();
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

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
        isAxiosError: (error: unknown) =>
          typeof error === "object" && error !== null && "isAxiosError" in error,
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getPatientByPatientId("13");

    expect(getMock).toHaveBeenCalledWith("/patients/13", {
      signal: undefined,
    });
    expect(result).toEqual(patient);

    vi.resetModules();
  });

  it("returns null when patient id is not found", async () => {
    const notFoundError = {
      isAxiosError: true,
      response: {
        status: 404,
      },
    };

    const getMock = vi.fn().mockRejectedValueOnce(notFoundError);

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
        isAxiosError: (error: unknown) =>
          typeof error === "object" && error !== null && "isAxiosError" in error,
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getPatientByPatientId("999");

    expect(result).toBeNull();

    vi.resetModules();
  });

  it("returns patient by notification id", async () => {
    const notification: MockNotificationDto = {
      id: "1",
      patientId: "13",
      message: "ABnormal JUMP previous value 84 -> current value 107",
      timestamp: "2026-06-09T10:57:08.787Z",
      type: "JUMP_RATE",
      severity: "MINOR",
      status: "CREATED",
    };

    const patient: MockPatientDto = {
      id: "13",
      name: "Ava Lee",
      age: 62,
      lastHeartRateValues: [76, 81, 61, 105, 87],
      weight: 110,
      height: 165,
    };

    const getMock = vi
      .fn()
      .mockResolvedValueOnce({ data: notification })
      .mockResolvedValueOnce({ data: patient });

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
        isAxiosError: (error: unknown) =>
          typeof error === "object" && error !== null && "isAxiosError" in error,
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getPatientByNotificationId("1");

    expect(getMock).toHaveBeenNthCalledWith(1, "/notifications/1", {
      signal: undefined,
    });
    expect(getMock).toHaveBeenNthCalledWith(2, "/patients/13", {
      signal: undefined,
    });
    expect(result).toEqual(patient);

    vi.resetModules();
  });

  it("returns null when notification id is not found", async () => {
    const notFoundError = {
      isAxiosError: true,
      response: {
        status: 404,
      },
    };

    const getMock = vi.fn().mockRejectedValueOnce(notFoundError);

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
        })),
        isAxiosError: (error: unknown) =>
          typeof error === "object" && error !== null && "isAxiosError" in error,
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    const result = await service.getPatientByNotificationId("999");

    expect(result).toBeNull();

    vi.resetModules();
  });

  it("creates notification history when it does not exist", async () => {
    const getMock = vi.fn().mockResolvedValueOnce({ data: [] });
    const postMock = vi.fn().mockResolvedValueOnce({ data: {} });
    const patchMock = vi.fn();

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
          post: postMock,
          patch: patchMock,
        })),
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    await service.addActionToNotification("15", {
      action: "ACKNOWLEDGED",
      report: "Seen by doctor",
      timestamp: new Date("2026-06-10T09:30:00.000Z"),
      doctor_id: "1",
    });

    expect(getMock).toHaveBeenCalledWith("/notification_history", {
      signal: undefined,
    });
    expect(postMock).toHaveBeenCalledWith(
      "/notification_history",
      {
        notificationId: "15",
        actions: [
          {
            action: "ACKNOWLEDGED",
            report: "Seen by doctor",
            timestamp: "2026-06-10T09:30:00.000Z",
            doctor_id: "1",
          },
        ],
      },
      {
        signal: undefined,
      },
    );
    expect(patchMock).not.toHaveBeenCalled();

    vi.resetModules();
  });

  it("appends action to existing notification history", async () => {
    const getMock = vi.fn().mockResolvedValueOnce({
      data: [
        {
          id: "history-1",
          notificationId: "15",
          actions: [
            {
              action: "ACKNOWLEDGED",
              report: "Initial acknowledgement",
              timestamp: "2026-06-10T08:00:00.000Z",
            },
          ],
        },
      ],
    });
    const postMock = vi.fn();
    const patchMock = vi.fn().mockResolvedValueOnce({ data: {} });

    vi.doMock("axios", () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
          post: postMock,
          patch: patchMock,
        })),
      },
    }));

    const { default: NotificationsServiceImpl } = await import("./NotificationsServiceImpl");

    const service = new NotificationsServiceImpl();
    await service.addActionToNotification("15", {
      action: "RESOLVED",
      report: "Alert handled",
      timestamp: new Date("2026-06-10T09:45:00.000Z"),
      doctor_id: "2",
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(patchMock).toHaveBeenCalledWith(
      "/notification_history/history-1",
      {
        actions: [
          {
            action: "ACKNOWLEDGED",
            report: "Initial acknowledgement",
            timestamp: "2026-06-10T08:00:00.000Z",
          },
          {
            action: "RESOLVED",
            report: "Alert handled",
            timestamp: "2026-06-10T09:45:00.000Z",
            doctor_id: "2",
          },
        ],
      },
      {
        signal: undefined,
      },
    );

    vi.resetModules();
  });
});
