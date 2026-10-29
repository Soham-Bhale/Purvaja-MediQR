import pytest
import os
from backend.app.services.ast_analyzer import (
    find_unused_imports_details,
    analyze_ast_patterns
)


def test_find_unused_imports_python():
    py_code = """import os
import sys
import math

print(os.getenv('PATH'))
"""
    unused = find_unused_imports_details(py_code, ".py")
    unused_names = [u["name"] for u in unused]
    assert "sys" in unused_names
    assert "math" in unused_names
    assert "os" not in unused_names


def test_find_unused_imports_javascript():
    js_code = """import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

export default function App() {
  const [val, setVal] = useState(0);
  return <div>{val}</div>;
}
"""
    unused = find_unused_imports_details(js_code, ".js")
    unused_names = [u["name"] for u in unused]
    assert "useEffect" in unused_names
    assert "Leaf" in unused_names
    assert "useState" not in unused_names


@pytest.mark.asyncio
async def test_analyze_ast_patterns(temp_repo_dir):
    sample_py = os.path.join(temp_repo_dir, "sample.py")
    with open(sample_py, "w", encoding="utf-8") as f:
        f.write("""import unused_lib

for i in range(10):
    for j in range(10):
        print(i, j)
""")

    results = await analyze_ast_patterns(temp_repo_dir)
    assert results["files_scanned"] == 1
    assert results["nested_loops"] >= 1
    assert results["unused_imports"] >= 1
    assert results["carbon"] > 0
