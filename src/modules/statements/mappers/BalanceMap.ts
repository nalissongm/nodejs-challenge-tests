import { Statement } from "../entities/Statement";
import { Transfer } from "../entities/Transfer";

interface IParsedStatement {
  id: string;
  amount: number;
  receiver_id?: string;
  sender_id?: string;
  description: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export class BalanceMap {
  static toDTO({
    statement,
    transfers,
    balance,
    user_id,
  }: {
    statement: Statement[];
    transfers?: {
      transfer_id?: string;
      transfer_sender_id?: string;
      transfer_receiver_id?: string;
      transfer_amount?: number;
      transfer_description?: string;
      transfer_created_at?: string;
      transfer_updated_at?: string;
    }[];
    balance: number;
    user_id: string;
  }) {
    const parsedStatement: IParsedStatement[] = statement.map(
      ({ id, amount, description, type, created_at, updated_at }) => ({
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
      })
    );

    if (transfers) {
      transfers.map((transfer) => {
        if (user_id === transfer.transfer_receiver_id) {
          parsedStatement.push({
            id: transfer.transfer_id,
            amount: Number(transfer.transfer_amount),
            sender_id: transfer.transfer_sender_id,
            description: transfer.transfer_description,
            type: "transfer",
            created_at: new Date(transfer.transfer_created_at),
            updated_at: new Date(transfer.transfer_updated_at),
          });
        } else {
          parsedStatement.push({
            id: transfer.transfer_id,
            amount: Number(transfer.transfer_amount),
            receiver_id: transfer.transfer_receiver_id,
            description: transfer.transfer_description,
            type: "transfer",
            created_at: new Date(transfer.transfer_created_at),
            updated_at: new Date(transfer.transfer_updated_at),
          });
        }
      });

      return {
        statement: parsedStatement,
        balance: Number(balance),
      };
    }

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
