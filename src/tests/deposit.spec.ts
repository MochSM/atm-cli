import { deposit } from '../commands/deposit';
import { readFile, writeFile } from '../utils/iofs';
import { jest } from '@jest/globals';

jest.mock('../utils/iofs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('deposit', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log a message if the user is not logged in', () => {
    const mockData = {
      data: [],
      session: null,
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    deposit(50);

    expect(console.log).toHaveBeenCalledWith('You are not logged in');
  });

  it('should log a message if the user does not exist in the database', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: { name: 'Bob', balance: 0, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    deposit(50);

    expect(console.log).toHaveBeenCalledWith('User not found');
  });

  it('should log a message if the user has debt and partial repayment', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', amount: 70, isOwed: true }],
        },
        {
          name: 'Bob',
          balance: 100,
          debt: [{ name: 'Alice', amount: 70, isOwed: false }],
        },
      ],
      session: {
        name: 'Alice',
        balance: 0,
        debt: [{ name: 'Bob', amount: 70, isOwed: true }],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    deposit(50);

    expect(console.log).toHaveBeenCalledWith('Transferred $50 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $0');
    expect(console.log).toHaveBeenCalledWith('Owed $20 to Bob');
  });

  it('should fully pay off a debt and update the user debt correctly', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', amount: 30, isOwed: true }],
        },
        {
          name: 'Bob',
          balance: 100,
          debt: [{ name: 'Alice', amount: 30, isOwed: false }],
        },
      ],
      session: {
        name: 'Alice',
        balance: 0,
        debt: [{ name: 'Bob', amount: 30, isOwed: true }],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    deposit(30);

    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [
          { name: 'Alice', balance: 0, debt: [] },
          { name: 'Bob', balance: 100, debt: [] },
        ],
        session: { name: 'Alice', balance: 0, debt: [] },
      })
    );
    expect(console.log).toHaveBeenCalledWith('Transferred $30 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $0');
  });

  it('should add the remaining deposit amount to the user balance if no debts are found', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: { name: 'Alice', balance: 100, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    deposit(50);

    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [{ name: 'Alice', balance: 150, debt: [] }],
        session: { name: 'Alice', balance: 150, debt: [] },
      })
    );
    expect(console.log).toHaveBeenCalledWith('Your balance is $150');
  });

  it('should log a message if the debt repayment is successful and the balance updates accordingly', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', amount: 50, isOwed: true }],
        },
        {
          name: 'Bob',
          balance: 100,
          debt: [{ name: 'Alice', amount: 50, isOwed: false }],
        },
      ],
      session: {
        name: 'Alice',
        balance: 0,
        debt: [{ name: 'Bob', amount: 50, isOwed: true }],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    deposit(100);

    expect(console.log).toHaveBeenCalledWith('Transferred $50 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $50');
  });
});
