"""Registry of specialized subagents the coordinator can delegate to. Add a
new subagent by writing a `subagents/<name>.py` module with its own
SYSTEM_PROMPT + `node(state)` + `SPEC`, then listing it here - no other file
needs to change."""
from app.agents.state import SubagentSpec
from app.agents.subagents import lost_in_city, war_crisis

SUBAGENTS: dict[str, SubagentSpec] = {
    spec.name: spec for spec in [lost_in_city.SPEC, war_crisis.SPEC]
}
