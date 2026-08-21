from fastedgy.config import BaseSettings


class AppSettings(BaseSettings):
    title: str = "FastEdgy"
    available_locales: list[str] = ["fr"]
    fallback_locale: str = "fr"
    api_docs: bool = True
