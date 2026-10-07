import os
from openai import OpenAI
from notion_client import NotionClient

class FinanceAgent:
    def __init__(self):
        self.llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.notion = NotionClient("NOTION_TOKEN_FINANCE")
        self.name = "Finance Agent"
        self.max_auto_approval_budget = 30000.0 # Company policy limit

    def review_budget_request(self, request_data: dict) -> dict:
        """
        Reviews a budget request against company policy.
        """
        budget = request_data["budget"]
        campaign = request_data["campaign_name"]
        
        decision = ""
        reasoning = ""
        requires_human = False

        # Autonomous Decision Making
        if budget <= self.max_auto_approval_budget:
            decision = "Approved"
            reasoning = f"Budget of ${budget} is within the auto-approval policy limit of ${self.max_auto_approval_budget}."
            
            self.notion.log_action(
                agent_name=self.name,
                action=f"Auto-approved budget for '{campaign}'",
                details=reasoning
            )
        else:
            decision = "Escalated"
            reasoning = f"Budget of ${budget} exceeds the auto-approval policy limit of ${self.max_auto_approval_budget}. Escalating to human board of directors."
            requires_human = True
            
            self.notion.log_action(
                agent_name=self.name,
                action=f"Escalated budget request for '{campaign}' to Human",
                details=reasoning
            )

        return {
            "decision": decision,
            "reasoning": reasoning,
            "requires_human": requires_human
        }
