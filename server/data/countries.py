"""The countries, loaded by `kt db init-data`.

The departments in `states.py` hang off France through `ref("country_fr")`: the
key holds from one database to the next, the id does not.
"""

from fastedgy.orm.loader import id

data = [
    {
        "id": id("country_fr"),
        "code": "FR",
        "name": "France",
    },
]
