import { Transfer } from "@modules/statements/entities/Transfer";
import { ITransfersRepository } from "@modules/statements/repositories/ITransfersRepository";
import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";

interface IRequest {
  user_id: string;
}

interface IResponse {
  user_id: string;
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
}

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("TransfersRepository")
    private transfersRepository: ITransfersRepository
  ) {}

  async execute({ user_id }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new GetBalanceError();
    }

    const transfers = await this.transfersRepository.getUserBalance(user_id);

    const balance = await this.statementsRepository.getUserBalance({
      user_id,
      with_statement: true,
    });

    balance.balance =
      balance.balance +
      transfers.balance.totalReceived -
      transfers.balance.totalTransferred;

    return { ...balance, user_id, transfers: transfers.transfers } as IResponse;
  }
}
