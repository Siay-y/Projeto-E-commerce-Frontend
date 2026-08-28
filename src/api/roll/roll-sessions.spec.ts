import { MemoryRollSessions } from './roll-sessions';

describe('MemoryRollSessions', () => {
  it('devolve o valor guardado pelo identificador', () => {
    const sessions = new MemoryRollSessions();
    const id = sessions.open(17);

    expect(sessions.find(id)?.value).toBe(17);
  });

  it('não conhece identificador que não abriu', () => {
    const sessions = new MemoryRollSessions();
    sessions.open(3);

    expect(sessions.find('inventado')).toBeUndefined();
    expect(sessions.find(null)).toBeUndefined();
  });

  it('gera um identificador novo a cada rolagem', () => {
    const sessions = new MemoryRollSessions();

    expect(sessions.open(1)).not.toBe(sessions.open(1));
  });

  it('esquece a sessão vencida', () => {
    vi.useFakeTimers();

    try {
      const sessions = new MemoryRollSessions(1000);
      const id = sessions.open(20);

      vi.advanceTimersByTime(999);
      expect(sessions.find(id)?.value).toBe(20);

      vi.advanceTimersByTime(2);
      expect(sessions.find(id)).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
