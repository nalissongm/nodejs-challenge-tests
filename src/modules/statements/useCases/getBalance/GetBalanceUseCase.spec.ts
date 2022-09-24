import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { User } from "../../../users/entities/User";
import { GetBalanceError } from "./GetBalanceError";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let user: User;

describe("Get Balance", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );

    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "pass_test",
    });
  });

  it("should be able to get the balance of the user", async () => {
    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: "Test description",
      type: OperationType.DEPOSIT,
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 200,
      description: "Test description",
      type: OperationType.WITHDRAW,
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance.statement.length).toEqual(2);
    expect(balance.statement[0].type).toEqual("deposit");
    expect(balance.statement[1].type).toEqual("withdraw");
    expect(balance.balance).toEqual(800);
  });

  it("should not be able to get the balance of the nonexistent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "user_not_existent",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
