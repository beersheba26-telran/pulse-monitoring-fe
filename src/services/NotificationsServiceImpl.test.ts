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
});
