import { withdraw } from '../commands/withdraw';
import { readFile, writeFile } from '../utils/iofs';
import { jest } from '@jest/globals';

jest.mock('../utils/iofs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('withdraw', () => {
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

    withdraw(50);

    expect(console.log).toHaveBeenCalledWith('You are not logged in');
  });

  it('should log a message if the user does not exist in the database', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 100,
          debt: [],
        },
      ],
      session: {
        name: 'Bob',
        balance: 0,
        debt: [],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    withdraw(50);

    expect(console.log).toHaveBeenCalledWith('User not found');
  });

  it('should log a message if the user does not have enough balance', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 30,
          debt: [],
        },
      ],
      session: {
        name: 'Alice',
        balance: 30,
        debt: [],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    withdraw(50);

    expect(console.log).toHaveBeenCalledWith('You do not have enough balance');
  });

  it('should withdraw the amount and update the balance if conditions are met', () => {
    const mockData = {
      data: [
        {
          name: 'Alice',
          balance: 100,
          debt: [],
        },
      ],
      session: {
        name: 'Alice',
        balance: 100,
        debt: [],
      },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    withdraw(50);

    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [
          {
            name: 'Alice',
            balance: 50,
            debt: [],
          },
        ],
        session: {
          name: 'Alice',
          balance: 50,
          debt: [],
        },
      })
    );
    expect(console.log).toHaveBeenCalledWith('Your balance is $50');
  });
});
