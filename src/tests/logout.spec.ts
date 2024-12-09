import { logout } from '../commands/logout';
import { readFile, writeFile } from '../utils/iofs';
import { jest } from '@jest/globals';

jest.mock('../utils/iofs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('logout', () => {
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

    logout();

    expect(console.log).toHaveBeenCalledWith('You are not logged in');
  });

  it('should log out the user and clear the session', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: { name: 'Alice', balance: 100, debt: [] },
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    const writeFileMock = (writeFile as jest.Mock).mockImplementation(() => {});
    console.log = jest.fn();

    logout();

    expect(writeFileMock).toHaveBeenCalledWith(
      JSON.stringify({
        data: [{ name: 'Alice', balance: 100, debt: [] }],
        session: null,
      })
    );
    expect(console.log).toHaveBeenCalledWith('Goodbye, Alice!');
  });

  it('should handle the case where session is already null and not attempt to clear session again', () => {
    const mockData = {
      data: [{ name: 'Alice', balance: 100, debt: [] }],
      session: null,
    };

    (readFile as jest.Mock).mockReturnValue(JSON.stringify(mockData));
    console.log = jest.fn();

    logout();

    expect(writeFile).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('You are not logged in');
  });
});
