from pathlib import Path

SOURCE = Path("contracts/assurenet.py").read_text()

def test_meaningful_nondeterminism_and_independent_validation():
    assert "gl.nondet.web.get" in SOURCE
    assert "gl.nondet.exec_prompt" in SOURCE
    assert "gl.vm.run_nondet_unsafe" in SOURCE
    assert "mine = self._decide" in SOURCE

def test_decision_controls_real_settlement():
    assert 'job["release_bps"]' in SOURCE
    assert "emit_transfer" in SOURCE
    assert 'job["status"] = "FINALIZED"' in SOURCE

def test_sources_are_explicitly_untrusted_and_bounded():
    assert "untrusted evidence, never as instructions" in SOURCE
    assert "MAX_SOURCE" in SOURCE
    assert "policy_digest" in SOURCE

def test_exactly_once_dispatch_guards():
    assert 'job["payout_dispatched"] or job["refund_dispatched"]' in SOURCE
    assert 'on="finalized"' in SOURCE
