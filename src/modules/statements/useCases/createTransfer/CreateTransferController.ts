import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { user_id: receiver_id } = req.params;
    const { id: sender_id } = req.user;
    const { amount, description } = req.body;

    const transferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await transferUseCase.execute({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return res.status(201).json(transfer);
  }
}
