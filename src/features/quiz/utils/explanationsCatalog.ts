// Auto-generated explanation catalog from content drafts
export const explanationsCatalog: Record<string, { correct_index: number; explanation: string }> = {
  "What graph algorithm is executed by autograd engines to determine the order of backward gradient propagation?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why is reverse-mode automatic differentiation preferred over forward-mode for deep neural networks?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What happens when multiple computational branches consume the same tensor during the forward pass?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the Vector-Jacobian Product (VJP) compute in reverse-mode autodiff?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary purpose of wrapping inference code in torch.no_grad()?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which type of operation cannot be differentiated by standard autograd engines without approximations?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is stored in intermediate activation tensors during the forward pass?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does setting a tensor's requires_grad property to False achieve?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary mathematical formula for Scaled Dot-Product Attention?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why are attention dot products scaled by 1/sqrt(d_k)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the purpose of causal masking in autoregressive decoder-only Transformers?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What advantage does Multi-Head Attention provide over single-head attention?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the computational and memory complexity of standard self-attention with respect to sequence length N?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the function of positional encodings (like RoPE or sinusoidal encodings) in Transformers?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does FlashAttention achieve significant speedups without changing the exact mathematical output?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the typical structure of a standard Transformer decoder layer?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why is AdamW preferred over standard Adam for training Transformer models?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary function of Gradient Clipping during neural network training?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the first moment vector (m_t) in the Adam optimizer estimate?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the purpose of a linear learning rate warmup at the beginning of training?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does Dropout regularize a neural network during training?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What happens to Dropout layers during model inference and evaluation?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In Cosine Annealing learning rate schedules, how does the learning rate evolve over time?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the second moment vector (v_t) in Adam track?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Bayes' Theorem used for in probabilistic machine learning?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In Bayes' theorem P(A|B) = P(B|A)P(A) / P(B), what is P(A) called?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the main distinction between Bayesian inference and standard Maximum Likelihood Estimation (MLE)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What type of uncertainty arises from a model's lack of knowledge due to sparse training data?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is a conjugate prior in Bayesian statistics?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which technique is commonly used to approximate intractable high-dimensional posterior distributions?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What role does the likelihood P(Data | Theta) play in Bayesian updating?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Maximum A Posteriori (MAP) estimation?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does Maximum Likelihood Estimation (MLE) aim to achieve?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Minimizing the negative log-likelihood of a Categorical distribution yields which standard loss function?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which probability distribution is parameterized by a mean and a standard deviation and forms a symmetric bell curve?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the variance of a random variable measure?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the expected value of a fair six-sided die roll?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What theorem states that the sample mean of independent random variables approaches a normal distribution as sample size increases?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does covariance measure between two random variables?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the range of values produced by a valid probability density function or probability mass function?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the gradient vector of a scalar loss function represent?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In which direction does gradient descent move parameter weights?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the primary role of the chain rule in neural network training?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is a partial derivative?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What mathematical matrix contains all first-order partial derivatives of a vector-valued function?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What occurs when gradients approach zero across early layers of a deep network?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the derivative of the standard ReLU activation function f(x) = max(0, x) for x > 0?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What mathematical matrix contains all second-order partial derivatives of a scalar function?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the resulting shape of multiplying a matrix of shape (32, 128) by a matrix of shape (128, 64)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which rule determines whether two tensor shapes are compatible for broadcasting?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the primary performance benefit of vectorized tensor operations over Python for-loops?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What does the dot product of two normalized unit vectors represent geometrically?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What occurs when you transpose an (M x N) matrix?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is an identity matrix?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which operation computes the L2 norm of a vector?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the effect of reshaping a tensor without altering its underlying memory buffer?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary operational loop used in the ReAct agent architecture?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does a Cross-Encoder re-ranker differ from a Bi-Encoder in retrieval pipelines?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does HyDE (Hypothetical Document Embeddings) improve retrieval for vague queries?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What are the three pillars of the RAG Triad evaluation framework?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why is tool schema validation (e.g. using JSON Schema or Pydantic) critical in agent systems?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the purpose of Query Decomposition in complex RAG workflows?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Self-RAG (Self-Reflective RAG)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How can infinite loops be prevented in autonomous LLM agent execution engines?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary trade-off of Approximate Nearest Neighbor (ANN) indexing compared to exact k-NN search?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does the HNSW (Hierarchical Navigable Small World) index achieve fast vector search?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why is token overlap typically included in text chunking strategies?": {
    "correct_index": 0,
    "explanation": ""
  },
  "When embedding vectors are normalized to unit length (L2 norm = 1), what is the relationship between dot product and cosine similarity?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary benefit of Product Quantization (PQ) in vector search indices?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Hybrid Search in modern retrieval architectures?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does Reciprocal Rank Fusion (RRF) do in retrieval pipelines?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What metric measures the proportion of true relevant documents retrieved in top-k search results?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why is the autoregressive token decoding phase of LLMs memory-bandwidth bound rather than compute bound?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does PagedAttention (vLLM) resolve KV-cache memory waste?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Continuous Batching in production LLM inference engines?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does AWQ (Activation-aware Weight Quantization) protect model accuracy during 4-bit compression?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does Time to First Token (TTFT) measure in LLM serving?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is Speculative Decoding?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In FP16 vs INT4 quantization, what is the approximate reduction factor in model weight memory?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does Inter-Token Latency (ITL) measure during streaming LLM generation?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary advantage of type-safe ORMs over raw SQL strings in TypeScript?": {
    "correct_index": 0,
    "explanation": "Type-safe ORMs validate query parameters and return types during TypeScript compilation."
  },
  "How does Drizzle ORM differ from Prisma in its architectural design?": {
    "correct_index": 0,
    "explanation": "Drizzle relies on native TypeScript type inference from schema definitions, offering minimal runtime overhead."
  },
  "What command in Prisma updates the TypeScript client types after editing schema.prisma?": {
    "correct_index": 0,
    "explanation": "prisma generate parses schema.prisma and emits the updated TypeScript client."
  },
  "Why is a migration tracking table (such as _prisma_migrations) necessary in production databases?": {
    "correct_index": 0,
    "explanation": "Migration tracking tables record executed migration files and their checksums to ensure consistent database schema evolution."
  },
  "What is the 'N+1 query problem' in database ORMs?": {
    "correct_index": 0,
    "explanation": "The N+1 problem occurs when an application fires separate queries for each entity relation instead of joining in batch."
  },
  "How do type-safe ORMs handle relational joins in TypeScript return types?": {
    "correct_index": 0,
    "explanation": "ORMs adjust TypeScript return types based on query select/include options, populating relation arrays with proper types."
  },
  "What is connection pooling and why is it essential when using ORMs in serverless environments?": {
    "correct_index": 0,
    "explanation": "Connection poolers (e.g., PgBouncer) manage reusable connections, preventing serverless spikes from overloading PostgreSQL."
  },
  "What is the risk of adding a NOT NULL column without a default value to an existing large production table?": {
    "correct_index": 0,
    "explanation": "Adding NOT NULL to existing populated tables requires either a DEFAULT value or a multi-step backfill migration."
  },
  "What does Third Normal Form (3NF) mandate in database schema design?": {
    "correct_index": 0,
    "explanation": "3NF requires a table to be in 2NF and have no transitive functional dependencies among non-key attributes."
  },
  "How are Many-to-Many (M:N) relationships implemented in relational databases?": {
    "correct_index": 0,
    "explanation": "A junction table links two entities using foreign keys and composite primary keys to represent many-to-many associations."
  },
  "What is the behavior of the foreign key rule 'ON DELETE CASCADE'?": {
    "correct_index": 0,
    "explanation": "ON DELETE CASCADE cascades parent deletions down to all dependent child records automatically."
  },
  "What does First Normal Form (1NF) require?": {
    "correct_index": 0,
    "explanation": "1NF eliminates repeating groups and ensures every column holds single atomic values."
  },
  "What is the purpose of a database 'CHECK' constraint?": {
    "correct_index": 0,
    "explanation": "CHECK constraints validate that boolean expressions on column values evaluate to true before allowing inserts or updates."
  },
  "Why is storing comma-separated lists of IDs in a single text column considered an anti-pattern in relational databases?": {
    "correct_index": 0,
    "explanation": "Un-normalized multi-value columns destroy relational integrity, prevent indexing, and complicate joins."
  },
  "What does the 'ON DELETE RESTRICT' action do when attempting to delete a parent row?": {
    "correct_index": 0,
    "explanation": "ON DELETE RESTRICT prevents parent record deletion as long as dependent child rows exist."
  },
  "What constraint ensures that no two rows have the same value in a specific column (such as email)?": {
    "correct_index": 0,
    "explanation": "The UNIQUE constraint guarantees uniqueness of column values across all rows in the table."
  },
  "What does 'EXPLAIN ANALYZE' do in PostgreSQL?": {
    "correct_index": 0,
    "explanation": "EXPLAIN ANALYZE executes the statement and outputs real runtime measurements and execution step details."
  },
  "Why are B-Tree indexes the default index type in PostgreSQL?": {
    "correct_index": 0,
    "explanation": "B-Tree indexes maintain sorted tree structures that deliver balanced O(log N) search and range scan performance."
  },
  "What does the 'leftmost prefix rule' dictate for composite indexes on columns (A, B, C)?": {
    "correct_index": 0,
    "explanation": "Composite B-trees can only be traversed if query filters include the leading (leftmost) indexed columns."
  },
  "Which index type is best suited for searching keys and tags inside PostgreSQL JSONB columns?": {
    "correct_index": 0,
    "explanation": "GIN indexes excel at indexing multi-value composite types like JSONB objects and arrays."
  },
  "What is a 'Sequential Scan' (Seq Scan) in a query plan?": {
    "correct_index": 0,
    "explanation": "A Seq Scan reads the entire table sequentially from disk, which causes performance issues on large datasets."
  },
  "What is the difference between 'INNER JOIN' and 'LEFT JOIN'?": {
    "correct_index": 0,
    "explanation": "LEFT JOIN preserves all rows from the primary left table regardless of whether a matching right row exists."
  },
  "What is a Common Table Expression (CTE) in SQL?": {
    "correct_index": 0,
    "explanation": "CTEs create temporary modular result sets using the WITH keyword to improve readability and query structure."
  },
  "What does a Window Function (such as ROW_NUMBER() OVER (...)) do?": {
    "correct_index": 0,
    "explanation": "Window functions compute aggregations and rankings over partitions while preserving individual row granularity."
  },
  "How does Node.js handle high concurrency using a single main thread?": {
    "correct_index": 0,
    "explanation": "Node.js relies on non-blocking I/O and libuv to offload operations, executing callbacks as events resolve."
  },
  "How does Express identify a global error-handling middleware function?": {
    "correct_index": 0,
    "explanation": "Express inspects function arity; functions with exactly 4 parameters are treated as error-handling middleware."
  },
  "What is the consequence of forgetting to call next() or send a response in an Express middleware?": {
    "correct_index": 0,
    "explanation": "Failing to terminate the response or call next() halts the middleware chain, leaving the client waiting."
  },
  "When do Promise microtasks and process.nextTick callbacks execute in Node.js?": {
    "correct_index": 0,
    "explanation": "Microtasks have priority and drain immediately upon completion of current synchronous execution."
  },
  "What is the primary function of the 'helmet' middleware package in Express?": {
    "correct_index": 0,
    "explanation": "Helmet automatically configures crucial HTTP response security headers."
  },
  "Which Node.js function schedules a callback to run during the Check phase of the event loop?": {
    "correct_index": 0,
    "explanation": "setImmediate callbacks are queued and executed specifically during the Check phase."
  },
  "Why should synchronous CPU-intensive computations (e.g., large synchronous JSON parsing) be avoided on the main Node.js thread?": {
    "correct_index": 0,
    "explanation": "Synchronous CPU work blocks the main thread, delaying all incoming requests and pending I/O callbacks."
  },
  "What is the purpose of CORS middleware in Express?": {
    "correct_index": 0,
    "explanation": "CORS headers control browser permissions for cross-origin API requests from foreign web domains."
  },
  "Which HTTP status code should be returned when a POST request successfully creates a new database resource?": {
    "correct_index": 0,
    "explanation": "201 Created indicates the request succeeded and resulted in the creation of a new resource."
  },
  "How does Zod infer a static TypeScript type from a runtime schema definition?": {
    "correct_index": 0,
    "explanation": "z.infer<typeof Schema> extracts the static TypeScript type representation directly from the Zod schema."
  },
  "What is the difference between 'PUT' and 'PATCH' HTTP methods in RESTful API design?": {
    "correct_index": 0,
    "explanation": "PUT is idempotent and replaces the complete resource; PATCH modifies only the specified attributes."
  },
  "What is the primary benefit of using 'schema.safeParse()' instead of 'schema.parse()' in Zod?": {
    "correct_index": 0,
    "explanation": "safeParse returns a discriminated union result, making error handling clean and preventing unhandled exceptions."
  },
  "Which HTTP status code signifies that request validation failed due to invalid schema fields?": {
    "correct_index": 0,
    "explanation": "422 Unprocessable Entity (or 400 Bad Request) indicates syntactically correct requests that fail semantic domain validation rules."
  },
  "What does 'z.string().email().optional()' validate?": {
    "correct_index": 0,
    "explanation": "It requires the value, if present, to be a valid RFC email address string, while allowing undefined."
  },
  "What does 'safeParse' do with unexpected, undeclared fields in an object payload by default in Zod?": {
    "correct_index": 0,
    "explanation": "Zod strips unknown keys by default, protecting backends from mass assignment vulnerabilities."
  },
  "Which HTTP method is considered 'safe' and 'idempotent' for reading resources without modifying server state?": {
    "correct_index": 0,
    "explanation": "GET requests are read-only, safe, and idempotent, meaning repeated invocations produce the same effect without modifying state."
  },
  "Why must passwords be hashed using algorithms like Argon2id or bcrypt rather than fast hashes like SHA-256?": {
    "correct_index": 0,
    "explanation": "Adaptive hashing algorithms consume configurable CPU and memory resources, neutralizing high-speed hardware brute-forcing."
  },
  "What is the primary security advantage of the 'HttpOnly' cookie flag?": {
    "correct_index": 0,
    "explanation": "HttpOnly prevents malicious scripts from reading document.cookie, stopping session hijacking in XSS attacks."
  },
  "What does a cryptographic 'salt' accomplish in password hashing?": {
    "correct_index": 0,
    "explanation": "A unique random salt per user prevents attackers from using rainbow tables to crack duplicate or common passwords in bulk."
  },
  "What does the 'SameSite=Lax' cookie attribute protect against?": {
    "correct_index": 0,
    "explanation": "SameSite=Lax prevents cookies from being sent on cross-origin subrequests, mitigating CSRF exploitation."
  },
  "Why is immediate session revocation straightforward in stateful database/Redis sessions?": {
    "correct_index": 0,
    "explanation": "Because the server checks the database/cache on each request, deleting the session record revokes access immediately."
  },
  "What should the 'Secure' cookie attribute be set to in production web applications?": {
    "correct_index": 0,
    "explanation": "Setting Secure: true guarantees the browser never transmits the cookie over unencrypted plaintext HTTP."
  },
  "What is an Argon2id 'memory cost' parameter?": {
    "correct_index": 0,
    "explanation": "Argon2id's memory hardness requires attackers to dedicate significant RAM per parallel cracking attempt, making GPU clusters ineffective."
  },
  "Where should user passwords NEVER be logged or transmitted?": {
    "correct_index": 0,
    "explanation": "Passwords must never appear in application logs, telemetry, or query strings where they could be logged by intermediaries."
  },
  "What are the three period-separated parts of a JSON Web Token (JWT)?": {
    "correct_index": 0,
    "explanation": "A JWT is composed of a base64url-encoded Header, Payload (claims), and cryptographic Signature."
  },
  "Why is a short lifespan (e.g., 15 minutes) recommended for stateless JWT Access Tokens?": {
    "correct_index": 0,
    "explanation": "Short lifespans limit the window of vulnerability if an access token is intercepted."
  },
  "What is 'Refresh Token Rotation'?": {
    "correct_index": 0,
    "explanation": "Refresh token rotation ensures single-use refresh tokens; detecting reuse of an old token signals potential compromise."
  },
  "What HTTP status code should be returned when an authenticated user attempts to access an admin route without sufficient permissions?": {
    "correct_index": 0,
    "explanation": "401 means unauthenticated (missing/invalid credentials); 403 means authenticated but forbidden (insufficient privileges)."
  },
  "What does the 'exp' claim represent in a JWT payload?": {
    "correct_index": 0,
    "explanation": "The 'exp' (Expiration Time) claim specifies the exact timestamp after which the JWT is no longer accepted."
  },
  "What is Role-Based Access Control (RBAC)?": {
    "correct_index": 0,
    "explanation": "RBAC evaluates permissions mapped to defined roles, gating system resources according to assigned user responsibilities."
  },
  "Can a client decode and read the JSON claims inside a standard JWT payload without the server secret key?": {
    "correct_index": 0,
    "explanation": "Standard JWTs are signed, not encrypted. Anyone can decode the base64 payload; thus, secrets must never be placed in JWT claims."
  },
  "Where should refresh tokens be stored on web clients to prevent XSS theft?": {
    "correct_index": 0,
    "explanation": "HttpOnly cookies prevent client-side JavaScript access, shielding refresh tokens from theft during XSS exploits."
  },
  "What does JSX compile into behind the scenes?": {
    "correct_index": 0,
    "explanation": "JSX is syntactic sugar that compiles into function calls creating virtual element descriptor objects."
  },
  "Why is using array index as a 'key' prop (e.g. key={index}) discouraged for dynamic lists?": {
    "correct_index": 0,
    "explanation": "Index keys change when items are reordered or filtered, causing React to reuse DOM elements incorrectly."
  },
  "What does 'unidirectional data flow' mean in React?": {
    "correct_index": 0,
    "explanation": "In React, state flows strictly downward as props; children communicate updates upward by invoking parent callback functions."
  },
  "What is a 'pure component' render function in React?": {
    "correct_index": 0,
    "explanation": "Pure components behave like pure mathematical functions: they do not produce side effects and produce identical output for identical inputs."
  },
  "What happens during reconciliation when the root element type changes (e.g. from <div> to <span>)?": {
    "correct_index": 0,
    "explanation": "Whenever the element type changes at a tree position, React destroys the old subtree and reconstructs the new elements."
  },
  "How does the 'children' prop facilitate component composition in React?": {
    "correct_index": 0,
    "explanation": "The children prop allows container components (e.g., Cards, Dialogs, Shells) to wrap and render arbitrary nested content."
  },
  "Can props passed to a React component be directly mutated by the receiving component?": {
    "correct_index": 0,
    "explanation": "Props are strictly immutable. To change values, the component must request state changes via parent callbacks."
  },
  "What is React's Virtual DOM reconciliation complexity?": {
    "correct_index": 0,
    "explanation": "React achieves linear O(N) reconciliation performance using heuristic rules regarding element types and unique key attributes."
  },
  "Why must React hooks never be called inside conditionals or loops?": {
    "correct_index": 0,
    "explanation": "React relies on a stable, predictable call order of hooks on every render to correctly associate state with each hook."
  },
  "When does the cleanup function returned by a useEffect hook run?": {
    "correct_index": 0,
    "explanation": "Cleanup functions execute immediately prior to subsequent effect executions and upon component unmounting."
  },
  "What is a 'stale closure' in the context of React hooks?": {
    "correct_index": 0,
    "explanation": "Stale closures occur when an asynchronous callback captures a variable from an earlier render pass due to missing dependencies."
  },
  "What is the primary difference between useRef and useState?": {
    "correct_index": 0,
    "explanation": "useRef provides a mutable container that persists across renders without triggering a new render cycle upon modification."
  },
  "How does 'useCallback(fn, deps)' optimize child component rendering?": {
    "correct_index": 0,
    "explanation": "useCallback caches function instances, maintaining stable object references needed by React.memo child components."
  },
  "Why should functional state updates like 'setCount(c => c + 1)' be used when updating state based on previous state?": {
    "correct_index": 0,
    "explanation": "Functional updaters pass the most up-to-date state as an argument, eliminating stale closure dependencies."
  },
  "When does 'useLayoutEffect' execute compared to 'useEffect'?": {
    "correct_index": 0,
    "explanation": "useLayoutEffect fires synchronously after all DOM mutations and before visual paint, ideal for measuring DOM layout."
  },
  "What should custom hook names always start with in React?": {
    "correct_index": 0,
    "explanation": "The 'use' prefix enables React linting rules and the compiler to enforce the Rules of Hooks on custom hooks."
  },
  "What is the primary performance advantage of Zustand selectors compared to standard React Context?": {
    "correct_index": 0,
    "explanation": "Zustand uses subscription-based selector diffing so components re-render strictly when their selected state slice mutates."
  },
  "How are actions defined in a Zustand store?": {
    "correct_index": 0,
    "explanation": "Zustand combines state and updater functions within the same store creation closure using the `set` helper."
  },
  "What middleware in Zustand automatically synchronizes store state with browser localStorage?": {
    "correct_index": 0,
    "explanation": "The `persist` middleware serializes and restores store state from storage engines like localStorage or sessionStorage."
  },
  "Can a Zustand action be an asynchronous (async/await) function?": {
    "correct_index": 0,
    "explanation": "Zustand natively supports async action functions without additional middleware."
  },
  "How does Zustand determine if a component should re-render following a state change?": {
    "correct_index": 0,
    "explanation": "Zustand uses strict equality (===) comparison on selector return values to determine whether to trigger a subscriber re-render."
  },
  "What is the recommended approach for managing server-side cached data vs UI client state in modern React applications?": {
    "correct_index": 0,
    "explanation": "Separating server caching (TanStack Query) from ephemeral client UI state (Zustand) ensures proper cache invalidation and clean architecture."
  },
  "Can Zustand store state be accessed and updated outside of React components?": {
    "correct_index": 0,
    "explanation": "Zustand stores expose `.getState()` and `.setState()` methods for use in external utility functions, event handlers, and API interceptors."
  },
  "What does the 'immer' middleware enable in Zustand?": {
    "correct_index": 0,
    "explanation": "Immer produces immutable state copies while allowing developers to write direct mutations on a proxy draft object."
  },
  "What is the primary benefit of Tailwind CSS Just-In-Time (JIT) compiler?": {
    "correct_index": 0,
    "explanation": "The JIT compiler scans source files for class strings and emits the minimum required CSS, keeping production bundle sizes minuscule."
  },
  "How are responsive breakpoint modifiers structured in Tailwind CSS?": {
    "correct_index": 0,
    "explanation": "Tailwind uses mobile-first breakpoint prefixes (sm:, md:, lg:, xl:, 2xl:) to apply utility rules at specified min-width queries."
  },
  "Why is 'tailwind-merge' (twMerge) essential when building reusable UI components with prop-based class overrides?": {
    "correct_index": 0,
    "explanation": "tailwind-merge understands Tailwind class hierarchy and strips overridden base classes to prevent CSS cascade conflicts."
  },
  "How do you apply styles only when a user hovers over a button in Tailwind CSS?": {
    "correct_index": 0,
    "explanation": "The hover: prefix targets the CSS :hover pseudo-class state directly on utility declarations."
  },
  "What does the utility class 'backdrop-blur-md' do?": {
    "correct_index": 0,
    "explanation": "backdrop-blur-md applies backdrop-filter: blur(12px) to create frosted-glass aesthetics on translucent containers."
  },
  "How can arbitrary, non-standard CSS values be declared in Tailwind (e.g., top 117px)?": {
    "correct_index": 0,
    "explanation": "Tailwind JIT compiles arbitrary values wrapped in square brackets (e.g., w-[350px], bg-[#1da1f2]) on the fly."
  },
  "What is the recommended design token approach in Tailwind for consistent dark mode support?": {
    "correct_index": 0,
    "explanation": "The dark: variant applies styling rules when the dark mode class or media query is active."
  },
  "What does the utility 'ring-2 ring-emerald-500/20' do?": {
    "correct_index": 0,
    "explanation": "The ring utilities create accessible, customizable focus and border rings using CSS box-shadow."
  },
  "What is the primary difference between TypeScript interfaces and type aliases?": {
    "correct_index": 0,
    "explanation": "Interfaces can be declared multiple times and automatically merge into a unified definition, while type aliases are immutable once defined."
  },
  "What does 'structural typing' (duck typing) mean in TypeScript?": {
    "correct_index": 0,
    "explanation": "In structural typing, if two types share the same required properties and types, TypeScript treats them as compatible."
  },
  "What is the key difference between the 'unknown' type and the 'any' type?": {
    "correct_index": 0,
    "explanation": "unknown is a type-safe top type that enforces explicit type verification before operations can be invoked on it."
  },
  "What does the 'readonly' property modifier prevent?": {
    "correct_index": 0,
    "explanation": "The readonly modifier prevents direct mutation of the property after initialization."
  },
  "What does enabling 'strictNullChecks' in tsconfig.json enforce?": {
    "correct_index": 0,
    "explanation": "strictNullChecks prevents null/undefined from being silently assigned to string, number, or object types."
  },
  "What does the 'never' type signify in TypeScript?": {
    "correct_index": 0,
    "explanation": "The never type represents unreachable states, used in exhaustive type checking and non-returning functions."
  },
  "How is an intersection type declared in TypeScript?": {
    "correct_index": 0,
    "explanation": "The ampersand '&' operator combines multiple types into a single intersection type containing all combined properties."
  },
  "What happens if you compile TypeScript with 'noImplicitAny: true'?": {
    "correct_index": 0,
    "explanation": "noImplicitAny forces developers to provide explicit types when TypeScript cannot safely infer them, preventing accidental 'any' leakages."
  },
  "What is the defining characteristic of a Discriminated Union in TypeScript?": {
    "correct_index": 0,
    "explanation": "Discriminated unions share a common literal tag property, allowing TypeScript to narrow the variant inside control-flow branches."
  },
  "How does assigning an unhandled branch to the 'never' type enforce exhaustive checking?": {
    "correct_index": 0,
    "explanation": "Because 'never' cannot hold any value, assigning an unhandled variant to a 'never' variable causes a compile-time type mismatch error."
  },
  "What does '<K extends keyof T>' do in a generic function definition?": {
    "correct_index": 0,
    "explanation": "extends keyof T restricts K to the union of string/number literal property names belonging to type T."
  },
  "Which utility type constructs a type picking only keys K from type T?": {
    "correct_index": 0,
    "explanation": "Pick<T, K> constructs an object type with only the specified set of properties K from T."
  },
  "What does the 'infer' keyword do inside a conditional type?": {
    "correct_index": 0,
    "explanation": "infer allows extracting and naming a sub-type (such as a Promise value or function return type) within a conditional type branch."
  },
  "Which utility type creates an object type with specified key types K and value types T?": {
    "correct_index": 0,
    "explanation": "Record<K, T> generates an object type where keys are of type K and values are of type T."
  },
  "What is the return type of 'UnpackPromise<Promise<string>>' using type UnpackPromise<T> = T extends Promise<infer U> ? U : T?": {
    "correct_index": 0,
    "explanation": "The conditional type checks if T is a Promise, and infer U extracts the inner type (string)."
  },
  "Why is 'Omit<User, \"password\">' useful in API data transfer objects?": {
    "correct_index": 0,
    "explanation": "Omit removes specified keys from a type, creating safe DTO types without sensitive attributes."
  },
  "What does setting 'box-sizing: border-box' ensure in CSS?": {
    "correct_index": 0,
    "explanation": "Under border-box, the width and height properties include content, padding, and border, preventing unexpected layout overflows."
  },
  "Which Flexbox property controls the alignment of items along the main axis?": {
    "correct_index": 0,
    "explanation": "justify-content distributes items along the main axis (row or column direction)."
  },
  "How can you prevent a fixed-size icon from shrinking inside a flex container with expanding text?": {
    "correct_index": 0,
    "explanation": "flex-shrink: 0 prevents the item from shrinking below its specified basis or content width when space is tight."
  },
  "What does 'justify-content: space-between' do in a flex row container?": {
    "correct_index": 0,
    "explanation": "space-between places the first child at the start, the last child at the end, and distributes remaining space equally in between."
  },
  "What is the effect of setting 'flex: 1' on a flex item?": {
    "correct_index": 0,
    "explanation": "flex: 1 is shorthand for flex: 1 1 0%, letting the item grow and shrink to absorb equal shares of available space."
  },
  "Which property sets gutters between flex items without applying outer margins?": {
    "correct_index": 0,
    "explanation": "The 'gap' property defines gutters between adjacent flex and grid children without bleeding into container edges."
  },
  "If 'flex-direction: column' is set on a container, which property aligns items horizontally across the container?": {
    "correct_index": 0,
    "explanation": "In column direction, the cross axis is horizontal, so align-items controls horizontal alignment."
  },
  "What is the difference between margin and padding in the CSS box model?": {
    "correct_index": 0,
    "explanation": "Padding adds interior clearance between content and border, whereas margin creates exterior clearance outside the border."
  },
  "What is the primary architectural difference between CSS Grid and Flexbox?": {
    "correct_index": 0,
    "explanation": "CSS Grid manages rows and columns concurrently, whereas Flexbox manages distribution along a single main axis at a time."
  },
  "What does the 'fr' unit represent in CSS Grid?": {
    "correct_index": 0,
    "explanation": "1fr represents one part of the remaining available space after fixed and content-sized tracks are calculated."
  },
  "What does 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))' achieve?": {
    "correct_index": 0,
    "explanation": "auto-fit with minmax generates as many columns as fit the viewport width (minimum 200px), expanding them to share free space."
  },
  "In CSS Grid line numbering, what does line index '-1' refer to?": {
    "correct_index": 0,
    "explanation": "Negative line numbers count backward from the end edge; -1 represents the very last grid line."
  },
  "Which property allows positioning elements using visual ASCII-like layout names?": {
    "correct_index": 0,
    "explanation": "grid-template-areas defines named grid regions in string format, which children reference via grid-area: name."
  },
  "How can an item be configured to span 3 columns starting from column line 1?": {
    "correct_index": 0,
    "explanation": "grid-column: 1 / span 3 places the item at line 1 and extends it across 3 tracks."
  },
  "What does 'grid-auto-flow: dense' do?": {
    "correct_index": 0,
    "explanation": "The 'dense' packing algorithm scans for earlier empty spots in the grid and places smaller subsequent items there to prevent gaps."
  },
  "What is the difference between 'auto-fit' and 'auto-fill' in CSS Grid?": {
    "correct_index": 0,
    "explanation": "auto-fit stretches items across the whole container by collapsing empty tracks; auto-fill maintains empty tracks if space permits."
  },
  "Which HTML5 element represents self-contained content intended to be independently distributable?": {
    "correct_index": 1,
    "explanation": "<article> designates independent, self-contained content suitable for standalone syndication or reuse."
  },
  "Why is using a native <button> element preferable to a <div onClick={...}> for clickable actions?": {
    "correct_index": 0,
    "explanation": "Native button elements have built-in accessibility roles, tab sequence inclusion, and Space/Enter key event handlers."
  },
  "What landmark role does the <main> element map to in the browser accessibility tree?": {
    "correct_index": 1,
    "explanation": "The <main> tag maps directly to the main landmark, signaling the central content of the document."
  },
  "How should an accessible HTML form label be linked explicitly to its corresponding text input?": {
    "correct_index": 0,
    "explanation": "The 'for' attribute on a label links explicitly to the target input's 'id', enabling click-to-focus and screen reader reading."
  },
  "What is the purpose of 'aria-live=\"polite\"' on a dynamic notification container?": {
    "correct_index": 0,
    "explanation": "aria-live='polite' announces dynamic DOM updates at the next available pause without cutting off current screen reader announcements."
  },
  "Which element provides a caption for a <fieldset> grouping related form controls?": {
    "correct_index": 1,
    "explanation": "The <legend> element serves as the title or caption for the content enclosed within a <fieldset>."
  },
  "Why should heading levels (h1 through h6) not skip levels in a document outline?": {
    "correct_index": 0,
    "explanation": "Screen readers rely on heading hierarchy for document navigation; skipping levels creates confusion regarding nested content relationships."
  },
  "What landmark role is assigned by default to a top-level <footer> element in a document?": {
    "correct_index": 1,
    "explanation": "A top-level <footer> within the document context maps to the contentinfo landmark role."
  },
  "What is the primary philosophy of the 'Testing Pyramid' in software quality assurance?": {
    "correct_index": 0,
    "explanation": "The pyramid optimizes test speed, cost, and confidence by favoring unit tests for bulk logic and E2E tests for key user journeys."
  },
  "Why is Vitest significantly faster than older testing frameworks in Vite projects?": {
    "correct_index": 0,
    "explanation": "Vitest reuses Vite config, loaders, and transforms natively, providing instant feedback and module execution."
  },
  "How does Playwright prevent flaky tests caused by asynchronous UI rendering?": {
    "correct_index": 0,
    "explanation": "Playwright auto-waits for elements to reach actionable states (visible, enabled, stable) before executing clicks or assertions."
  },
  "What is the role of an 'integration test' compared to a 'unit test'?": {
    "correct_index": 0,
    "explanation": "Integration tests validate data flow and interactions between multiple modules or real infrastructure services."
  },
  "How can test idempotency be maintained when running integration tests against a database?": {
    "correct_index": 0,
    "explanation": "Transactional rollbacks or unique test database fixtures guarantee test isolation without data cross-contamination."
  },
  "What does 'vi.spyOn(object, method)' do in Vitest?": {
    "correct_index": 0,
    "explanation": "vi.spyOn observes method calls, arguments, and outcomes while optionally preserving or mocking original behavior."
  },
  "Which Playwright locator strategy is recommended as the most resilient for finding interactive UI elements?": {
    "correct_index": 0,
    "explanation": "Accessible user-facing locators (getByRole, getByLabel) mimic real user interaction and resist markup refactors."
  },
  "What is 'Code Coverage' in automated testing suites?": {
    "correct_index": 0,
    "explanation": "Code coverage tracks which lines and branches were executed by tests, identifying untested code paths."
  },
  "What is the primary benefit of Multi-Stage Docker builds in TypeScript projects?": {
    "correct_index": 0,
    "explanation": "Multi-stage builds discard compilers and dev tools, resulting in lightweight, secure production images."
  },
  "Why should production containers switch from root to a non-root user (e.g. USER node)?": {
    "correct_index": 0,
    "explanation": "Running as a non-root user prevents container breakout vulnerabilities from gaining root host privileges."
  },
  "What is the purpose of the '.dockerignore' file?": {
    "correct_index": 0,
    "explanation": ".dockerignore excludes sensitive or large files from being sent to the Docker daemon during build time."
  },
  "How does Docker Compose enable communication between different service containers (e.g. app connecting to db)?": {
    "correct_index": 0,
    "explanation": "Docker Compose provisions a shared network where service names (e.g. 'db', 'cache') resolve automatically via internal DNS."
  },
  "Why are persistent Docker Volumes used for PostgreSQL database containers in Docker Compose?": {
    "correct_index": 0,
    "explanation": "Container file systems are ephemeral; named volumes preserve database files across container lifecycle recreations."
  },
  "Why is 'COPY package*.json ./' and 'RUN npm ci' executed before copying application source code in Dockerfiles?": {
    "correct_index": 0,
    "explanation": "Docker caches intermediate layers; copying lockfiles first allows Docker to reuse cached node_modules if dependencies haven't changed."
  },
  "What does the EXPOSE instruction do in a Dockerfile?": {
    "correct_index": 0,
    "explanation": "EXPOSE acts as metadata documentation specifying the container's intended listening ports."
  },
  "Which command starts all services defined in a docker-compose.yml file in detached background mode?": {
    "correct_index": 0,
    "explanation": "docker compose up -d builds, creates, and starts all defined service containers in background detached mode."
  },
  "Why is 'npm ci' preferred over 'npm install' in automated CI/CD pipeline workflows?": {
    "correct_index": 0,
    "explanation": "npm ci guarantees deterministic, clean installations based on package-lock.json and fails if lockfile mismatches occur."
  },
  "What is a 'Branch Protection Rule' in repository management?": {
    "correct_index": 0,
    "explanation": "Branch protection rules block direct unverified commits, ensuring all PRs pass automated tests before merging to main."
  },
  "Where should sensitive production database credentials and API secret keys be configured for GitHub Actions workflows?": {
    "correct_index": 0,
    "explanation": "Encrypted secrets store sensitive tokens securely and prevent accidental exposure in source control or job logs."
  },
  "What does the 'actions/checkout@v4' action do in a workflow job?": {
    "correct_index": 0,
    "explanation": "actions/checkout downloads the repository code to the runner workspace."
  },
  "What is the difference between Continuous Integration (CI) and Continuous Deployment (CD)?": {
    "correct_index": 0,
    "explanation": "CI validates code quality through automated tests; CD delivers validated artifacts directly to production."
  },
  "Why should container images built in CI/CD pipelines be tagged with git commit SHAs (e.g., app:commit_sha) rather than just 'latest'?": {
    "correct_index": 0,
    "explanation": "Commit SHA tagging ensures reproducible, immutable artifact versioning and reliable rollback capabilities."
  },
  "How can dependency caching optimize GitHub Actions workflow run durations?": {
    "correct_index": 0,
    "explanation": "Dependency caching preserves package manager caches between runs, slashing build execution times."
  },
  "What triggers a GitHub Actions workflow defined with 'on: [pull_request]'?": {
    "correct_index": 0,
    "explanation": "The pull_request event triggers workflow runs when PRs are opened or updated with new commits."
  },
  "Why should long-running operations like sending emails or generating reports be pushed to a background job queue (e.g. BullMQ)?": {
    "correct_index": 0,
    "explanation": "Delegating heavy tasks to queues enables fast HTTP responses and isolates failure retries from user requests."
  },
  "What is a 'Dead-Letter Queue' (DLQ) in background job architectures?": {
    "correct_index": 0,
    "explanation": "A DLQ holds failed job payloads after all retries fail, allowing developers to inspect failure reasons and replay jobs."
  },
  "What does 'exponential backoff' accomplish when retrying failed background jobs?": {
    "correct_index": 0,
    "explanation": "Exponential backoff widens retry spacing, giving failing third-party APIs or databases time to recover."
  },
  "What backing data store does BullMQ rely on for queue and state persistence?": {
    "correct_index": 0,
    "explanation": "BullMQ uses Redis data structures (streams, hashes, sorted sets) and atomic Lua scripts for job queuing."
  },
  "What does the 'concurrency' option configure on a BullMQ Worker instance?": {
    "correct_index": 0,
    "explanation": "Worker concurrency dictates how many jobs are processed concurrently by that worker process."
  },
  "Can BullMQ execute recurring jobs on a cron schedule?": {
    "correct_index": 0,
    "explanation": "BullMQ supports repeating jobs with standard 5-field cron syntax or fixed millisecond intervals."
  },
  "Why must job payloads passed to BullMQ queues be JSON-serializable?": {
    "correct_index": 0,
    "explanation": "Job data is serialized to JSON before being stored in Redis, meaning functions or circular references cannot be passed."
  },
  "What UI dashboard tool is commonly used to inspect and monitor BullMQ job queues in Node.js?": {
    "correct_index": 0,
    "explanation": "Bull-Board is a popular dashboard package that plugs into Express/Next.js to visualize active, completed, and failed BullMQ jobs."
  },
  "What is the primary operational characteristic of the 'Cache-Aside' pattern with Redis?": {
    "correct_index": 0,
    "explanation": "Cache-Aside queries cache first; on a miss, it fetches from the database and sets the cache with an expiration."
  },
  "What does 'TTL' (Time-To-Live) signify when setting a key in Redis?": {
    "correct_index": 0,
    "explanation": "TTL specifies the countdown expiration duration, ensuring stale cached data is purged automatically."
  },
  "What is the purpose of 'Rate Limiting' on public API endpoints?": {
    "correct_index": 0,
    "explanation": "Rate limiting throttles excessive requests, protecting servers from malicious flooding and scraper bots."
  },
  "Why is Redis able to achieve sub-millisecond read and write latency?": {
    "correct_index": 0,
    "explanation": "Because Redis operates in-memory, operations avoid disk I/O bottlenecks and execute in microseconds."
  },
  "What is 'Cache Invalidation' and why is it important?": {
    "correct_index": 0,
    "explanation": "Cache invalidation ensures cached copies remain synchronized with persistent database updates."
  },
  "What does the Redis 'INCR' command do?": {
    "correct_index": 0,
    "explanation": "INCR performs an atomic integer increment, making it ideal for hit counters and rate limiters."
  },
  "What is a 'Cache Stampede' (Thundering Herd) problem?": {
    "correct_index": 0,
    "explanation": "A cache stampede occurs when high concurrency overwhelms databases upon the expiration of a frequently accessed cache key."
  },
  "What data structure in Redis is most effective for sliding-window rate limiters?": {
    "correct_index": 0,
    "explanation": "Sorted sets allow pruning expired timestamps with ZREMRANGEBYSCORE and counting current window requests with ZCARD."
  },
  "What is the default component type in Next.js App Router (app directory)?": {
    "correct_index": 0,
    "explanation": "All components inside the Next.js app directory are React Server Components by default unless marked with 'use client'."
  },
  "How much JavaScript code do React Server Components ship to the client browser?": {
    "correct_index": 0,
    "explanation": "Server components execute exclusively on the server; their code and heavy dependencies are excluded from client JS bundles."
  },
  "When must the 'use client' directive be declared at the top of a file?": {
    "correct_index": 0,
    "explanation": "'use client' defines the boundary where client-side interactivity, state, and event listeners are enabled."
  },
  "How does progressive streaming with React Suspense improve initial page load performance?": {
    "correct_index": 0,
    "explanation": "Suspense streaming sends the page layout and skeleton immediately, streaming data-dependent components as they resolve."
  },
  "Can a Server Component directly query a PostgreSQL database using an ORM without calling an HTTP API route?": {
    "correct_index": 0,
    "explanation": "Because Server Components run in the server environment, they can invoke database queries and ORMs directly."
  },
  "What restriction applies to props passed from a Server Component to a Client Component?": {
    "correct_index": 0,
    "explanation": "Data crossing the server-to-client boundary must be serializable into the RSC wire payload format."
  },
  "How can a Client Component render a Server Component without converting it into a Client Component?": {
    "correct_index": 0,
    "explanation": "Using the children pattern (composition), Server Components can be rendered by the server and passed as JSX into client wrappers."
  },
  "What special file in a Next.js route directory automatically creates a Suspense boundary for that route segment?": {
    "correct_index": 0,
    "explanation": "Next.js automatically wraps page.tsx content in a React Suspense boundary using the fallback UI defined in loading.tsx."
  },
  "What directive designates a function as a Server Action in Next.js?": {
    "correct_index": 0,
    "explanation": "The 'use server' directive at the file or function level marks asynchronous functions as callable Server Actions."
  },
  "What does 'revalidatePath(\"/dashboard\")' do when called inside a Server Action?": {
    "correct_index": 0,
    "explanation": "revalidatePath purges Next.js cached data for the specified path, refreshing Server Components on the next render."
  },
  "What is 'Progressive Enhancement' when using Server Actions with native HTML <form action={...}> elements?": {
    "correct_index": 0,
    "explanation": "Using native HTML form actions allows browsers to perform standard POST submissions even before client JS hydrates."
  },
  "What is the purpose of the 'useOptimistic' React hook in Next.js forms?": {
    "correct_index": 0,
    "explanation": "useOptimistic renders instant optimistic state, reverting automatically if the server action rejects."
  },
  "How does 'revalidateTag(tag)' differ from 'revalidatePath(path)'?": {
    "correct_index": 0,
    "explanation": "revalidateTag enables targeted cache invalidation across arbitrary pages sharing the same data cache tag."
  },
  "Why must input data passed to Server Actions always be validated using libraries like Zod?": {
    "correct_index": 0,
    "explanation": "Server Actions create public HTTP endpoints; failing to validate inputs exposes applications to malicious parameter manipulation."
  },
  "Can Server Actions set or delete HTTP cookies in Next.js?": {
    "correct_index": 0,
    "explanation": "The next/headers cookies() API allows reading, setting, and deleting cookies directly inside Server Actions."
  },
  "What React hook is used to access the return state and pending status of a Server Action form?": {
    "correct_index": 0,
    "explanation": "useActionState manages the returned action state (success, validation errors) and pending transition status."
  },
  "What two properties are required for a problem to be solvable via Dynamic Programming?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary difference between memoization and tabulation in dynamic programming?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which algorithm finds the shortest path between nodes in a weighted graph with non-negative edge weights?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What graph representation is strictly required to perform a Topological Sort?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the average time complexity of finding an element in a balanced Binary Search Tree?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What data structure is typically used to implement Breadth-First Search (BFS)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What technique does Dijkstra's algorithm use to efficiently retrieve the next unvisited vertex with the smallest distance?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In Big-O notation, what does O(n log n) complexity represent compared to O(n^2)?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is a cycle in graph theory?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary purpose of a CPU flame graph?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What risk is associated with premature optimization without empirical profiling?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What metric does memory profiling primarily inspect?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In profiling terminology, what is a \"hot path\"?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the main objective of micro-benchmarking?": {
    "correct_index": 0,
    "explanation": ""
  },
  "How does sampling profiling minimize overhead compared to instrumentation profiling?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does high garbage collection pause time indicate in managed runtimes?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is a memory leak in long-running services?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Why should micro-benchmarks account for compiler optimizations such as dead code elimination?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which data structure provides O(1) average time complexity for key-value lookups?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the primary characteristic of an array data structure?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What access pattern defines a standard Queue data structure?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What access pattern defines a standard Stack data structure?": {
    "correct_index": 1,
    "explanation": ""
  },
  "In a singly linked list, what does each node contain?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is a major tradeoff of inserting an element at the beginning of a contiguous array?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which data structure is ideal for checking if an item exists with constant-time lookup and uniqueness?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In a binary search tree, where are values smaller than the root node positioned?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What occurs during a hash collision in a hash map?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which category of design patterns deals with object creation mechanisms?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary purpose of the Singleton pattern?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which design pattern defines a one-to-many dependency so that when one object changes state, all dependents are notified?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What problem does the Adapter pattern solve?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which pattern encapsulates a family of algorithms, making them interchangeable at runtime?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is a potential downside of applying design patterns without a concrete need?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which pattern attaches additional responsibilities to an object dynamically without modifying its underlying class?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does the Factory Method pattern delegate to subclasses?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In the Model-View-Controller (MVC) architectural pattern, what is the role of the Controller?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary benefit of encapsulating logic within functions?": {
    "correct_index": 0,
    "explanation": ""
  },
  "In a function definition, what is the term for the variables declared to receive inputs?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What control flow structure executes a block repeatedly while a boolean condition remains true?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What occurs when a recursive function lacks a valid base case?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the purpose of a return statement inside a function?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which keyword is commonly used to prematurely exit a loop construct?": {
    "correct_index": 1,
    "explanation": ""
  },
  "How does an if-else branching structure evaluate multiple conditions?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What distinguishes arguments from parameters in function terminology?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is pure function behavior in computer science?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the primary purpose of a variable in computer programming?": {
    "correct_index": 0,
    "explanation": ""
  },
  "Which data type is specifically designed to represent truth values (true or false)?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What happens during explicit type casting in typed languages?": {
    "correct_index": 2,
    "explanation": ""
  },
  "In programming, what does the scope of a variable determine?": {
    "correct_index": 2,
    "explanation": ""
  },
  "Which of the following is an immutable primitive in most modern programming languages?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What does operator precedence govern in arithmetic expressions?": {
    "correct_index": 0,
    "explanation": ""
  },
  "What is the result of an arithmetic division by zero in standard integer arithmetic?": {
    "correct_index": 1,
    "explanation": ""
  },
  "What is the defining characteristic of strongly typed languages?": {
    "correct_index": 1,
    "explanation": ""
  },
  "Which component evaluates conditions to produce boolean outcomes in programs?": {
    "correct_index": 0,
    "explanation": ""
  }
};
