import { Worker, Job } from "bullmq";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma"; 

const execPromise = promisify(exec);
console.log(process.env.REDIS_HOST)
const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1", 
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

const RUNTIME_CONFIG: Record<string, { image: string; fileExt: string; runCmd: string }> = {
  PYTHON: {
    image: "docker.io/library/python:3.10-slim",
    fileExt: "py",
    runCmd: "python3 /app/solution.py",
  },
  JAVASCRIPT: {
    image: "docker.io/library/node:18-slim",
    fileExt: "js",
    runCmd: "node /app/solution.js",
  },
  CPP: {
    image: "docker.io/library/gcc:latest",
    fileExt: "cpp",
    runCmd: "g++ /app/solution.cpp -o /app/out && /app/out",
  },
};

const worker = new Worker(
  "submission-queue",
  async (job: Job) => {
    console.log(`\n-----------------------------------------`);
    console.log(`🚀 Processing Job [${job.id}]`);

    const { submissionId, problemId, code } = job.data;
    const language = (job.data.language || "PYTHON").toUpperCase();
    const config = RUNTIME_CONFIG[language];

    if (!config) {
      console.error(`❌ Unsupported language: ${language}`);
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: "COMPILATION_ERROR" as any },
      });
      return;
    }
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem || problem.testCases.length === 0) {
      console.error("❌ Problem or Test Cases not found in DB");
      return;
    }
    const workDir = path.join(process.cwd(), "temp", submissionId);
    if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

    const fileName = `solution.${config.fileExt}`;
    const filePath = path.join(workDir, fileName);
    fs.writeFileSync(filePath, code);
    let finalStatus = "ACCEPTED";

    try {
      for (const testCase of problem.testCases) {
        console.log(`   📝 Testing Case: ${testCase.id}`);
        const podmanCmd = `echo "${testCase.input.replace(/"/g, '\\"')}" | podman run -i --rm \
                --net none \
                --memory 128m \
                --pids-limit 64 \
                --cpus="0.5" \
                --pids-limit=20 \
                -v "${workDir}:/app:ro" \
                ${config.image} \
                sh -c "${config.runCmd}"`;

        try {
          const { stdout, stderr } = await execPromise(podmanCmd, {
            timeout: 5000,
            killSignal: "SIGKILL",
          });

          const output = stdout.trim();

          if (output !== testCase.expected.trim()) {
            console.log(`   ❌ WRONG_ANSWER (Got: "${output}", Expected: "${testCase.expected.trim()}")`);
            finalStatus = "WRONG_ANSWER";
            break;
          }
        } catch (err: any) {
          if (err.killed || err.signal === "SIGKILL") {
            console.log(`   ❌ TIME_LIMIT_EXCEEDED`);
            finalStatus = "TIME_LIMIT_EXCEEDED";
          } else {
            console.log(`   ❌ RUNTIME_ERROR: ${err.stderr || err.message}`);
            finalStatus = "RUNTIME_ERROR";
          }
          break;
        }
      }
    } catch (error) {
      console.error("Critical Judge Error:", error);
      finalStatus = "RUNTIME_ERROR";
    } finally {
      try {
        if (fs.existsSync(workDir)) {
          fs.rmSync(workDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        console.error("Cleanup failed:", cleanupErr);
      }

      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: finalStatus as any },
      });

      console.log(`✅ Final Verdict: ${finalStatus}`);
      console.log(`-----------------------------------------`);
    }
  },
  { connection: redisConnection }
);

worker.on("ready", () => console.log("🕵️ Judge Worker is online and listening for jobs..."));
worker.on("error", (err) => console.error("Worker Critical Error:", err));