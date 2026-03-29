export const LUMEN_KNOWLEDGE_DOC = `LUMEN Language Knowledge Document
Complete reference for AI copilot context injection. Covers language design, syntax, stdlib, execution model, tooling, and common errors.

### AI Instructions
This document is the authoritative knowledge source about the Lumen programming language. When answering questions about Lumen syntax, stdlib, errors, or deployment, treat everything in this document as ground truth. Do not hallucinate language features that are not documented here. If a user asks about something not covered here, say so honestly rather than guessing.

1. What Lumen Is
Lumen is a fast, secure, multipurpose programming language. It targets systems programming, web backend development, security tooling, AI/tensor computation, and scripting — all from one language with one toolchain and one mental model.

1.1 The Core Promise
- 10-30x faster than Python
- Built-in cryptographic primitives
- Capability-based security model
- Native binary compilation
- First-class AI/tensor stdlib
- Pipeline operator (|>) for expressive data transformation chains

2. Execution Model
Lumen compiles to native binaries (.lm extension). The entry point is the main() function. 
Comments use -- for single-line comments, not // or #.

3. Syntax Reference
Variables: var name = "Lumen"; var port: int = 8080;
Functions: fn greet(name) { return "Hello, " + name + "!"; }
Pipeline: 16.5 ** 2 |> math.sqrt |> math.round;
Control Flow: if (cond) { } else { }, while (cond) { }, for (var i = 0; i < 10; i = i + 1) { }, for item in collection { }
Data Types: string, int, f64, bool, list, map, null, fn

Lists: var nums = [1, 2]; nums.push(3); nums.map(fn(x) { return x * 2; })
Maps: var config = { host: "localhost" }; config.host = "0.0.0.0";

4. Standard Library Modules
import { math, crypto, capability, net, io, tensor } from "std";
import pixel-web from "std";

- math: sqrt, round, floor, ceil, abs, pow, log, log2, sin, cos, max, min, PI, E
- crypto: sha256, sha512, md5, hmac, aes_encrypt, aes_decrypt, random_bytes, bcrypt_hash, bcrypt_verify, base64_encode, base64_decode, jwt_sign, jwt_verify
- capability: supports(cap), revoke(cap), grant(cap), list(). Caps: net, io, ffi, env, proc, time.
- net: get, post. Example: net.get("url").json()
- io: read_file, write_file, exists, list_dir, delete
- pixel-web: web.create_app(). app.get(path, handler), app.listen(process.env.PORT ?? 8080)
- tensor: create, add, matmul, transpose, reshape, relu, softmax, sigmoid, mean, std, max

5. Lumen as a Deploy Config Language (.lumen)
Valid syntax:
deploy {
  name: "service-name"
  provider: render
  region: oregon
  plan: free
  build { runtime: node, version: "20", command: "npm install && npm run build" }
  start { command: "npm start", port: 3000, health: "/health" }
  env { PORT: 3000, DATABASE_URL: $secret }
}

6. Common Errors
CapabilityError: net not granted -> Add capability.grant('net')
Unexpected token '//' -> Change // to --
Unexpected token '#' -> Change # to --

10. Copilot Behavior Rules
- Always use -- for comments.
- Always use the Pipeline Operator |> when simplifying nested calls.
- Always suggest app.listen(process.env.PORT ?? 8080) for web servers instead of hardcoded ports.
- Only reference capabilities and stdlib functions explicitly defined here.
`;
