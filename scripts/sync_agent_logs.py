#!/usr/bin/env python3
"""
Sync Agent Logs script for 8x Assignment.
Parses Antigravity IDE conversation transcripts and generates formatted .agent-logs/ files.
"""

import json
import os
import sys
import glob
from datetime import datetime

SESSION_ID = "e0a45660-9323-438c-bb8e-7f4f31ee30fa"
AUTHOR = "ahmad"
MODEL_NAME = "gemini-3.6-flash"
TOOL_NAME = "antigravity-ide"
PROJECT_NAME = "amazone-clone"

TRANSCRIPT_PATH = f"/Users/ahmad/.gemini/antigravity-ide/brain/{SESSION_ID}/.system_generated/logs/transcript_full.jsonl"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_DIR = os.path.join(REPO_ROOT, ".agent-logs")

def parse_transcript(transcript_file):
    if not os.path.exists(transcript_file):
        print(f"Error: Transcript file not found at {transcript_file}")
        return []

    with open(transcript_file, 'r', encoding='utf-8') as f:
        steps = [json.loads(line) for line in f if line.strip()]

    turns = []
    current_prompt = None
    last_response = None

    for step in steps:
        stype = step.get('type')
        if stype == 'USER_INPUT':
            if current_prompt and last_response:
                turns.append((current_prompt, last_response))
            
            raw_content = step.get('content', '')
            # Extract content within <USER_REQUEST> if present
            if '<USER_REQUEST>' in raw_content:
                start = raw_content.find('<USER_REQUEST>') + len('<USER_REQUEST>')
                end = raw_content.find('</USER_REQUEST>')
                if end != -1:
                    prompt_text = raw_content[start:end].strip()
                else:
                    prompt_text = raw_content[start:].strip()
            else:
                prompt_text = raw_content.strip()

            ts = step.get('timestamp') or step.get('created_at') or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            current_prompt = {'text': prompt_text, 'timestamp': ts}
            last_response = None

        elif stype == 'PLANNER_RESPONSE':
            content = step.get('content', '')
            if content and content.strip():
                ts = step.get('timestamp') or step.get('created_at') or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
                last_response = {'text': content.strip(), 'timestamp': ts}

    if current_prompt and last_response:
        turns.append((current_prompt, last_response))

    return turns

def generate_markdown_log(session_id, turns):
    if not turns:
        print("No turns found to log.")
        return

    os.makedirs(LOG_DIR, exist_ok=True)
    
    first_time = turns[0][0]['timestamp']
    last_time = turns[-1][0]['timestamp']
    date_str = first_time.split('T')[0] if 'T' in first_time else datetime.utcnow().strftime("%Y-%m-%d")
    short_session = session_id[:8]

    # Standard filename YYYY-MM-DD_HH-MM-SS_<session-id>.md
    filename = f"{date_str}_14-49-53_{session_id}.md"
    log_file_path = os.path.join(LOG_DIR, filename)

    lines = []
    lines.append("---")
    lines.append(f"session_id: {session_id}")
    lines.append(f"date: {date_str}")
    lines.append(f"author: {AUTHOR}")
    lines.append(f"model: {MODEL_NAME}")
    lines.append(f"tool: {TOOL_NAME}")
    lines.append(f"project: {PROJECT_NAME}")
    lines.append(f"total_exchanges: {len(turns)}")
    lines.append(f"first_prompt_time: {first_time}")
    lines.append(f"last_prompt_time: {last_time}")
    lines.append("---\n")

    lines.append(f"# Session Log - {date_str}\n")
    lines.append(f"Session: `{short_session}` | Project: `{PROJECT_NAME}` | Author: `{AUTHOR}`\n")
    lines.append("---\n")

    for i, (prompt, response) in enumerate(turns, 1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={i} session={short_session}]")
        lines.append(f"timestamp: {prompt['timestamp']}")
        lines.append(f"model: {MODEL_NAME}\n")
        lines.append(prompt['text'])
        lines.append("\n")

        lines.append(f"[LOG_ENTRY type=RESPONSE num={i} session={short_session}]")
        lines.append(f"timestamp: {response['timestamp']}")
        lines.append(f"model: {MODEL_NAME}\n")
        lines.append(response['text'])
        lines.append("\n")

    content = "\n".join(lines)
    with open(log_file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully updated agent log at: {log_file_path}")
    return log_file_path

if __name__ == "__main__":
    turns = parse_transcript(TRANSCRIPT_PATH)
    generate_markdown_log(SESSION_ID, turns)
