import { AppError } from "@shared/errors/AppError";

export namespace CreateTransferError {
  export class SenderNotFoundError extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class ReceiverNotFoundError extends AppError {
    constructor() {
      super("Receiver not found", 404);
    }
  }

  export class SameUsersError extends AppError {
    constructor() {
      super("Sender and receiver cannot be the same", 400);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
