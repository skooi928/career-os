import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'ai-service'))
from app.evaluation_service import evaluate_interview_answer
from dotenv import load_dotenv
load_dotenv('ai-service/.env')

res = evaluate_interview_answer("What is React?", "Skipped", "Frontend Engineer")
print(res)
