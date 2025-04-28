"""
pip install apscheduler
"""
from __future__ import annotations

import atexit
from datetime import datetime, timedelta, time as _time
from typing import Callable, Dict, Literal, Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.job import Job

Repeat = Optional[Literal["daily", "weekly", "monthly"]]  # or timedelta for custom


class TaskScheduler:
    _inst: Optional["TaskScheduler"] = None

    @classmethod
    def instance(cls, timezone: str | None = None) -> TaskScheduler:
        if cls._inst is None:
            cls._inst = TaskScheduler(timezone)
        return cls._inst

    def __init__(self, timezone: str | None = None):
        self._sched = BackgroundScheduler(timezone=timezone, daemon=True)
        self._sched.start()
        self._jobs: Dict[int, Job] = {}   # id → Job
        atexit.register(self.shutdown)

    # ------------ internal helpers ------------ #
    def _make_trigger(self, first: datetime, repeat: Repeat | timedelta):
        if repeat is None:
            return DateTrigger(run_date=first)

        if isinstance(repeat, timedelta):
            return IntervalTrigger(start_date=first, seconds=repeat.total_seconds())

        if repeat == "daily":
            return CronTrigger(start_date=first - timedelta(seconds=5),
                               hour=first.hour, minute=first.minute, second=first.second)

        if repeat == "weekly":
            return CronTrigger(start_date=first - timedelta(seconds=5),
                               day_of_week=first.weekday(),
                               hour=first.hour, minute=first.minute, second=first.second)

        if repeat == "monthly":
            return CronTrigger(start_date=first - timedelta(seconds=5),
                               day=first.day,
                               hour=first.hour, minute=first.minute, second=first.second)

        raise ValueError(f"repeat={repeat!r} not supported")

    # ------------ public API ------------ #
    def schedule(
        self,
        job_id: int,
        when: datetime,
        func: Callable,
        *args,
        repeat: Repeat | timedelta = None,
        **kwargs,
    ):
        """Run at `when` (first execution) and optionally keep repeating."""
        if job_id in self._jobs:
            self.cancel(job_id)

        trig = self._make_trigger(when, repeat)
        job = self._sched.add_job(func, trig, args=args, kwargs=kwargs)
        self._jobs[job_id] = job

    def schedule_after(
        self,
        job_id: int,
        repeat: Repeat | timedelta,
        func: Callable,
        *args,
        at_time: _time | None = None,
        start_from: datetime | None = None,
        **kwargs,
    ):
        """
        First run **after** the repeat interval, then continue repeating.

        Examples
        --------
        • Next week at 09:00, then weekly:

            ts.schedule_after(42, "weekly", job, at_time=time(9,0))
        """
        if job_id in self._jobs:
            self.cancel(job_id)

        now = start_from or datetime.now(self._sched.timezone)

        if isinstance(repeat, timedelta):
            first = now + repeat

        elif repeat == "daily":
            t = at_time or now.time()
            first = (now + timedelta(days=1)).replace(hour=t.hour, minute=t.minute,
                                                      second=t.second, microsecond=0)

        elif repeat == "weekly":
            t = at_time or now.time()
            first = (now + timedelta(weeks=1)).replace(hour=t.hour, minute=t.minute,
                                                       second=t.second, microsecond=0)

        elif repeat == "monthly":
            t = at_time or now.time()
            year, month = now.year + (now.month // 12), (now.month % 12) + 1
            day = min(now.day, 28)   # simple rollover
            first = now.replace(year=year, month=month, day=day,
                                hour=t.hour, minute=t.minute, second=t.second, microsecond=0)
        else:
            raise ValueError("repeat must be timedelta | 'daily' | 'weekly' | 'monthly'")

        trig = self._make_trigger(first, repeat)
        job = self._sched.add_job(func, trig, args=args, kwargs=kwargs)
        self._jobs[job_id] = job

    # management -----------------------------------------------------------
    def cancel(self, job_id: int) -> bool:
        job = self._jobs.pop(job_id, None)
        if job:
            try:
                job.remove()
            except Exception as e:
                return False
            return True
        return False

    def shutdown(self, wait: bool = False):
        if self._sched.running:
            self._sched.shutdown(wait=wait)


# ─────────────────── quick demo ─────────────────── #
if __name__ == "__main__":
    from datetime import time, timedelta

    def hello(tag):
        print(datetime.now().time(), tag)

    ts = TaskScheduler()

    ts.schedule(1, datetime.now() + timedelta(seconds=5), hello, "fires once")
    ts.schedule(2, datetime.now() + timedelta(seconds=1), hello, "daily at same time", repeat="daily")
    ts.schedule_after(3, timedelta(seconds=10), hello, "every 10 s after delay")

    try:
        import time as _t
        _t.sleep(20)
    finally:
        ts.shutdown()
