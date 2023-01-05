import { getRepository, Repository } from "typeorm";
import { ICreateTransferDTO } from "../dto/ICreateTransferDTO";
import { Transfer } from "../entities/Transfer";
import { ITransfersRepository } from "./ITransfersRepository";

interface ITransfersResponse {
  transfer_id: string;
  transfer_sender_id: string;
  transfer_receiver_id: string;
  transfer_amount: number;
  transfer_description: string;
  transfer_created_at: string;
  transfer_updated_at: string;
}

export class TransfersRepository implements ITransfersRepository {
  private repository: Repository<Transfer>;

  constructor() {
    this.repository = getRepository(Transfer);
  }

  async create({
    sender_id,
    receiver_id,
    amount,
    description,
  }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = this.repository.create({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return this.repository.save(transfer);
  }

  async getUserBalance(user_id: string): Promise<{
    transfers: ITransfersResponse[];
    balance: { totalTransferred: number; totalReceived: number };
  }> {
    const transfers = await this.repository
      .createQueryBuilder("transfer")
      .where({ sender_id: user_id })
      .orWhere({ receiver_id: user_id })
      .execute();

    const balance = transfers.reduce(
      (acc: { totalTransferred: number; totalReceived: number }, transfer) => {
        if (transfer.transfer_sender_id === user_id) {
          return {
            ...acc,
            totalTransferred:
              acc.totalTransferred + Number(transfer.transfer_amount),
          };
        } else {
          return {
            ...acc,
            totalReceived: acc.totalReceived + Number(transfer.transfer_amount),
          };
        }
      },
      { totalTransferred: 0, totalReceived: 0 }
    );

    return { transfers, balance };
  }
}
