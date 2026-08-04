import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function validateContactPayload(payload) {
  const errors = [];

  if (!payload.name || !payload.name.trim()) {
    errors.push('Name is required.');
  }

  if (!payload.email || !payload.email.trim()) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push('Please enter a valid email address.');
  }

  if (!payload.subject || !payload.subject.trim()) {
    errors.push('Subject is required.');
  }

  if (!payload.message || !payload.message.trim()) {
    errors.push('Message is required.');
  }

  return errors;
}

describe('contact validation', () => {
  it('rejects empty fields', () => {
    const errors = validateContactPayload({ name: '', email: '', subject: '', message: '' });
    assert.equal(errors.length, 4);
  });

  it('rejects invalid email addresses', () => {
    const errors = validateContactPayload({ name: 'John', email: 'bad-email', subject: 'Hi', message: 'Hello' });
    assert.equal(errors.includes('Please enter a valid email address.'), true);
  });
});
