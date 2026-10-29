import os
import logging
from typing import Dict, List, Any, Optional
from tree_sitter import Parser, Language
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_go as tsgo

logger = logging.getLogger(__name__)

# Initialize tree-sitter languages
try:
    PY_LANGUAGE = Language(tspython.language())
    JS_LANGUAGE = Language(tsjavascript.language())
    GO_LANGUAGE = Language(tsgo.language())
except Exception as e:
    logger.error(f"Error loading tree-sitter grammars: {e}")
    PY_LANGUAGE = None
    JS_LANGUAGE = None
    GO_LANGUAGE = None


def get_parser_for_file(file_extension: str) -> Optional[Parser]:
    """Get the appropriate tree-sitter Parser for a given file extension."""
    if not PY_LANGUAGE:
        return None
        
    parser = Parser()
    if file_extension == ".py":
        parser.language = PY_LANGUAGE
        return parser
    elif file_extension in (".js", ".ts", ".jsx", ".tsx"):
        parser.language = JS_LANGUAGE
        return parser
    elif file_extension == ".go":
        parser.language = GO_LANGUAGE
        return parser
    return None


def count_nested_loops(node, current_depth: int = 0) -> int:
    """Recursively count nested loops (loops inside loops)."""
    loop_types = {
        "for_statement", "while_statement", "for_in_statement", 
        "do_statement", "for_range_statement"
    }
    
    is_loop = node.type in loop_types
    new_depth = current_depth + 1 if is_loop else current_depth
    
    count = 0
    if is_loop and current_depth >= 1:
        count += 1  # This loop is nested inside another loop

    for child in node.children:
        count += count_nested_loops(child, new_depth)
        
    return count


def count_n_plus_one_queries(node, inside_loop: bool = False) -> int:
    """Recursively count potential N+1 query patterns (DB calls inside loops)."""
    loop_types = {
        "for_statement", "while_statement", "for_in_statement", 
        "do_statement", "for_range_statement"
    }
    
    is_loop = node.type in loop_types
    current_inside_loop = inside_loop or is_loop
    
    count = 0
    if inside_loop:
        # Check for DB execution keywords in call expressions
        is_call = node.type in ("call", "call_expression")
        if is_call:
            try:
                # Read content / text of the node if possible
                node_text = node.text.decode("utf-8", errors="ignore")
                db_keywords = [
                    ".execute(", ".query(", ".select(", "db.", "session.", 
                    ".filter(", ".get(", "session.query", "select("
                ]
                if any(kw in node_text for kw in db_keywords):
                    count += 1
            except Exception:
                pass
                
    for child in node.children:
        count += count_n_plus_one_queries(child, current_inside_loop)
        
    return count


def find_unused_imports_details(file_content: str, file_ext: str) -> List[Dict[str, Any]]:
    """Statically identify unused imports with their names and line numbers (1-indexed)."""
    unused_imports = []
    imported_names_with_lines = []
    
    lines = file_content.splitlines()
    if file_ext == ".py":
        # Match 'import name' or 'import name as alias' or 'from module import name as alias, name2'
        for i, line in enumerate(lines):
            line_strip = line.strip()
            if line_strip.startswith("import ") or line_strip.startswith("from "):
                line_clean = line_strip.split("#")[0].strip()
                if line_clean.startswith("import "):
                    parts = line_clean[7:].split(",")
                    for part in parts:
                        part = part.strip()
                        if " as " in part:
                            name = part.split(" as ")[1].strip()
                        else:
                            name = part.split(".")[0].strip()
                        if name:
                            imported_names_with_lines.append((name, i + 1))
                elif " import " in line_clean:
                    parts = line_clean.split(" import ")[1].split(",")
                    for part in parts:
                        part = part.strip()
                        if " as " in part:
                            name = part.split(" as ")[1].strip()
                        else:
                            name = part.strip()
                        if name:
                            imported_names_with_lines.append((name, i + 1))
                            
        for name, line_num in imported_names_with_lines:
            escaped_name = re.escape(name)
            pattern = re.compile(rf"\b{escaped_name}\b")
            occurrences = 0
            for l in lines:
                if l.strip().startswith("import ") or l.strip().startswith("from "):
                    continue
                if pattern.search(l):
                    occurrences += 1
            if occurrences == 0:
                unused_imports.append({"name": name, "line": line_num})

    elif file_ext in (".js", ".ts", ".jsx", ".tsx"):
        for i, line in enumerate(lines):
            line_strip = line.strip()
            if line_strip.startswith("import ") and "from" in line_strip:
                clause = line_strip[7:].split("from")[0].strip()
                raw_names = clause.replace("{", "").replace("}", "").split(",")
                for n in raw_names:
                    name = n.strip().split(" as ")[-1].strip()
                    if name:
                        imported_names_with_lines.append((name, i + 1))
                                
        for name, line_num in imported_names_with_lines:
            escaped_name = re.escape(name)
            pattern = re.compile(rf"\b{escaped_name}\b")
            occurrences = 0
            for l in lines:
                if l.strip().startswith("import "):
                    continue
                if pattern.search(l):
                    occurrences += 1
            if occurrences == 0:
                unused_imports.append({"name": name, "line": line_num})

    return unused_imports


