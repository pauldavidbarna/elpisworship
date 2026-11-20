import { describe, expect, it } from 'vitest';
import {
  checkAdminPassword, createAdminSession, extractToken, generateCode, ticketToken, verifyAdminSession, verifyTicketToken,
} from './token.js';

// Set before the describe blocks run, since they sign tokens while collecting.
process.env.TICKET_SECRET = 'test-secret-0123456789';
process.env.TICKETS_DOOR_PASSWORD = 'door-pass';

describe('ticket codes', () => {
  it('are 8 chars without 0/O/1/I', () => {
    for (let i = 0; i < 500; i++) expect(generateCode()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });
});

describe('ticket tokens', () => {
  const code = 'ABCD2345';
  const token = ticketToken(code);

  it('verify when untouched', () => {
    expect(verifyTicketToken(token)).toBe(code);
  });

  it('reject any single changed character', () => {
    for (let i = 0; i < token.length; i++) {
      if (token[i] === '.') continue;
      const swapped = token.slice(0, i) + (token[i] === 'A' ? 'B' : 'A') + token.slice(i + 1);
      expect(verifyTicketToken(swapped)).toBeNull();
    }
  });

  it('reject a bare code and junk', () => {
    expect(verifyTicketToken(code)).toBeNull();
    expect(verifyTicketToken('')).toBeNull();
    expect(verifyTicketToken(`${token}.extra`)).toBeNull();
  });

  it('reject tokens signed with another secret', () => {
    process.env.TICKET_SECRET = 'another-secret-0123456789';
    expect(verifyTicketToken(token)).toBeNull();
    process.env.TICKET_SECRET = 'test-secret-0123456789';
  });

  it('are extracted from a scanned ticket URL', () => {
    expect(verifyTicketToken(extractToken(`https://elpisworship.com/ticket/${token}`))).toBe(code);
    expect(verifyTicketToken(extractToken(`  ${token}\n`))).toBe(code);
  });
});

describe('admin sessions', () => {
  it('check the password', () => {
    expect(checkAdminPassword('door-pass')).toBe(true);
    expect(checkAdminPassword('door-pas')).toBe(false);
  });

  it('round-trip and reject tampering', () => {
    const session = createAdminSession('Paul');
    expect(verifyAdminSession(`Bearer ${session}`)).toBe('Paul');
    expect(verifyAdminSession(`Bearer ${session}x`)).toBeNull();
    expect(verifyAdminSession(undefined)).toBeNull();
  });
});
