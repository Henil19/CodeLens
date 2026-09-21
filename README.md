# CodeLens: Advanced Research AI Code Assistant & Reviewer

> A developer-grade research assistant and multi-perspective code reviewer designed for deep algorithmic complexity derivation, security vulnerability detection (CWE/OWASP), unified diff synthesis, and grounded interactive review.

---

## 🌟 Key Capabilities

### 1. Algorithmic Complexity Research
- **Big-O Asymptotic Derivation**: Derives worst-case $O(g(n))$, best-case $\Omega(g(n))$, auxiliary space complexity, and call-stack/recursion depth.
- **Formal Invariants & Proofs**: Identifies loop invariants, data structure guarantees, and cost scaling boundaries.

### 2. Multi-Vector Security & Heuristics
- **Cryptographic Timing Leaks (CWE-208)**: Detects non-constant-time byte comparisons in HMAC/token verification routines.
- **SQL Injection (CWE-89)**: Detects raw string interpolation and missing parameterization in query paths.
- **Quadratic N+1 Queries**: Identifies sequential loop queries that saturate database connection pools.
- **Memory & Resource Retention**: Uncovers unbounded maps and un-cleared interval timers that prevent garbage collection.
- **Unsafe Pointer Boundaries (CWE-119)**: Flags unchecked pointer arithmetic and buffer boundary risks in low-level code.

### 3. Multi-Persona Review Switching
- **Alex Mercer** (*Staff Systems Architect*): Focuses on concurrency, cache locality, lock contention, and P99 latency.
- **Elena Rostova** (*Principal Security Auditor*): Adversarial threat modeling, CWE mapping, and timing side channels.
- **Marcus Vance** (*Staff Software Craftsman*): Clean code, decoupling, error propagation, and API ergonomics.
- **Dr. Evelyn Wei** (*CS Theory Researcher*): Asymptotic proofs, state invariants, and academic literature.

### 4. Unified Diff & Patch Studio
- Synthesizes `git diff` formatted unified patches.
- One-click **Apply Refactor** directly replaces vulnerable or inefficient code in the editor.
- Export as `.patch` or copy unified diff with single-click.

### 5. Grounded Interactive Assistant
- Context-aware code chat grounded in the AST, complexity bounds, and detected vulnerabilities.
- Quick prompt pills (*"Prove Big-O"*, *"How to make this Zero-Allocation?"*, *"Explain security vulnerability"*).
- Dual execution: 100% offline heuristic engine + optional live API keys (Gemini, OpenAI, Claude, Ollama).

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Henil19/CodeLens.git
cd CodeLens

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Running Tests & Build

```bash
# Run the verification test suite
npx tsx test-verification.ts

# Build production bundle
npm run build
```

---

## 📁 Project Architecture

```
├── src/
│   ├── components/       # UI Components (Editor, DiffViewer, ReviewPanel, etc.)
│   ├── engine/           # Analysis, Complexity, Diffing, and Heuristic modules
│   │   ├── analyzer.ts   # Central pipeline coordinator
│   │   ├── complexity.ts # Big-O and invariant derivation
│   │   ├── heuristics.ts # Vulnerability and performance rules
│   │   ├── diff.ts       # Unified patch synthesis
│   │   ├── personas.ts   # Reviewer persona definitions
│   │   └── references.ts # Academic literature & RFC citations
│   ├── samples/          # Realistic real-world scenarios (TS, Go, Python, Rust)
│   ├── styles/           # Modern dark-mode vanilla CSS design system
│   ├── types/            # TypeScript domain interfaces
│   ├── App.tsx           # Main application state coordinator
│   └── main.tsx          # DOM root mount
├── test-verification.ts  # Headless test runner
├── index.html            # Web entry point
├── vite.config.ts        # Vite build configuration
└── tsconfig.json         # Strict TypeScript configuration
```

---

## 📜 License
MIT License.
