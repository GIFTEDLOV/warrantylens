import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_submission_evidence_and_sources_are_complete():
    r = json.loads((ROOT / "release.json").read_text(encoding="utf-8"))
    fields = json.loads((ROOT / "docs" / "SUBMISSION_FIELDS.json").read_text(encoding="utf-8"))
    e = json.loads((ROOT / "evidence" / "live-lifecycle.json").read_text(encoding="utf-8"))

    required = (
        "projectName",
        "shortDescription",
        "detailedDescription",
        "problemSolved",
        "whyGenLayer",
        "semanticConsensus",
        "githubRepository",
        "chainId",
        "contractAddress",
        "explorerUrl",
        "sourceSha256",
        "qualificationCase",
        "terminalVerdict",
        "knownLimitationsAndExternalTrustAssumptions"
    )
    for k in required:
        assert fields.get(k), f"Missing required submission field: {k}"

    assert all(
        isinstance(fields.get(k), str) and fields[k].startswith("https://")
        for k in ("githubRepository", "explorerUrl")
    )
    assert e["id"] == r["liveCase"] and e["status"] == "PASS"
    assert hashlib.sha256((ROOT / r["sourceFile"]).read_bytes()).hexdigest() == r["deployedSourceSha256"]
    assert re.fullmatch(r"0x[0-9a-fA-F]{40}", r["address"])
    assert not any(
        x in (ROOT / "docs" / "SUBMISSION.md").read_text(encoding="utf-8").lower()
        for x in ("todo", "tbd", "placeholder", "not yet published")
    )
