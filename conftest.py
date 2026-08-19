"""Root pytest configuration.

Loads FastEdgy's test toolkit as a plugin so its database-lifecycle and HTTP
fixtures (`setup_openapi_app`, `setup_db`, `setup_http`, `anyio_backend`, …) are
available to every test without re-importing them into each conftest (which would
shadow them when requested as fixture parameters).

They create and drop a separate `<database>-test` database: the development one is
never touched. Project-specific fixtures live in `server/tests/conftest.py`.
"""

pytest_plugins = ["fastedgy.test.fixtures"]
