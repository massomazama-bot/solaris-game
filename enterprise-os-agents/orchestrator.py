from agents.marketing import MarketingAgent
from agents.finance import FinanceAgent
from notion_client import NotionClient

class Orchestrator:
    def __init__(self):
        self.marketing = MarketingAgent()
        self.finance = FinanceAgent()
        # Orchestrator uses a generic token or human's token to monitor approvals
        self.notion = NotionClient("NOTION_TOKEN_FINANCE") 

    def run_workflow(self, objective: str):
        print(f"--- Starting AI Enterprise Workflow ---")
        print(f"Objective: {objective}\n")

        # Step 1: Marketing Agent formulates campaign
        print("[Marketing Agent] Working on proposal...")
        proposal = self.marketing.formulate_campaign_proposal(objective)
        print(f"-> Proposed: '{proposal['campaign_name']}' with budget ${proposal['budget']}")
        
        # Step 2: Finance Agent reviews
        print("\n[Finance Agent] Reviewing budget request against policy...")
        finance_review = self.finance.review_budget_request(proposal)
        print(f"-> Decision: {finance_review['decision']} ({finance_review['reasoning']})")

        # Step 3: Human in the loop (if escalated)
        if finance_review["requires_human"]:
            print("\n[Orchestrator] Escalation required. Requesting Human Approval via Notion...")
            
            approval_id = self.notion.request_human_approval(
                request_title=f"Budget Approval: {proposal['campaign_name']}",
                description=f"Marketing requested ${proposal['budget']}. Finance escalated because it exceeds auto-approval limits.",
                requested_by="Finance Agent"
            )

            # Wait for human to decide
            final_status = self.notion.check_approval_status(approval_id)
            
            print(f"\n[Human Board of Directors] Decision received: {final_status}")
            
            self.notion.log_action(
                agent_name="Orchestrator",
                action=f"Human {final_status} the escalated budget for '{proposal['campaign_name']}'",
                details=f"Final recorded status from Notion."
            )
            
            if final_status == "Approved":
                print("\n✅ Workflow Complete: Budget secured. Marketing can proceed.")
            else:
                print("\n❌ Workflow Complete: Budget denied. Marketing must revise.")
        else:
            print("\n✅ Workflow Complete: Budget automatically secured. Marketing can proceed.")

if __name__ == "__main__":
    orchestrator = Orchestrator()
    
    print("Scenario 1: Standard Campaign (Within Budget)")
    orchestrator.run_workflow("Increase Q3 social media engagement by 15%")
    
    print("\n" + "="*50 + "\n")
    
    print("Scenario 2: Aggressive Expansion (Requires Human Approval)")
    orchestrator.run_workflow("Aggressive market takeover requiring massive ad spend")
