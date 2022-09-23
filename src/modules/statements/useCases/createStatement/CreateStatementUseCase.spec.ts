import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { User } from "modules/users/entities/User";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "password_test",
    });
  });

  it("should be able to create a new statement of the type deposit", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 1212,
      description: "Description test",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("deposit");
  });

  it("should be able to create a new statement of the type withdraw", async () => {
    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 1200,
      description: "Description test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 200.36,
      description: "Withdraw test",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("withdraw");
  });

  it("should not be able to create a statement from a nonexistent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "not_user_id",
        type: OperationType.DEPOSIT,
        amount: 1200,
        description: "Description test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be possible to make a withdraw larger than the money in the account", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "Description test",
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 1200,
        description: "Description test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
