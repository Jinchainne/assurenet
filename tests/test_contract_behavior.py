from dataclasses import dataclass

CHALLENGE_SECONDS = 24 * 60 * 60

@dataclass
class Job:
    client: str
    worker: str
    status: str = "OPEN"
    reviewed_at: int = 0
    payout_dispatched: bool = False
    refund_dispatched: bool = False

def can_submit(job: Job, sender: str) -> bool:
    return sender.lower() == job.worker.lower() and job.status == "OPEN"

def can_challenge(job: Job, sender: str, now: int) -> bool:
    return (job.status == "REVIEWED" and sender.lower() in {job.client.lower(), job.worker.lower()}
            and now <= job.reviewed_at + CHALLENGE_SECONDS)

def settle(amount: int, release_bps: int) -> tuple[int, int]:
    worker = amount * release_bps // 10000
    return worker, amount - worker

def can_finalize(job: Job, now: int) -> bool:
    return (job.status in {"REVIEWED", "CHALLENGED"}
            and now >= job.reviewed_at + CHALLENGE_SECONDS
            and not job.payout_dispatched and not job.refund_dispatched)

def test_only_worker_can_submit_open_job():
    job = Job(client="0xclient", worker="0xworker")
    assert can_submit(job, "0xworker")
    assert not can_submit(job, "0xclient")
    assert not can_submit(Job(client="0xc", worker="0xw", status="REVIEWED"), "0xw")

def test_challenge_is_party_only_and_time_bounded():
    job = Job(client="0xclient", worker="0xworker", status="REVIEWED", reviewed_at=100)
    assert can_challenge(job, "0xclient", 100 + CHALLENGE_SECONDS)
    assert not can_challenge(job, "0xoutsider", 100 + 1)
    assert not can_challenge(job, "0xworker", 100 + CHALLENGE_SECONDS + 1)

def test_partial_release_arithmetic_conserves_escrow():
    worker, refund = settle(1_000_001, 3750)
    assert worker == 375_000
    assert refund == 625_001
    assert worker + refund == 1_000_001

def test_finalization_is_delayed_and_exactly_once():
    job = Job(client="0xc", worker="0xw", status="CHALLENGED", reviewed_at=500)
    assert not can_finalize(job, 500 + CHALLENGE_SECONDS - 1)
    assert can_finalize(job, 500 + CHALLENGE_SECONDS)
    job.payout_dispatched = True
    assert not can_finalize(job, 500 + CHALLENGE_SECONDS + 1)
