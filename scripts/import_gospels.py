"""Import the four eBible fraLSG USFM files without editorial notes or Strong tags."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = {"MAT": ("matthieu", "Matthieu", 28), "MRK": ("marc", "Marc", 16), "LUK": ("luc", "Luc", 24), "JHN": ("jean", "Jean", 21)}


def plain(value: str) -> str:
    value = re.sub(r"\\(?:x|f)\b.*?\\(?:x|f)\*", "", value)
    value = re.sub(r"\\\+?w\s+([^|\\]+)\|[^\\]*\\\+?w\*", r"\1", value)
    value = re.sub(r"\\(?:wj|add|nd|qt|bk|it|bd|sc|em|no)\*", "", value)
    value = re.sub(r"\\(?:wj|add|nd|qt|bk|it|bd|sc|em|no)\s+", "", value)
    value = re.sub(r"\\[a-zA-Z0-9+*]+\s*", "", value)
    return re.sub(r"\s+", " ", value).strip()


def parse(path: Path, slug: str, title: str, expected_chapters: int):
    verses = []
    chapter = None
    current = None
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if match := re.match(r"^\\c\s+(\d+)", line):
            chapter = int(match.group(1))
            current = None
        elif match := re.match(r"^\\v\s+(\d+)(?:\s|$)(.*)", line):
            if chapter is None:
                raise ValueError(f"Verse before chapter in {path}")
            number = int(match.group(1))
            current = {"number": number, "text": plain(match.group(2))}
            verses.append((chapter, current))
        elif current and re.match(r"^\\(?:p|m|q\d?|pi\d?|nb|b)\b", line):
            continuation = plain(re.sub(r"^\\[a-zA-Z0-9]+\s*", "", line))
            if continuation:
                current["text"] += " " + continuation
    chapters = []
    for n in range(1, expected_chapters + 1):
        selected = [v for c, v in verses if c == n]
        numbers = [v["number"] for v in selected]
        if numbers != list(range(1, len(numbers) + 1)) or not selected:
            raise ValueError(f"Missing or duplicate verses: {slug} {n}: {numbers}")
        for v in selected:
            if not v["text"] or "\\" in v["text"]:
                raise ValueError(f"Unparsed verse: {slug} {n}:{v['number']} {v['text']}")
            v["hash"] = hashlib.sha256(v["text"].encode()).hexdigest()
        chapters.append({"number": n, "verses": selected})
    return {"slug": slug, "name": title, "chapters": chapters}


def main():
    books = []
    for code, (slug, title, count) in BOOKS.items():
        paths = list((ROOT / "content/source").glob(f"*{code}*.usfm"))
        if len(paths) != 1:
            raise ValueError(f"Expected one source for {code}")
        books.append(parse(paths[0], slug, title, count))
    output = {"translation": "ls1910", "source": "https://ebible.org/details.php?id=fraLSG", "books": books}
    target = ROOT / "content/processed/gospels.json"
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n")
    report = {"translation": "ls1910", "books": {b["slug"]: {"chapters": len(b["chapters"]), "verses": sum(len(c["verses"]) for c in b["chapters"])} for b in books}, "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}
    (ROOT / "content/processed/import-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
