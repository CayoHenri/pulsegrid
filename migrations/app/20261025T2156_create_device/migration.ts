#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/9e683c99f07f52e1572ba202b50a8991351919f8c283b19334b8afd1cc337ec3/contract';
import endContract from '../../snapshots/9e683c99f07f52e1572ba202b50a8991351919f8c283b19334b8afd1cc337ec3/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'devices',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('location', 'character varying(160)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 160 } },
          }),
          col('name', 'character varying(120)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 120 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('devices_status_check_ee520df2', sql`"status" IN ('ACTIVE', 'INACTIVE')`),
          checkExpression(
            'devices_type_check_3244d763',
            sql`"type" IN ('TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'MULTI_SENSOR')`,
          ),
        ],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
