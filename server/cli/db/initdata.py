from fastedgy import cli
from fastedgy.cli import console
from fastedgy.cli.db import db

from models.country import Country
from models.state import State


@db.command()
@cli.initialize_app
@cli.pass_cli_context
async def init_data(ctx: cli.CliContext):
    """Initialize data of database"""
    async with ctx.lifespan():
        await init_countries()
        await init_states()
        console.print("[green]Database initialized successfully[/green]")


async def init_countries():
    """Initialize countries (currently only France)"""
    france = await Country.query.filter(code="FR").first()

    if not france:
        france = await Country.query.create(code="FR", name="France")
        console.print("[green]Country France created[/green]")
    else:
        console.print("[yellow]Country France already exists[/yellow]")

    return france


async def init_states():
    """Initialize French departments (états/départements)"""
    france = await Country.query.filter(code="FR").first()

    if not france:
        console.print("[red]France country not found. Run init_countries first.[/red]")
        return

    # French departments with their codes and names
    french_departments = [
        ("01", "Ain"),
        ("02", "Aisne"),
        ("03", "Allier"),
        ("04", "Alpes-de-Haute-Provence"),
        ("05", "Hautes-Alpes"),
        ("06", "Alpes-Maritimes"),
        ("07", "Ardèche"),
        ("08", "Ardennes"),
        ("09", "Ariège"),
        ("10", "Aube"),
        ("11", "Aude"),
        ("12", "Aveyron"),
        ("13", "Bouches-du-Rhône"),
        ("14", "Calvados"),
        ("15", "Cantal"),
        ("16", "Charente"),
        ("17", "Charente-Maritime"),
        ("18", "Cher"),
        ("19", "Corrèze"),
        ("21", "Côte-d'Or"),
        ("22", "Côtes-d'Armor"),
        ("23", "Creuse"),
        ("24", "Dordogne"),
        ("25", "Doubs"),
        ("26", "Drôme"),
        ("27", "Eure"),
        ("28", "Eure-et-Loir"),
        ("29", "Finistère"),
        ("2A", "Corse-du-Sud"),
        ("2B", "Haute-Corse"),
        ("30", "Gard"),
        ("31", "Haute-Garonne"),
        ("32", "Gers"),
        ("33", "Gironde"),
        ("34", "Hérault"),
        ("35", "Ille-et-Vilaine"),
        ("36", "Indre"),
        ("37", "Indre-et-Loire"),
        ("38", "Isère"),
        ("39", "Jura"),
        ("40", "Landes"),
        ("41", "Loir-et-Cher"),
        ("42", "Loire"),
        ("43", "Haute-Loire"),
        ("44", "Loire-Atlantique"),
        ("45", "Loiret"),
        ("46", "Lot"),
        ("47", "Lot-et-Garonne"),
        ("48", "Lozère"),
        ("49", "Maine-et-Loire"),
        ("50", "Manche"),
        ("51", "Marne"),
        ("52", "Haute-Marne"),
        ("53", "Mayenne"),
        ("54", "Meurthe-et-Moselle"),
        ("55", "Meuse"),
        ("56", "Morbihan"),
        ("57", "Moselle"),
        ("58", "Nièvre"),
        ("59", "Nord"),
        ("60", "Oise"),
        ("61", "Orne"),
        ("62", "Pas-de-Calais"),
        ("63", "Puy-de-Dôme"),
        ("64", "Pyrénées-Atlantiques"),
        ("65", "Hautes-Pyrénées"),
        ("66", "Pyrénées-Orientales"),
        ("67", "Bas-Rhin"),
        ("68", "Haut-Rhin"),
        ("69", "Rhône"),
        ("70", "Haute-Saône"),
        ("71", "Saône-et-Loire"),
        ("72", "Sarthe"),
        ("73", "Savoie"),
        ("74", "Haute-Savoie"),
        ("75", "Paris"),
        ("76", "Seine-Maritime"),
        ("77", "Seine-et-Marne"),
        ("78", "Yvelines"),
        ("79", "Deux-Sèvres"),
        ("80", "Somme"),
        ("81", "Tarn"),
        ("82", "Tarn-et-Garonne"),
        ("83", "Var"),
        ("84", "Vaucluse"),
        ("85", "Vendée"),
        ("86", "Vienne"),
        ("87", "Haute-Vienne"),
        ("88", "Vosges"),
        ("89", "Yonne"),
        ("90", "Territoire de Belfort"),
        ("91", "Essonne"),
        ("92", "Hauts-de-Seine"),
        ("93", "Seine-Saint-Denis"),
        ("94", "Val-de-Marne"),
        ("95", "Val-d'Oise"),
        ("971", "Guadeloupe"),
        ("972", "Martinique"),
        ("973", "Guyane"),
        ("974", "La Réunion"),
        ("976", "Mayotte"),
    ]

    created_count = 0
    skipped_count = 0

    for code, name in french_departments:
        existing_state = await State.query.filter(code=code, country=france).first()

        if not existing_state:
            await State.query.create(code=code, name=name, country=france)
            created_count += 1
        else:
            skipped_count += 1

    console.print(
        f"[green]States: {created_count} created, {skipped_count} already exist[/green]"
    )
