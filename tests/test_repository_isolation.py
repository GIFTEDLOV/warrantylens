import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_repo_contains_one_contract():
    r = json.loads((ROOT / "release.json").read_text(encoding="utf-8"))
    assert r["sourceFile"] == "contracts/warrantylens.py"
    assert sorted(p.name for p in (ROOT / "contracts").glob("*.py")) == ["warrantylens.py"]
    assert len(r["deployedSourceSha256"]) == 64
    assert r["chainId"] == 61999
    assert r["address"].lower() == "0xebe45565311a00a148e4469df38ac6ab73efdb89".lower()
    assert "GIFTEDLOV/warrantylens" in r["githubRepository"]
