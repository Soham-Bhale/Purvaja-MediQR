import logging
import sys
from backend.app.config import settings


def setup_logger() -> logging.Logger:
    logger = logging.getLogger(settings.APP_NAME)
    
    # Avoid duplicate handlers if setup multiple times
    if logger.handlers:
        return logger

    level = logging.DEBUG if settings.DEBUG else logging.INFO
    logger.setLevel(level)

    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Standard out handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    stdout_handler.setLevel(level)
    logger.addHandler(stdout_handler)

    return logger


logger = setup_logger()
