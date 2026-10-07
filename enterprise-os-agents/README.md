# AI-Native Enterprise Operating System

This project is an AI-Native Enterprise OS designed for the Notion Hackathon track. It simulates a company where departments are autonomous AI agents that collaborate, make decisions, log their actions to Notion, and escalate critical decisions to human stakeholders.

## Core Requirements Achieved

1. **Agents Coordinate Work Autonomously**: 
   - The **Marketing Agent** generates campaign ideas and budget requirements dynamically using an LLM.
   - The **Finance Agent** automatically intercepts the request, checks it against company policy limits ($30,000 auto-approval threshold), and pushes back or escalates if it's over the limit.
2. **Humans Stay in the Loop for Real Decisions**: 
   - If Finance flags a budget as too high, the Orchestrator pauses the workflow. It creates an Approval Request in Notion and waits for the Human "Board of Directors" to approve or reject the proposal.
3. **Every Action is Traceable**: 
   - The system uses a centralized `NotionClient`. Both the Marketing and Finance agents log their exact actions and reasoning to a Notion Audit Log database. Humans can read the full story of what happened at any time.
4. **Proper Access Control**:
   - As recommended by the hackathon brief, the Notion Client is initialized with separate tokens for different agents (`NOTION_TOKEN_MARKETING`, `NOTION_TOKEN_FINANCE`). This ensures agents only have access to the databases they are supposed to.

## Project Structure

- `orchestrator.py`: The central hub that routes messages between agents and humans.
- `agents/marketing.py`: The Marketing AI Agent (powered by OpenAI).
- `agents/finance.py`: The Finance AI Agent (enforces policies).
- `notion_client.py`: The API wrapper that handles logging state to Notion and requesting human approvals.

## How to Run

1. Create a virtual environment and install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set up your `.env` file based on `.env.example`. You will need:
   - An OpenAI API Key (optional, defaults to mock values if missing)
   - Notion Integration Tokens
   - Notion Database IDs (for Audit Logs and Approvals)
3. Run the orchestration script to watch the agents interact:
   ```bash
   python orchestrator.py
   ```

## Demonstration

Running `orchestrator.py` fires off two scenarios:
1. **Standard Campaign**: Marketing requests a small budget. Finance automatically approves it, logging the reasoning to Notion. No human intervention is needed.
2. **Aggressive Expansion**: Marketing requests a massive budget. Finance blocks the auto-approval, logs the escalation to Notion, and halts the system while prompting the human user to approve or deny the request.
