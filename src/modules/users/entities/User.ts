import { Transfer } from "@modules/statements/entities/Transfer";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";

import { Statement } from "../../statements/entities/Statement";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Statement, (statement) => statement.user)
  statement: Statement[];

  @ManyToMany(() => Transfer, (transfer) => transfer.user)
  transfer: Transfer[];

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}
