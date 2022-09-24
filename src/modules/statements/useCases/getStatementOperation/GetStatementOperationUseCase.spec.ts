import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceError } from "../getBalance/GetBalanceError";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to get statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "pass_test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: "Test description",
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.type).toEqual(statement.type);
    expect(statementOperation.id).toEqual(statement.id);
    expect(statementOperation.user_id).toEqual(statement.user_id);
  });

  it("should not be able to get statement operation from a nonexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "fake_user_id",
        statement_id: "fake_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation from a nonexistent statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "pass_test",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "fake_statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
