#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b57a5a1c49d7a4d599d7c8d516860a0f456019e3ed3bfe6c02c7f5476d38207e/contract';
import startContract from '../../snapshots/b57a5a1c49d7a4d599d7c8d516860a0f456019e3ed3bfe6c02c7f5476d38207e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/dd657f8d9cc485dc9177be8b74fbc2e666786193c9d9f52b721c88077006740b/contract';
import endContract from '../../snapshots/dd657f8d9cc485dc9177be8b74fbc2e666786193c9d9f52b721c88077006740b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'measurements',
        columns: [
          col('created_at', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1', typeParams: { precision: 3 } },
          }),
          col('device_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('recorded_at', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1', typeParams: { precision: 3 } },
          }),
          col('value', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'measurements',
        index: 'measurements_device_id_idx_8f329912',
        columns: ['device_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'measurements',
        index: 'measurements_device_id_recorded_at_idx_c1f79609',
        columns: ['device_id', 'recorded_at'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'measurements',
        foreignKey: {
          name: 'measurements_device_id_fkey',
          columns: ['device_id'],
          references: { schema: 'public', table: 'devices', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
