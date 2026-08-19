import click
from fastedgy import cli
from fastedgy.cli import console
from fastedgy.depends.security import hash_password
from models.user import User, UserRole

from cli.console import console_group


@console_group.command(name="user-create")
@cli.option("--email", type=str, default=None, help="User email")
@cli.option("--name", type=str, default=None, help="User full name")
@cli.option("--role", type=str, default=None, help="User role")
@cli.lifespan
@cli.initialize_app
async def user_create(email: str | None = None, name: str | None = None, role: str | None = None) -> None:
    """Create a user"""
    try:
        if not email:
            email = click.prompt("Email", type=str)

        if not name:
            name = click.prompt("Name", type=str)

        if not role:
            role = click.prompt(
                "Role",
                type=click.Choice([choice.value for choice in UserRole], case_sensitive=False),
                default=UserRole.admin.value,
            )
        user_role = UserRole(role)

        password = click.prompt(
            "Password",
            hide_input=True,
            confirmation_prompt=True,
            type=str,
        )

        user = User(
            name=name,
            email=email,
            role=user_role,
            password=hash_password(password),
        )
        await user.save()

        console.print(f"[green]Successfully created user {email}[/green]")
    except Exception as e:  # noqa: BLE001
        console.print(f"[red]Error: {e!s}[/red]")
