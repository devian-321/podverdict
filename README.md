# PodVerdict
**Secure, Distributed Online Judge System**

PodVerdict is a full-stack asynchronous coding judge. It handles high-volume code submissions by decoupling the request handling (API) from the code execution (Worker) using a Redis-backed queue.





## System Highlights

- **Architecture**: Distributed system using the Producer-Consumer pattern
- **Security**: Rootless Podman containers with strict resource quotas (CPU, RAM, PIDs)
- **Isolation**: Each submission runs in a temporary, network-isolated environment (`--net none`)
- **Performance**: Built with Bun for minimal overhead and high-speed execution

## Technical Workflow

1. **API Server**: Validates JWT, stores submission as PENDING, and pushes a job to BullMQ
2. **Redis**: Acts as the message broker, ensuring no submission is lost
3. **Worker**: Picks up jobs, generates a unique workspace, and spawns a Podman container
4. **Judge Logic**: Executes code against hidden test cases and updates the DB with the final verdict (ACCEPTED, WRONG_ANSWER, TLE, RE)

## Software architecture

```mermaid
graph TD
    subgraph Client_Layer [Client Layer]
        User((Contestant))
        Admin((Admin))
    end

    subgraph API_Services [API Layer - RESTful]
        AU[Authentication service]
        PS[Problem Service]
        CS[Code Service]
        ContestSvc[Contest Service]
    end

    subgraph Data_Storage [Data & Persistence]
        PDB[(Problem DB: Metadata & Cases)]
        SDB[(Submission DB: User Code & Results)]
        Cache[(Redis: Leaderboard & Status)]
    end

    subgraph Async_Execution [Execution Engine]
        MQ{Message Queue: FIFO}
        Worker[Code Execution Worker]
        Docker[Podman Engine]
        subgraph Containers [Isolated Sandbox]
            PyEnv[Python Env]
            JavaEnv[Java Env]
            CPPEnv[C++ Env] 
        end
    end

    %% Flow Relationships
    User -->|View Problems| PS
    User -->|Submit Solution| CS
    User -->|View Ranks| ContestSvc
    
    Admin -->|Upload Tests| PS
    PS -->|Store Metadata| PDB

    CS -->|1. Save Draft| SDB
    CS -->|2. Enqueue Job| MQ
    
    MQ -->|3. Fetch Task| Worker
    Worker -->|4. Fetch Test Cases| PDB
    Worker -->|5. Run in Sandbox| Docker
    Docker --> Containers
    
    Worker -->|6. Save Results| SDB
    Worker -->|7. Update Scores| Cache
    ContestSvc -->|Read| Cache
```

## Setup & Installation

### Clone & Install
```bash
git clone https://github.com/devian-321/podverdict.git
cd podverdict
bun install
```

### Environment Variables
Create a `.env` file with the following:
```
PORT=
JWT_SECRET=
DATABASE_URL=
REDIS_URL=
```

### Spin up Infrastructure
```bash
# Using podman-compose
podman-compose up -d
```

### Initialize Database
```bash
bunx prisma migrate dev
```

## 🛡️ Security Features Tested

- **Time Limit Exceeded (TLE)**: Hard 5s timeout using exec signals
- **Memory Limit Exceeded (MLE)**: Restricted to 128MB via Podman flags
- **Fork Bomb Protection**: Restricted to 64 PIDs per container
- **Network Isolation**: Zero internet access for user-submitted code

## 📦 Tech Stack

- **Backend**: Node.js with Express & TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis with BullMQ
- **Runtime**: Bun
- **Containerization**: Podman
- **Authentication**: JWT

## 👨‍💻 Author

Anshuman Tiwari (devian-321)