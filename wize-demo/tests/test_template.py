from routes.webhook import fill_template

def test_fill_single_variable():
    result = fill_template("{{name}}님 안녕하세요", {"name": "김철수"})
    assert result == "김철수님 안녕하세요"

def test_fill_multiple_variables():
    result = fill_template("{{name}}, {{email}}", {"name": "김철수", "email": "kim@test.com"})
    assert result == "김철수, kim@test.com"

def test_fill_missing_variable_stays():
    result = fill_template("{{name}} {{phone}}", {"name": "김철수"})
    assert result == "김철수 {{phone}}"

def test_fill_none_value_becomes_empty():
    result = fill_template("{{name}}", {"name": None})
    assert result == ""
