from fastapi import APIRouter
import config

router = APIRouter()

@router.get("/")
def get_all_rules():
    return {name: getattr(config, name) for name in dir(config) if name.isupper()}