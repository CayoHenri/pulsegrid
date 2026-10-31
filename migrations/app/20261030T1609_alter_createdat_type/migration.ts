#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9e683c99f07f52e1572ba202b50a8991351919f8c283b19334b8afd1cc337ec3/contract';
import startContract from '../../snapshots/9e683c99f07f52e1572ba202b50a8991351919f8c283b19334b8afd1cc337ec3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b57a5a1c49d7a4d599d7c8d516860a0f456019e3ed3bfe6c02c7f5476d38207e/contract';
import endContract from '../../snapshots/b57a5a1c49d7a4d599d7c8d516860a0f456019e3ed3bfe6c02c7f5476d38207e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.alterColumnType({
        schema: 'public',
        table: 'devices',
        column: 'created_at',
        type: 'timestamptz(3)',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
