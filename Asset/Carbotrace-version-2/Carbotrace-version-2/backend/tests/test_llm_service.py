import pytest
from backend.app.services.llm_service import generate_static_recommendations, generate_recommendations


def test_generate_static_recommendations():
    mock_analysis = {
        "total_score": 6.5,
        "code_carbon": 350.0,
        "ci_carbon": 200.0,
        "infra_carbon": 1200.0,
        "layers": {
            "code": {
                "breakdown": {
                    "dependencies": {"num_dependencies": 50, "size_mb": 200.0},
                    "ast_patterns": {"nested_loops": 2, "n_plus_one_queries": 1, "unused_imports": 3}
                }
            },
            "ci": {
                "breakdown": {"missing_caching": 1}
            },
            "infra": {
                "breakdown": {"num_instances": 2}
            }
        }
    }

    recs = generate_static_recommendations(mock_analysis)
    assert len(recs) >= 3
    issues = [r["issue"] for r in recs]
    assert any("High dependency count" in i for i in issues)
    assert any("nested loop" in i for i in issues)
    assert any("N+1 database queries" in i for i in issues)
    assert any("Missing dependency caching" in i for i in issues)


@pytest.mark.asyncio
async def test_generate_recommendations_fallback():
    mock_analysis = {
        "total_score": 2.0,
        "code_carbon": 50.0,
        "ci_carbon": 10.0,
        "infra_carbon": 0.0,
        "layers": {
            "code": {"breakdown": {}},
            "ci": {"breakdown": {}},
            "infra": {"breakdown": {}}
        }
    }

    # Should fall back gracefully to static rules if Ollama server is offline
    recs = await generate_recommendations(mock_analysis)
    assert isinstance(recs, list)
    assert len(recs) > 0
