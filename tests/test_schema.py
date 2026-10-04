"""AI 回傳契約驗證測試（審核 P0-1 / 第七節）。
執行：pip install -r requirements.txt pytest && pytest -q
不呼叫真實 API，只測 validate_* 純函式。"""
import main


def ok(mode, data):
    return main.validate_magic_output(mode, data) is None


def test_bare_ok_true_is_rejected():
    assert not ok("idiom", {"ok": True})


def test_idiom_requires_upgraded_and_items():
    good = {"ok": True, "upgraded": "句", "items": [{"word": "w", "meaning": "m"}], "cheer": "c"}
    assert ok("idiom", good)
    assert not ok("idiom", {**good, "upgraded": ""})
    assert not ok("idiom", {**good, "items": []})


def test_grow_requires_questions_list():
    assert ok("grow", {"ok": True, "questions": ["a", "b"], "cheer": "c"})
    assert not ok("grow", {"ok": True, "questions": [], "cheer": "c"})
    assert not ok("grow", {"ok": True, "questions": "x", "cheer": "c"})


def test_outline_requires_three_sections():
    three = [{"word": "開頭", "meaning": "m"}, {"word": "經過", "meaning": "m"}, {"word": "結尾", "meaning": "m"}]
    assert ok("outline", {"ok": True, "items": three, "cheer": "c"})
    assert not ok("outline", {"ok": True, "items": three[:2], "cheer": "c"})


def test_items_modes_validate_fields():
    for mode in ("gym", "senses", "ideas", "argue"):
        assert ok(mode, {"ok": True, "items": [{"word": "w", "meaning": "m"}], "cheer": "c"})
        assert not ok(mode, {"ok": True, "items": [{"word": "w"}], "cheer": "c"})
        assert not ok(mode, {"ok": True, "items": [], "cheer": "c"})


def test_ok_false_needs_redirect():
    assert ok("ideas", {"ok": False, "redirect": "r"})
    assert not ok("ideas", {"ok": False})


def test_non_dict_and_unknown_mode():
    assert not ok("ideas", "oops")
    assert not ok("zzz", {"ok": True, "items": [{"word": "w", "meaning": "m"}], "cheer": "c"})


def test_lookup_schema():
    good = {"char": "揮", "zhuyin": "ㄏㄨㄟ", "pinyin": "huī", "radical": "手", "strokes": 12, "meaning": "m", "words": ["發揮"]}
    assert main.validate_lookup_output(good) is None
    assert main.validate_lookup_output({**good, "char": "發揮"}) is not None
    assert main.validate_lookup_output({**good, "strokes": "12"}) is not None
    assert main.validate_lookup_output({"error": "請輸入一個中文字喔！"}) is None


def test_rate_limit_stale_cleanup():
    main._hits.clear()
    now = main.time.time()
    for i in range(5001):
        main._hits[f"old{i}"] = [now - main.RATE_LIMIT_WINDOW - 10]
    assert not main._rate_limited("fresh")
    assert all(not k.startswith("old") for k in main._hits)
