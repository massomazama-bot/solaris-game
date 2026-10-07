import os
import requests
from dotenv import load_dotenv

load_dotenv()

class NotionClient:
    def __init__(self, token_env_var: str):
        self.token = os.getenv(token_env_var)
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

    def log_action(self, agent_name: str, action: str, details: str):
        """
        Logs an agent's action and reasoning to the master Audit Log Database in Notion.
        This provides the traceability required by the brief.
        """
        db_id = os.getenv("NOTION_AUDIT_LOG_DB_ID")
        if not db_id or not self.token:
            print(f"[Notion Mock Log] {agent_name}: {action} - {details}")
            return
            
        url = "https://api.notion.com/v1/pages"
        payload = {
            "parent": {"database_id": db_id},
            "properties": {
                "Agent": {"title": [{"text": {"content": agent_name}}]},
                "Action": {"rich_text": [{"text": {"content": action}}]},
                "Reasoning/Details": {"rich_text": [{"text": {"content": details}}]},
                "Status": {"select": {"name": "Completed"}}
            }
        }
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
        except Exception as e:
            print(f"Error logging to Notion: {e}")

    def request_human_approval(self, request_title: str, description: str, requested_by: str) -> str:
        """
        Creates an entry in the Approvals Database for a human to review.
        Returns the Notion page ID of the approval request.
        """
        db_id = os.getenv("NOTION_APPROVALS_DB_ID")
        if not db_id or not self.token:
            print(f"\n*** [HUMAN APPROVAL NEEDED] ***")
            print(f"Request: {request_title}")
            print(f"Details: {description}")
            print(f"Requested By: {requested_by}")
            print("*******************************\n")
            return "mock_page_id"
            
        url = "https://api.notion.com/v1/pages"
        payload = {
            "parent": {"database_id": db_id},
            "properties": {
                "Request": {"title": [{"text": {"content": request_title}}]},
                "Description": {"rich_text": [{"text": {"content": description}}]},
                "Requested By": {"select": {"name": requested_by}},
                "Status": {"select": {"name": "Pending Approval"}}
            }
        }
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json().get("id")
        except Exception as e:
            print(f"Error creating approval in Notion: {e}")
            return None

    def check_approval_status(self, page_id: str) -> str:
        """
        Checks the status of an approval request in Notion.
        In a real app, you could use Notion Webhooks, but polling is used here for simplicity.
        """
        if page_id == "mock_page_id":
            # For the CLI mock, we'll ask the human directly in the terminal
            choice = input(f"Human, do you approve this request? (yes/no): ")
            return "Approved" if choice.lower().startswith('y') else "Rejected"
            
        url = f"https://api.notion.com/v1/pages/{page_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            status = response.json()["properties"]["Status"]["select"]["name"]
            return status
        except Exception as e:
            print(f"Error checking approval status: {e}")
            return "Pending Approval"
