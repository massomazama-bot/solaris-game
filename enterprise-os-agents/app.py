import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from agents.marketing import MarketingAgent
from agents.finance import FinanceAgent
from notion_client import NotionClient

app = Flask(__name__, static_folder='.')
CORS(app)

marketing = MarketingAgent()
finance = FinanceAgent()
notion = NotionClient("NOTION_TOKEN_FINANCE")

# State variable to hold pending approvals
pending_requests = {}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/run', methods=['POST'])
def run_workflow():
    data = request.json
    objective = data.get('objective', "Increase Q3 social media engagement by 15%")
    
    # 1. Marketing Proposes
    proposal = marketing.formulate_campaign_proposal(objective)
    
    # 2. Finance Reviews
    finance_review = finance.review_budget_request(proposal)
    
    # 3. Check Escalation
    if finance_review["requires_human"]:
        req_id = "req_" + str(len(pending_requests) + 1)
        pending_requests[req_id] = proposal
        
        return jsonify({
            "status": "pending_human",
            "marketing": proposal,
            "finance": finance_review,
            "approval_id": req_id
        })
    else:
        return jsonify({
            "status": "auto_approved",
            "marketing": proposal,
            "finance": finance_review
        })

@app.route('/api/approve', methods=['POST'])
def approve_request():
    data = request.json
    req_id = data.get('approval_id')
    decision = data.get('decision') # 'Approved' or 'Denied'
    
    proposal = pending_requests.get(req_id)
    if not proposal:
        return jsonify({"error": "Request not found"}), 404
        
    # Log the human decision to Notion
    notion.log_action(
        agent_name="Human Board of Directors",
        action=f"Human {decision} the escalated budget for '{proposal['campaign_name']}'",
        details="Action recorded from the Web Dashboard."
    )
    
    del pending_requests[req_id]
    
    return jsonify({
        "status": "completed",
        "final_decision": decision
    })

if __name__ == '__main__':
    print("Starting Enterprise AI Web Dashboard on port 5000...")
    app.run(port=5000, debug=True)
