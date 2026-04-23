# Twitter/X Thread — Claude Code Local

---

**Tweet 1 (Hook)**

I'm running Claude Code with a 122 BILLION parameter AI model entirely on my MacBook.

No internet. No API fees. No data leaves my machine.

30 tokens/second. Production-quality code.

Here's exactly how I did it (and you can too):

---

**Tweet 2 (The Setup)**

The stack:

- Mac M5 Max (128GB)
- Qwen3.5 27B Claude 4.6 Distilled model (81GB)
- Ollama (model server)
- Custom proxy I built (50 lines of Python)
- Claude Code

The proxy translates between Claude Code's API format and the local model. That's the secret sauce.

---

**Tweet 3 (The Problem I Solved)**

Claude Code only speaks Anthropic's API. Local models speak OpenAI's API.

Nobody had bridged this gap properly.

I wrote a lightweight proxy that:
- Translates API formats in real-time
- Strips the model's internal "thinking" so Claude Code gets clean output
- Zero dependencies. One Python file.

---

**Tweet 4 (Benchmarks)**

The numbers:

- 27B model: 30 tokens/sec (reading speed)
- 4B model: 65 tokens/sec for tool calling
- Tool selection accuracy: 100%
- Full Claude Code coding task: ~60-120 seconds

For context — most people need a $10K+ multi-GPU server to run a model this size.

I'm doing it on a laptop.

---

**Tweet 5 (What You Can Do)**

What this actually lets you do:

- Code on a plane with a full AI assistant
- Process sensitive/NDA code without cloud exposure
- Run Claude Code with Cowork, projects, file editing — all local
- Browser automation with the 4B model
- $0/month after hardware

---

**Tweet 6 (The Future)**

It's about to get insane.

Google just dropped TurboQuant — 6x memory compression, 8x speed boost for LLMs.

When this hits Ollama (weeks away), this same setup will run at 50-80 tok/s.

And that 16GB Mac Mini everyone laughed at? It'll run serious AI models locally.

---

**Tweet 7 (How to Set Up)**

Want to try it yourself?

```
brew install ollama
ollama pull qwen3.5:4b
git clone [repo]
bash setup.sh
```

That's it. 4 commands. Works on any Apple Silicon Mac.

Full guide + code: [GitHub link]

---

**Tweet 8 (Closer)**

2026 is the year AI goes fully local.

The hardware is here. The models are here. The tools are catching up.

You don't need a cloud subscription to have an AI coding partner anymore.

Open source link in bio. Go build something.

---

*Suggested images/video per tweet:*
1. Screenshot of Claude Code running with local model indicator
2. Architecture diagram from README
3. Terminal showing the proxy translating requests
4. Benchmark results table
5. Code being generated in Claude Code
6. TurboQuant blog screenshot
7. Terminal showing the 4-command setup
8. Photo of MacBook running the setup
