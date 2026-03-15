import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * WO-002: Schema Implementation for Deterministic Governance.
 * Enforces Append-Only Ledger and Immutable Audit Trail.
 */
export class CreateLedgerAndAudit1710500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Immutable Ledger (Append-Only)
        await queryRunner.createTable(new Table({
            name: "ledger_entries",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
                { name: "user_id", type: "uuid", isNullable: false },
                { name: "amount", type: "bigint", isNullable: false }, 
                { name: "token_type", type: "varchar", length: "20", isNullable: false }, // REGULAR | SHOW_THEATER
                { name: "reference_id", type: "uuid", isUnique: true, isNullable: false }, // Idempotency
                { name: "reason_code", type: "varchar", length: "50", isNullable: false },
                { name: "created_at_utc", type: "timestamp with time zone", default: "now()" },
                { name: "metadata", type: "jsonb", isNullable: true }
            ]
        }), true);

        // 2. Deterministic Audit Trail
        await queryRunner.createTable(new Table({
            name: "audit_events",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
                { name: "entity_type", type: "varchar", length: "50", isNullable: false }, 
                { name: "entity_id", type: "uuid", isNullable: false },
                { name: "prev_state", type: "varchar", length: "50", isNullable: true },
                { name: "new_state", type: "varchar", length: "50", isNullable: false },
                { name: "reason_code", type: "varchar", length: "100", isNullable: false },
                { name: "actor_id", type: "varchar", length: "100", isNullable: false },
                { name: "correlation_id", type: "uuid", isNullable: false },
                { name: "timestamp_utc", type: "timestamp with time zone", default: "now()" },
                { name: "metadata", type: "jsonb", isNullable: true }
            ]
        }), true);

        // 3. Performance Indices
        await queryRunner.createIndex("ledger_entries", new TableIndex({ name: "idx_ledger_user", columnNames: ["user_id"] }));
        await queryRunner.createIndex("audit_events", new TableIndex({ name: "idx_audit_entity", columnNames: ["entity_id", "entity_type"] }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("audit_events");
        await queryRunner.dropTable("ledger_entries");
    }
}