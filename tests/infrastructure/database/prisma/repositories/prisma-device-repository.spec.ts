import { beforeEach, describe, expect, it, vi } from "vitest";
import { Device } from "../../../../../src/domain/entities/device/device";
import { PrismaDeviceMapper } from "../../../../../src/infrastructure/database/prisma/mappers/prisma-device-mapper";
import { PrismaDeviceRepository } from "../../../../../src/infrastructure/database/prisma/repositories/prisma-device-repository";

interface DeviceRecord {
  id: string;
  name: string;
  type: "TEMPERATURE";
  location: string;
  status: "ACTIVE";
  createdAt: string;
}

interface DeviceOrderFields {
  createdAt: { desc: typeof createdAtDesc };
  id: { desc: typeof idDesc };
}

const { create, where, first, all, orderBy, createdAtDesc, idDesc } =
  vi.hoisted(() => ({
    create: vi.fn(),
    where: vi.fn(),
    first: vi.fn(),
    all: vi.fn(),
    orderBy: vi.fn(),
    createdAtDesc: vi.fn(() => "createdAt DESC"),
    idDesc: vi.fn(() => "id DESC"),
  }));

vi.mock("../../../../../src/infrastructure/database/prisma/prisma-db", () => ({
  db: {
    orm: {
      public: {
        Device: {
          create,
          where,
          orderBy,
        },
      },
    },
  },
}));

vi.mock(
  "../../../../../src/infrastructure/database/prisma/mappers/prisma-device-mapper",
  () => ({
    PrismaDeviceMapper: {
      toPersistence: vi.fn((device: Device) => ({
        id: device.id,
        name: device.name,
        type: device.type,
        location: device.location,
        status: device.status,
        createdAt: device.createdAt.toISOString(),
      })),
      toDomain: vi.fn(
        (record: DeviceRecord) =>
          new Device(
            {
              name: record.name,
              type: record.type,
              location: record.location,
              status: record.status,
              createdAt: new Date(record.createdAt),
            },
            record.id,
          ),
      ),
    },
  }),
);

describe("PrismaDeviceRepository", () => {
  const record: DeviceRecord = {
    id: "94e7f031-1961-4fc9-9b26-0a1eb47fb247",
    name: "Sensor 01",
    type: "TEMPERATURE",
    location: "Estufa A",
    status: "ACTIVE",
    createdAt: "2026-10-30T15:45:12.123Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    where.mockReturnValue({ first });
    orderBy.mockReturnValue({ all });
    all.mockResolvedValue([record]);
    first.mockResolvedValue(record);
    create.mockResolvedValue(undefined);
  });

  it("creates a device using the persistence mapper", async () => {
    const repository = new PrismaDeviceRepository();
    const device = new Device(
      {
        name: "Sensor 01",
        type: "TEMPERATURE",
        location: "Estufa A",
        status: "ACTIVE",
        createdAt: new Date(record.createdAt),
      },
      record.id,
    );

    await repository.create(device);

    expect(PrismaDeviceMapper.toPersistence).toHaveBeenCalledWith(device);
    expect(create).toHaveBeenCalledWith({
      id: record.id,
      name: record.name,
      type: record.type,
      location: record.location,
      status: record.status,
      createdAt: record.createdAt,
    });
  });

  it("finds and maps a device by ID", async () => {
    const repository = new PrismaDeviceRepository();

    const result = await repository.findById(record.id);

    expect(where).toHaveBeenCalledWith({ id: record.id });
    expect(first).toHaveBeenCalledOnce();
    expect(PrismaDeviceMapper.toDomain).toHaveBeenCalledWith(record);
    expect(result).toBeInstanceOf(Device);
    expect(result?.id).toBe(record.id);
  });

  it("returns null when the ID does not match a device", async () => {
    first.mockResolvedValue(null);
    const repository = new PrismaDeviceRepository();

    const result = await repository.findById(record.id);

    expect(result).toBeNull();
    expect(PrismaDeviceMapper.toDomain).not.toHaveBeenCalled();
  });

  it("lists mapped devices ordered by creation time and ID descending", async () => {
    orderBy.mockImplementation(
      (orderExpressions: Array<(row: DeviceOrderFields) => unknown>) => {
        orderExpressions[0](
          {
            createdAt: { desc: createdAtDesc },
          } as DeviceOrderFields,
        );
        orderExpressions[1](
          { id: { desc: idDesc } } as DeviceOrderFields,
        );
        return { all };
      },
    );
    const repository = new PrismaDeviceRepository();

    const result = await repository.findAll();

    expect(orderBy).toHaveBeenCalledOnce();
    expect(createdAtDesc).toHaveBeenCalledOnce();
    expect(idDesc).toHaveBeenCalledOnce();
    expect(all).toHaveBeenCalledOnce();
    expect(PrismaDeviceMapper.toDomain).toHaveBeenCalledWith(record, 0, [
      record,
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Device);
    expect(result[0]?.id).toBe(record.id);
  });
});