import re

async def analyze_ast_patterns(repo_dir: str) -> Dict[str, Any]:
    """Scan the repository for files and parse their ASTs using tree-sitter.

    Calculates scores for nested loops, N+1 queries, unused imports, and large files.
    """
    total_nested_loops = 0
    total_n_plus_one = 0
    total_unused_imports = 0
    unused_imports_details = []
    large_files_count = 0
    total_files_scanned = 0

    supported_extensions = {".py", ".js", ".ts", ".jsx", ".tsx", ".go"}

    for root, _, files in os.walk(repo_dir):
        # Skip git folders and venv folders
        if any(part in root.split(os.sep) for part in (".git", ".venv", "venv", "node_modules", "__pycache__")):
            continue
            
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext not in supported_extensions:
                continue

            file_path = os.path.join(root, file)
            total_files_scanned += 1
            
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                
                # Check large file (LOC > 500)
                lines_count = len(content.splitlines())
                if lines_count > 500:
                    large_files_count += 1

                # Parse AST
                parser = get_parser_for_file(ext)
                if parser:
                    tree = parser.parse(bytes(content, "utf8"))
                    root_node = tree.root_node
                    
                    # Count AST patterns
                    total_nested_loops += count_nested_loops(root_node)
                    total_n_plus_one += count_n_plus_one_queries(root_node)
                
                # Unused imports details
                rel_path = os.path.relpath(file_path, repo_dir)
                # Convert backslashes to forward slashes for cross-platform links
                rel_path_formatted = rel_path.replace("\\", "/")
                file_unused = find_unused_imports_details(content, ext)
                for item in file_unused:
                    unused_imports_details.append({
                        "file": rel_path_formatted,
                        "name": item["name"],
                        "line": item["line"]
                    })
                total_unused_imports += len(file_unused)
                
            except Exception as e:
                logger.error(f"Error analyzing AST for file {file_path}: {e}")

    # Efficiency penalty scoring (dimensionless points, not grams CO2)
    # Per GREENS 2025 / ICSE 2025: static AST analysis detects efficiency
    # *signals*, not actual carbon measurements. These are relative deductions
    # from a perfect eco-score.
    #   Nested loops:    3 points each (computational complexity signal)
    #   N+1 queries:     5 points each (database inefficiency signal)
    #   Unused imports:  0.5 points each (dead code / bloat signal)
    #   Large files:     1 point each (maintainability signal)
    penalty_points = (
        (total_nested_loops * 3.0)
        + (total_n_plus_one * 5.0)
        + (total_unused_imports * 0.5)
        + (large_files_count * 1.0)
    )
    # Cap penalty at 40 points to avoid overwhelming the eco-score
    penalty_points = min(penalty_points, 40.0)

    return {
        "files_scanned": total_files_scanned,
        "nested_loops": total_nested_loops,
        "n_plus_one_queries": total_n_plus_one,
        "unused_imports": total_unused_imports,
        "unused_imports_details": unused_imports_details,
        "large_files": large_files_count,
        "penalty_points": round(penalty_points, 1),
        "carbon": round(penalty_points, 1)  # kept as "carbon" key for backward compat
    }
