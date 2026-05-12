from routes.webhook import normalize_row

def test_korean_name_column():
    result = normalize_row({"이름": "김철수"})
    assert result["name"] == "김철수"

def test_korean_email_column():
    result = normalize_row({"이메일": "kim@test.com"})
    assert result["email"] == "kim@test.com"

def test_submitted_at_added():
    result = normalize_row({})
    assert "submitted_at" in result

def test_unknown_column_lowercased():
    result = normalize_row({"수강 레벨": "초급"})
    assert "수강_레벨" in result
