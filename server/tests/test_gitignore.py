from pathlib import Path

import anyio
import pytest

ROOT = Path(__file__).parents[2]


@pytest.mark.parametrize(("path", "ignored"), [("server/venv/", True), ("app/assets/env/", False)])
async def test_a_virtualenv_is_ignored_wherever_it_sits_a_folder_named_env_is_not(path: str, ignored: bool) -> None:
    check = await anyio.run_process(
        ["git", "-c", "core.ignorecase=true", "check-ignore", "--quiet", "--no-index", path], check=False, cwd=ROOT
    )

    assert check.returncode == (0 if ignored else 1)
