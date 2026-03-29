export const LUMEN_KNOWLEDGE_DOC = `LUMEN Language Knowledge Document
Complete reference for AI copilot context injection. Covers language design, syntax, stdlib, execution model, tooling, and common errors.

Language: Lumen
File Extension: .lm
Paradigm: Multi-paradigm
Author: mal4crypt

# AI How to use this document
This document is the authoritative knowledge source about the Lumen programming language. When answering questions about Lumen syntax, stdlib, errors, or deployment, treat everything in this document as ground truth. Do not hallucinate language features that are not documented here. If a user asks about something not covered here, say so honestly rather than guessing.

## 1. What Lumen Is
Lumen is a fast, secure, multipurpose programming language designed to serve as a single language across the entire software stack. It targets systems programming, web backend development, security tooling, AI/tensor computation, and scripting — all from one language with one toolchain and one mental model.

Lumen is not a research language. It is a production language with a working compiler, a growing standard library, a package registry, a web playground, a VS Code extension, and a deployment platform. It is actively developed and maintained by mal4crypt.

### 1.1 The Core Promise
- 10-30x faster than Python on equivalent workloads
- Built-in cryptographic primitives — no third-party crypto libraries needed
- Capability-based security model — modules can be granted or revoked at runtime
- Native binary compilation — no interpreter, no VM, no runtime overhead
- First-class AI/tensor stdlib — tensor operations without a Python bridge
- Pipeline operator (|>) for expressive data transformation chains
- One language from web servers to tensor math to security tooling

### 1.2 What Lumen Is Not
- Lumen is not a scripting language that compiles slowly — it is designed for fast compilation
- Lumen is not a Python replacement for data science notebooks — it targets production systems
- Lumen is not a fork or superset of any existing language — it is original
- Lumen is not limited to one domain — multipurpose is a core design goal, not a marketing claim

## 2. Execution Model
### 2.1 How Lumen Runs
Lumen uses a hybrid execution model. It compiles to native binaries for production deployment and supports interpreted/scripted execution for development and tooling use cases.

### 2.3 File Extension and Entry Point
Lumen source files use the .lm extension. The entry point of any Lumen program is the main() function. The compiler looks for main() as the program start. If main() is not defined, the file is treated as a library/module.

-- server.lm
fn main() {
    -- program starts here
}
main();

NOTE: Comments in Lumen
Lumen uses -- for single-line comments, not // or #. This is important — if you see // in Lumen code, it is a syntax error. Always use -- for comments.

## 3. Syntax — Complete Reference
### 3.1 Variables
Lumen uses var for variable declaration. Variables are dynamically typed by default but support optional type annotations.

-- Basic declaration
var name = "Lumen";
var version = 1;

-- With type annotation (optional but recommended)
var name: string = "Lumen";
var port: int = 8080;
var ratio: f64 = 3.14;

NOTE: var vs let
Lumen currently uses var for all variable declarations. A let keyword for immutable bindings is planned but not yet in the stable release. When you see let in Lumen code it may be from a pre-release version. In stable Lumen, use var for everything.

### 3.2 Functions
Functions are declared with the fn keyword. Functions are first-class values in Lumen.

-- Basic function
fn greet(name) {
    return "Hello, " + name + "!";
}

-- With type annotations
fn add(a: int, b: int) -> int {
    return a + b;
}

### 3.3 The Pipeline Operator (|>)
The pipeline operator |> passes the result of the left expression as the first argument to the right function. It is designed to replace deeply nested function calls with readable left-to-right chains.

-- Without pipeline (hard to read)
var result = math.round(math.sqrt(16.5 ** 2));

-- With pipeline (reads left to right)
var result = 16.5 ** 2 |> math.sqrt |> math.round;

INFO Pipeline operator rules: The left side of |> must evaluate to a value. The right side must be a callable. The left value is passed as the FIRST argument. If the function takes multiple arguments, the remaining arguments are passed in parentheses: value |> fn(arg2, arg3).

### 3.4 Control Flow
if (condition) { } else if (other_condition) { } else { }
while (i < 10) { i = i + 1; }
for (var i = 0; i < 10; i = i + 1) { print(i.to_string()); }
for item in collection { print(item.to_string()); }

### 3.5 Data Types
Types: string, int, f64, bool, list, map, null, fn

### 3.6 String Operations
var s = "Lumen";
var full = "Hello, " + s + "!";
var msg = f"Hello, {s}!"; -- String interpolation
Methods: .length(), .to_uppercase(), .to_lowercase(), .to_string(), .contains(str), .split(str), .trim()

### 3.7 Lists
var nums = [1, 2, 3, 4, 5];
Methods: .push(val), .pop(), .contains(val), .map(fn), .filter(fn)

### 3.8 Maps
var config = { host: "localhost", port: 8080 };
Methods: .keys(), .values(), .has("key")


## 4. Standard Library — Complete Module Reference
Lumen's standard library is imported using the import statement. Modules are part of the language — they ship with the Lumen installation.
import { math, crypto, capability, net, io, tensor } from "std";
import pixel-web from "std";

### 4.1 math
math.sqrt(x), math.round(x), math.floor(x), math.ceil(x), math.abs(x), math.pow(x, y), math.log(x), math.log2(x), math.sin(x), math.cos(x), math.PI, math.E, math.max(a, b), math.min(a, b)

### 4.2 crypto
Built-in cryptographic primitives.
crypto.sha256(data), crypto.sha512(data), crypto.hmac(data, key), crypto.aes_encrypt(data, key), crypto.aes_decrypt(data, key), crypto.random_bytes(n), crypto.bcrypt_hash(pw), crypto.bcrypt_verify(pw, hash), crypto.base64_encode(data), crypto.base64_decode(data), crypto.jwt_sign(payload, secret), crypto.jwt_verify(token, secret)

### 4.3 capability
Lumen's capability-based security system.
capability.supports("net"), capability.revoke("io"), capability.grant("net"), capability.list()
Capabilities: net, io, ffi, env, proc, time.

### 4.4 net
HTTP client networking.
var response = net.get("https://...").json();
var res = net.post("...", { body: { ... }, headers: { ... }});

### 4.5 io
File system operations.
io.read_file(path), io.write_file(path, data), io.exists(path), io.list_dir(path), io.delete(path)

### 4.6 pixel-web (Web Server Library)
pixel-web is Lumen's web server library. 
import pixel-web from "std";
let app = web.create_app();
app.get("/", fn(req, res) { res.send("Hello"); });
app.listen(process.env.PORT ?? 8080);
WARN Port binding in Lumen: Always use process.env.PORT for the port in production. The correct pattern is: app.listen(process.env.PORT ?? 8080).

### 4.7 tensor (AI/ML stdlib)
Native tensor operations without requiring a Python bridge.
var t = tensor.create([1, 2, 3, 4], [2, 2]);
tensor.add(t1, t2), tensor.matmul(t1, t2), tensor.transpose(t), tensor.reshape(t, [4, 1])
tensor.relu(t), tensor.softmax(t), tensor.sigmoid(t), tensor.mean(t), tensor.std(t), tensor.max(t)

## 5. Lumen as a Deploy Config Language
 deploy {
  name: "my-api"
  provider: render
  build { runtime: node, version: "20", command: "npm install && npm run build" }
  start { command: "npm start", port: 3000, health: "/health" }
  env { DATABASE_URL: $secret, ENVIRONMENT: production }
}

## 6. Common Errors & What They Mean
Unexpected token '//' -> Used // for a comment instead of -- (Fix: Change // to --)
Unexpected token '#' -> Used # for a comment (Python style) (Fix: Change # to --)
CapabilityError: net not granted -> Tried to use net module without net capability (Fix: Add capability.grant('net'))
Unexpected token '|>' -> Pipeline used on a non-value left side

Deploy Config Errors:
Missing required field: build.runtime -> runtime not specified in build block
Secret 'DATABASE_URL' has no value -> $secret referenced but not added to Secrets Manager

Deployment Errors (Render):
npm: command not found -> Wrong runtime (Fix: Set build.runtime to node)
EADDRINUSE: port already in use -> App is not reading PORT from env (Fix: Change app.listen(8080) to app.listen(process.env.PORT ?? 8080))
Process exited with code 1 -> Check for missing env vars (likely a $secret that wasn't set)

## 7. Tooling Reference
lumen run <file.lm>, lumen build <file.lm>, lumen fmt <file.lm>, lumen deploy.

## 8. Lumen Style Guide
- Indentation: 4 spaces. Never tabs.
- Variable names: snake_case
- Comments: -- for single line.
- String quotes: Double quotes always. Never single quotes.
- Semicolons: Required at end of statements. Never omit.
- Pipeline: Each |> step on its own line for chains longer than 2 steps.

## 9. Lumen vs Other Languages — Quick Reference
Concept | Python | Node.js | Go | Lumen
Comment | # comment | // comment | // comment | -- comment
Variable | x = 5 | let x = 5 | x := 5 | var x = 5;
Function | def fn(): | function fn() {} | func fn() {} | fn fn() {}
Print | print(x) | console.log(x) | fmt.Println(x) | print(x)
Pipeline | no native op | no native op | no native op | |> operator
Capability | no native | no native | no native | capability module

## 10. Copilot Behaviour Rules for Lumen
These rules govern how the AI copilot should reason and respond when helping users with Lumen code, deploy configs, or language questions.

AI These are instructions for the AI
Everything in this section is a directive for the AI model processing this document. Follow these rules precisely when responding to Lumen-related questions.

### 10.1 Answering Lumen Questions
- Always refer to this document as the ground truth for Lumen syntax and stdlib. Do not invent functions, keywords, or modules not listed here.
- If a user asks about a Lumen feature not covered in this document, say: 'I do not have documentation for that feature. Check lumen-lang.vercel.app/docs for the latest reference.'
- Do not confuse Lumen syntax with Python, JavaScript, or any other language. Lumen uses -- for comments, not // or #.
- When showing Lumen code examples, always use the correct style guide conventions from Section 8.
- The pipeline operator |> is a core Lumen feature — always suggest it when a user is writing nested function calls.

### 10.2 Diagnosing Deploy Errors
- When a deploy fails, check the error against Section 6.4 (Deployment Errors) first — these are the most common.
- If the error is 'npm: command not found', the runtime is wrong. Fix build.runtime.
- If the error is 'EADDRINUSE', the app has a hardcoded port. Fix: app.listen(process.env.PORT ?? 8080).
- If the error is 'Process exited with code 1', check for missing $secret values in the Secrets Manager.
- If the health check fails, the app is likely binding to a hardcoded port or crashing at startup.

### 10.3 Generating Deploy Configs
- Always use the schema from Section 5.1 exactly. Do not invent new fields.
- Always set NODE_ENV: production in the env block for Node.js projects.
- Always use $secret for any value that looks like a database URL, API key, JWT secret, or password.
- Never hardcode a port in start.command for Python or Go — use $PORT or equivalent env var.
- For Node.js projects with no build script: set build.command to 'npm install' only. Do not add 'npm run build' if no build script exists.
- For Docker projects: build.command is not required. Render handles the Docker build.
- When in doubt about the start command for a Node.js project: check if package.json has a 'start' script. If yes: 'npm start'. If no: 'node index.js' or 'node src/index.js'.

### 10.4 Lumen-Specific Things to Never Do
- Never suggest // for comments in Lumen — it is always --
- Never suggest import without the { } destructuring syntax for std modules
- Never suggest hardcoding a port without process.env.PORT fallback
- Never invent a stdlib function not listed in Section 4
- Never confuse the .lumen deploy config format with the Lumen programming language syntax — they are related but distinct
`;
