import { transfer } from '../commands/transfer';
import { readFile, writeFile } from '../utils/iofs';
import { jest } from '@jest/globals';

// Mock the readFile and writeFile functions
jest.mock('../utils/iofs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('transfer', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should log a message if the user is not logged in', () => {
    const mockData = {
      data: [],
      session: null, // No user session
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    transfer('Bob', 100);

    // Expect console log to indicate that user is not logged in
    expect(console.log).toHaveBeenCalledWith('You are not logged in');
  });

  it('should log a message if the user or target does not exist', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: { name: 'Alice', balance: 100, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    transfer('Bob', 100);

    // Expect console log to indicate that the target user is not found
    expect(console.log).toHaveBeenCalledWith('User not found');
  });

  it('should log a message if the user tries to transfer to themselves', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: { name: 'Alice', balance: 100, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    transfer('Alice', 100);

    // Expect console log to indicate that the target cannot be the same as the user
    expect(console.log).toHaveBeenCalledWith(
      'Target cannot be the same as user'
    );
  });

  it('should handle transfer with existing debt', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', isOwed: true, amount: 50 }],
        },
        {
          name: 'Bob',
          balance: 100,
          debt: [{ name: 'Alice', isOwed: false, amount: 50 }],
        },
      ],
      session: {
        name: 'Alice',
        balance: 0,
        debt: [{ name: 'Bob', isOwed: true, amount: 50 }],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    transfer('Bob', 60); // Alice will transfer 60 to Bob, with existing debt adjustment

    // Expect correct debt and balance adjustments
    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [
          {
            name: 'Alice',
            balance: 0,
            debt: [{ name: 'Bob', isOwed: true, amount: 110 }],
          },
          {
            name: 'Bob',
            balance: 100,
            debt: [{ name: 'Alice', isOwed: false, amount: 110 }],
          },
        ],
        session: {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', isOwed: true, amount: 110 }],
        },
      })
    );

    expect(console.log).toHaveBeenCalledWith('Transferred $0 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $0');
    expect(console.log).toHaveBeenCalledWith('Owed $110 to Bob');
  });

  it('should handle transfer when user balance goes negative and create debt', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 30,
          debt: [],
        },
        { name: 'Bob', balance: 100, debt: [] },
      ],
      session: { name: 'Alice', balance: 30, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    transfer('Bob', 60); // Alice transfers 60, but goes into debt

    // Expect the balances and debt to be updated
    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [
          {
            name: 'Alice',
            balance: 0,
            debt: [{ name: 'Bob', isOwed: true, amount: 30 }],
          },
          {
            name: 'Bob',
            balance: 130,
            debt: [{ name: 'Alice', isOwed: false, amount: 30 }],
          },
        ],
        session: {
          name: 'Alice',
          balance: 0,
          debt: [{ name: 'Bob', isOwed: true, amount: 30 }],
        },
      })
    );

    expect(console.log).toHaveBeenCalledWith('Transferred $30 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $0');
    expect(console.log).toHaveBeenCalledWith('Owed $30 to Bob');
  });

  it('should handle normal transfer when balances are updated without creating debt', () => {
    const mockData = {
      data: [
        { name: 'Alice', balance: 100, debt: [] },
        { name: 'Bob', balance: 50, debt: [] },
      ],
      session: { name: 'Alice', balance: 100, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    transfer('Bob', 40); // Alice transfers 40 to Bob

    // Expect the balances to be updated accordingly
    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [
          { name: 'Alice', balance: 60, debt: [] },
          { name: 'Bob', balance: 90, debt: [] },
        ],
        session: { name: 'Alice', balance: 60, debt: [] },
      })
    );

    expect(console.log).toHaveBeenCalledWith('Transferred $40 to Bob');
    expect(console.log).toHaveBeenCalledWith('Your balance is $60');
  });
});
