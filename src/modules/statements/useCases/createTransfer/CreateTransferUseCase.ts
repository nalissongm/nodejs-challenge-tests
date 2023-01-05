import { Transfer } from "@modules/statements/entities/Transfer";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { ITransfersRepository } from "@modules/statements/repositories/ITransfersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { CreateTransferError } from "./CreateTransferError";

interface IRequest {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("TransfersRepository")
    private transfersRepository: ITransfersRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description,
  }: IRequest): Promise<Transfer> {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.SenderNotFoundError();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferError.SenderNotFoundError();
    }

    if (sender.id === receiver.id) {
      throw new CreateTransferError.ReceiverNotFoundError();
    }

    const statements = await this.statementsRepository.getUserBalance({
      user_id: sender.id,
      with_statement: false,
    });

    const transfers = await this.transfersRepository.getUserBalance(sender.id);

    const balance =
      statements.balance +
      transfers.balance.totalReceived -
      transfers.balance.totalTransferred;

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const transfer = await this.transfersRepository.create({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return transfer;
  }
}
