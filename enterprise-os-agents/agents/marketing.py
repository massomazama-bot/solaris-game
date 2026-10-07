import os
from openai import OpenAI
from notion_client import NotionClient

class MarketingAgent:
    def __init__(self):
        self.llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.notion = NotionClient("NOTION_TOKEN_MARKETING")
        self.name = "Marketing Agent"

    def formulate_campaign_proposal(self, objective: str) -> dict:
        """
        Formulates a marketing campaign and requests a budget.
        """
        prompt = f"""
        You are the Marketing Agent for a tech company. 
        Formulate a short, creative campaign proposal for the following objective: '{objective}'.
        Determine a realistic budget required for this campaign (in USD).
        Respond exactly in this format:
        Campaign Name: [name]
        Budget: $[amount]
        Reasoning: [1-2 sentences]
        """
        
        # If no API key, mock the response for the hackathon scaffold
        if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key":
            budget = 55000 if "aggressive" in objective.lower() else 25000
            response_text = f"Campaign Name: Project Phoenix\nBudget: ${budget}\nReasoning: We need high visibility ads to achieve this objective rapidly."
        else:
            response = self.llm.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}]
            )
            response_text = response.choices[0].message.content

        # Parse response
        lines = response_text.strip().split('\n')
        campaign_name = lines[0].replace("Campaign Name: ", "").strip()
        budget_str = lines[1].replace("Budget: $", "").replace(",", "").strip()
        budget = float(budget_str) if budget_str.replace('.', '', 1).isdigit() else 25000.0
        reasoning = lines[2].replace("Reasoning: ", "").strip()

        # Log to Notion (Traceability)
        self.notion.log_action(
            agent_name=self.name,
            action=f"Proposed campaign '{campaign_name}' requesting ${budget}",
            details=reasoning
        )

        return {
            "campaign_name": campaign_name,
            "budget": budget,
            "reasoning": reasoning,
            "requested_by": self.name
        }
