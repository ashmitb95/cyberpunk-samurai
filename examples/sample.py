from dataclasses import dataclass

@dataclass
class District:
    name: str
    power: int = 0xFCEE0A

    def glow(self, level: int = 5) -> str:
        # jack into the grid
        return f"{self.name}: {'online' if level > 0 else 'offline'}"

tygers = District("japantown")
print(tygers.glow())
