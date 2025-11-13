from fastedgy.cli import cli


@cli.group(name="admin")
def admin():
    """Admin management commands"""
    pass
