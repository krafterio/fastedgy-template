import json
import os
import shutil
import subprocess
from pathlib import Path

import anyio
import pytest

ROOT = Path(__file__).parents[2]


@pytest.fixture
def failing_project(tmp_path: Path) -> Path:
    shutil.copytree(ROOT / ".claude" / "hooks", tmp_path / ".claude" / "hooks")

    for tool in ("bin/uv", "node_modules/.bin/oxlint"):
        path = tmp_path / tool
        path.parent.mkdir(parents=True)
        path.write_text("#!/bin/sh\necho 'app: 1 error'\nexit 1\n")
        path.chmod(0o755)

    for name in ("pyproject.toml", "package.json", "app.py", "app.js"):
        (tmp_path / name).touch()

    subprocess.run(["git", "init", "--quiet"], cwd=tmp_path, check=True)

    return tmp_path


@pytest.mark.parametrize("gate", ["py-gate.sh", "js-gate.sh"])
@pytest.mark.parametrize(("stop_hook_active", "exit_code"), [(False, 2), (True, 1)])
async def test_a_failing_gate_blocks_the_first_stop_and_still_reports_the_next(
    failing_project: Path, gate: str, stop_hook_active: bool, exit_code: int
) -> None:
    result = await anyio.run_process(
        ["bash", failing_project / ".claude" / "hooks" / gate],
        input=json.dumps({"hook_event_name": "Stop", "stop_hook_active": stop_hook_active}).encode(),
        check=False,
        env={
            **os.environ,
            "CLAUDE_PROJECT_DIR": str(failing_project),
            "PATH": f"{failing_project / 'bin'}{os.pathsep}{os.environ['PATH']}",
        },
    )

    assert result.returncode == exit_code
    assert b"app: 1 error" in result.stderr
