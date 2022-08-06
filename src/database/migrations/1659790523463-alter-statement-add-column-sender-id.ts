import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterStatementAddColumnSenderId1659790523463 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'statements',
      new TableColumn({
        name: 'sender_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('statements', 'sender_id')
  }

}
