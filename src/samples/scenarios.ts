import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'ts-cache-leak',
    name: 'Async LRU Cache (Race & Memory Leak)',
    language: 'typescript',
    difficulty: 'Senior',
    tag: 'Concurrency & Memory',
    description: 'An in-memory TTL cache with unhandled promise race conditions, unbounded growth on missing evictions, and timer reference leaks.',
    code: `class AsyncMemoryCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();
  private inflight = new Map<string, Promise<T>>();

  async getOrFetch(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const entry = this.store.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }

    if (this.inflight.has(key)) {
      return this.inflight.get(key)!;
    }

    const promise = fetcher().then((data) => {
      this.store.set(key, { value: data, expiresAt: Date.now() + ttlMs });
      this.inflight.delete(key);
      setInterval(() => {
        this.store.delete(key);
      }, ttlMs);
      return data;
    });

    this.inflight.set(key, promise);
    return promise;
  }

  clear() {
    this.store.clear();
  }
}`
  },
  {
    id: 'go-auth-timing',
    name: 'HMAC Token Validator (Timing Vulnerability)',
    language: 'go',
    difficulty: 'Staff',
    tag: 'Cryptographic Security',
    description: 'Cryptographic token validation using non-constant-time string comparison vulnerable to side-channel timing attacks (CWE-208).',
    code: `package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"errors"
	"strings"
)

type TokenValidator struct {
	secret []byte
}

func NewTokenValidator(secret string) *TokenValidator {
	return &TokenValidator{secret: []byte(secret)}
}

func (v *TokenValidator) VerifySignature(payload, signature string) (bool, error) {
	if len(payload) == 0 || len(signature) == 0 {
		return false, errors.New("empty payload or signature")
	}

	mac := hmac.New(sha256.New, v.secret)
	mac.Write([]byte(payload))
	expected := string(mac.Sum(nil))

	// Direct string equality leaks timing differences byte-by-byte
	if strings.Compare(expected, signature) != 0 {
		return false, errors.New("signature mismatch")
	}

	return true, nil
}`
  },
  {
    id: 'py-n-plus-one',
    name: 'ORM Batch Aggregator (Quadratic N+1 Query)',
    language: 'python',
    difficulty: 'Senior',
    tag: 'Database & Complexity',
    description: 'Quadratic nested query execution and unbounded database connection pool saturation inside an asynchronous loop.',
    code: `import asyncio
from typing import List, Dict, Any

class TransactionReportGenerator:
    def __init__(self, db_session):
        self.db = db_session

    async def generate_user_summaries(self, user_ids: List[int]) -> List[Dict[str, Any]]:
        results = []
        for uid in user_ids:
            # Query 1: Fetch user
            user = await self.db.execute(f"SELECT * FROM users WHERE id = {uid}")
            user_data = user.fetchone()
            
            # Query 2: Fetch transactions sequentially (N+1 hazard)
            txs = await self.db.execute(f"SELECT * FROM transactions WHERE user_id = {uid}")
            tx_records = txs.fetchall()
            
            total_spent = 0
            for tx in tx_records:
                # Query 3: Deep nested lookup per transaction (N*M hazard)
                merchant = await self.db.execute(f"SELECT name, category FROM merchants WHERE id = {tx['merchant_id']}")
                m_info = merchant.fetchone()
                total_spent += tx['amount']

            results.append({
                "user": user_data["username"],
                "total": total_spent,
                "tx_count": len(tx_records)
            })

        return results`
  },
  {
    id: 'rust-unsafe-buffer',
    name: 'Zero-Copy Ring Buffer (Unsafe Pointer Aliasing)',
    language: 'rust',
    difficulty: 'Staff',
    tag: 'Memory Safety',
    description: 'Custom ring buffer utilizing raw pointer arithmetic without bounds checking, yielding data races and undefined behavior.',
    code: `pub struct RawRingBuffer {
    ptr: *mut u8,
    capacity: usize,
    head: usize,
    tail: usize,
}

impl RawRingBuffer {
    pub fn new(capacity: usize) -> Self {
        let layout = std::alloc::Layout::from_size_align(capacity, 8).unwrap();
        let ptr = unsafe { std::alloc::alloc(layout) };
        Self { ptr, capacity, head: 0, tail: 0 }
    }

    pub fn push(&mut self, byte: u8) {
        unsafe {
            // Missing buffer overflow guard and uncoordinated concurrent writes
            let offset = self.head % self.capacity;
            *self.ptr.add(offset) = byte;
            self.head += 1;
        }
    }

    pub fn pop(&mut self) -> Option<u8> {
        if self.tail >= self.head {
            return None;
        }
        unsafe {
            let offset = self.tail % self.capacity;
            let val = *self.ptr.add(offset);
            self.tail += 1;
            Some(val)
        }
    }
}`
  }
];
