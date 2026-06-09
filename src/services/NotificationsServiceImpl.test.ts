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

describe("NotificationsServiceImpl", () => {
  it("maps timestamp strings to Date instances", async () => {
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
    const result = await service.getNotifications();

    expect(getMock).toHaveBeenCalledWith("/notifications", {
      params: {
        _sort: "-timestamp",
      },
      signal: undefined,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeDefined();
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[0].timestamp.toISOString()).toBe("2026-06-09T10:57:08.787Z");

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
});
