from fastedgy.cli import cli


@cli.group(name="console")
def console_group():
    """Console management commands"""
