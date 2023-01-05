import { ICreateTransferDTO } from "../dto/ICreateTransferDTO";
import { Transfer } from "../entities/Transfer";

interface ITransfersResponse {
  transfer_id: string;
  transfer_sender_id: string;
  transfer_receiver_id: string;
  transfer_amount: number;
  transfer_description: string;
  transfer_created_at: string;
  transfer_updated_at: string;
}

export interface ITransfersRepository {
  create(data: ICreateTransferDTO): Promise<Transfer>;
  getUserBalance(user_id: string): Promise<{
    transfers: ITransfersResponse[];
    balance: { totalTransferred: number; totalReceived: number };
  }>;
}
