import { User } from "@modules/users/entities/User";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { v4 as uuidV4 } from "uuid";

@Entity("transfers")
export class Transfer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  sender_id: string;

  @Column("uuid")
  receiver_id: string;

  @ManyToMany(() => User, (user) => user.transfer)
  @JoinColumn([
    { referencedColumnName: "sender_id" },
    { referencedColumnName: "receiver_id" },
  ])
  user: User[];

  @Column("decimal", { precision: 15, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: string;

  @CreateDateColumn()
  updated_at: string;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}
