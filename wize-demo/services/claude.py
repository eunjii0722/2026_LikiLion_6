import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM = """당신은 한국어 업무 설명을 자동화 워크플로우 JSON으로 변환합니다.
트리거는 google_form, 액션은 google_sheets와 gmail만 사용합니다.
필드명은 반드시 {{name}}, {{email}}, {{phone}}, {{submitted_at}} 중에서 씁니다.
의도가 불명확하면 actions 배열을 비워서 반환합니다.

config 구조:
- google_sheets: {"row_template": ["{{name}}", "{{email}}", "{{phone}}", "{{submitted_at}}"], "sheet_id": "", "sheet_name": "Sheet1"}
- gmail: {"to": "{{email}}", "subject": "신청이 완료되었습니다", "body": "안녕하세요 {{name}}님,\\n신청이 완료되었습니다."}

sheet_id는 빈 문자열로 두면 됩니다. row_template은 반드시 배열로 반환하세요."""

TOOLS = [
    {
        "name": "create_workflow",
        "description": "워크플로우 구조 생성",
        "input_schema": {
            "type": "object",
            "properties": {
                "trigger": {
                    "type": "object",
                    "properties": {
                        "service": {"type": "string", "enum": ["google_form"]},
                        "form_id": {"type": "string", "default": ""}
                    },
                    "required": ["service"]
                },
                "actions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "order": {"type": "integer"},
                            "service": {"type": "string", "enum": ["google_sheets", "gmail"]},
                            "config": {
                                "type": "object",
                                "properties": {
                                    "row_template": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "google_sheets: 행 셀 값 목록, {{name}} {{email}} {{phone}} {{submitted_at}} 사용"
                                    },
                                    "sheet_id": {
                                        "type": "string",
                                        "description": "google_sheets: 스프레드시트 ID (빈 문자열 허용)"
                                    },
                                    "sheet_name": {
                                        "type": "string",
                                        "description": "google_sheets: 시트 탭 이름, 기본값 Sheet1"
                                    },
                                    "to": {
                                        "type": "string",
                                        "description": "gmail: 수신자 이메일, {{email}} 사용"
                                    },
                                    "subject": {
                                        "type": "string",
                                        "description": "gmail: 이메일 제목"
                                    },
                                    "body": {
                                        "type": "string",
                                        "description": "gmail: 이메일 본문, {{name}} {{email}} 등 사용"
                                    }
                                }
                            }
                        },
                        "required": ["order", "service", "config"]
                    }
                }
            },
            "required": ["trigger", "actions"]
        }
    }
]

def parse_natural_language(text: str) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM,
        tools=TOOLS,
        tool_choice={"type": "tool", "name": "create_workflow"},
        messages=[{"role": "user", "content": text}]
    )
    for block in response.content:
        if block.type == "tool_use":
            return block.input
    return {"trigger": {"service": "google_form", "form_id": ""}, "actions": []}
